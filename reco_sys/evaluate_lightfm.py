import pandas as pd
import numpy as np
import time
from lightfm import LightFM
from lightfm.evaluation import precision_at_k, auc_score
from scipy.sparse import coo_matrix
import warnings
import traceback
warnings.filterwarnings('ignore')

try:
    print("Loading data...")
    try:
        df = pd.read_csv('./processed_data/hybrid_ready.csv')
    except FileNotFoundError:
        df = pd.read_csv('./processed_data/interactions.csv')

    user_map = {u: i for i, u in enumerate(df['user_id'].unique())}
    item_map = {u: i for i, u in enumerate(df['item_id'].unique())}
    df['user_idx'] = df['user_id'].map(user_map)
    df['item_idx'] = df['item_id'].map(item_map)

    print(f"Dataset: {len(df)} interactions | {len(user_map)} users | {len(item_map)} items")

    train_df = df.sample(frac=0.8, random_state=42)
    test_df = df.drop(train_df.index)

    def create_sparse(data, shape):
        return coo_matrix((data['rating'].values, (data['user_idx'].values, data['item_idx'].values)), shape=shape)

    n_u, n_i = len(user_map), len(item_map)
    train_mat = create_sparse(train_df, (n_u, n_i))
    test_mat = create_sparse(test_df, (n_u, n_i))

    print("Training LightFM (logistic loss)...")
    # Using Logistic because WARP and BPR caused fatal C extension crashes
    model = LightFM(loss='logistic', no_components=50, learning_rate=0.05, random_state=42)
    t0 = time.time()
    model.fit(train_mat, epochs=20, num_threads=1)
    train_time = time.time() - t0
    print(f"Training time: {train_time:.2f}s")

    print("Evaluating...")
    test_user_idx = test_df['user_idx'].values
    test_item_idx = test_df['item_idx'].values
    true_ratings = test_df['rating'].values

    preds = model.predict(test_user_idx, test_item_idx, num_threads=1)
    p_min, p_max = preds.min(), preds.max()
    if p_max > p_min:
        scaled_preds = ((preds - p_min) / (p_max - p_min)) * 4.0 + 1.0
    else:
        scaled_preds = np.full_like(preds, 3.0)

    rmse = np.sqrt(np.mean((scaled_preds - true_ratings)**2))
    mae = np.mean(np.abs(scaled_preds - true_ratings))
    acc = np.mean(np.abs(scaled_preds - true_ratings) <= 0.5)

    test_df_rel = test_df[test_df['rating'] >= 3.0]
    test_mat_bin = coo_matrix((np.ones(len(test_df_rel)), (test_df_rel['user_idx'].values, test_df_rel['item_idx'].values)), shape=(n_u, n_i))
    train_mat_bin = coo_matrix((np.ones(len(train_df)), (train_df['user_idx'].values, train_df['item_idx'].values)), shape=(n_u, n_i))

    prec = precision_at_k(model, test_mat_bin, train_interactions=train_mat_bin, k=10, num_threads=1).mean()

    hit_list = []
    for u in test_df_rel['user_idx'].unique():
        user_test_items = test_df_rel[test_df_rel['user_idx'] == u]['item_idx'].values
        if len(user_test_items) == 0: continue
        scores = model.predict(np.full(n_i, u), np.arange(n_i))
        train_i = train_df[train_df['user_idx'] == u]['item_idx'].values
        scores[train_i] = -np.inf
        top10 = np.argsort(-scores)[:10]
        hits = len(set(top10).intersection(set(user_test_items)))
        hit_list.append(hits / len(user_test_items))

    recall = np.mean(hit_list)

    print("="*40)
    print(f"Metric               | LightFM")
    print("-" * 40)
    print(f"RMSE                 | {rmse:.4f}")
    print(f"MAE                  | {mae:.4f}")
    print(f"Precision@10         | {prec:.4f}")
    print(f"Recall@10            | {recall:.4f}")
    print(f"Accuracy (±0.5)      | {acc:.4f}")
    print(f"Training Time (s)    | {train_time:.2f}")
    print("="*40)

except Exception as e:
    print("\n[ERROR DETECTED]")
    traceback.print_exc()

