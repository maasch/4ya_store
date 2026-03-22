"""
train_model.py
==============
Trains an SVD model on the processed interactions data and saves it to disk.

Usage:
    cd d:\\DEV\\4YA_Store\\backend\\svd_service
    python train_model.py

Output:
    - svd_model.pkl          : trained SVD model
    - item_ids.pkl           : list of all item IDs in the dataset
    - user_ids.pkl           : list of all user IDs in the dataset
    - Prints Accuracy, Precision@10, Recall@10 metrics
"""

import os
import joblib
import pandas as pd
from surprise import SVD, Dataset, Reader, accuracy
from surprise.model_selection import train_test_split

# ── Paths ──────────────────────────────────────────────────────
INTERACTIONS_PATH = os.path.join(
    os.path.dirname(__file__), '..', '..', 'reco_sys', 'processed_data', 'interactions.csv'
)
OUTPUT_DIR = os.path.dirname(__file__)


# ── Accuracy metric ────────────────────────────────────────────
def compute_accuracy(predictions, threshold=0.5):
    """Fraction of predictions within ±threshold of the actual rating."""
    if not predictions:
        return 0.0
    correct = sum(1 for p in predictions if abs(p.est - p.r_ui) <= threshold)
    return correct / len(predictions)


# ── Precision / Recall @ K ─────────────────────────────────────
def precision_recall_at_k(predictions, k=10, threshold=3.5):
    """
    Compute Precision@K and Recall@K for each user, then average.
    A relevant item is one with true rating >= threshold.
    """
    from collections import defaultdict

    user_est_true = defaultdict(list)
    for pred in predictions:
        user_est_true[pred.uid].append((pred.est, pred.r_ui))

    precisions = []
    recalls = []

    for uid, user_ratings in user_est_true.items():
        # Sort by estimated rating (descending)
        user_ratings.sort(key=lambda x: x[0], reverse=True)
        top_k = user_ratings[:k]

        n_relevant = sum(1 for (_, true_r) in user_ratings if true_r >= threshold)
        n_relevant_in_top_k = sum(1 for (_, true_r) in top_k if true_r >= threshold)

        precisions.append(n_relevant_in_top_k / k if k > 0 else 0)
        recalls.append(
            n_relevant_in_top_k / n_relevant if n_relevant > 0 else 0
        )

    return sum(precisions) / len(precisions), sum(recalls) / len(recalls)


def main():
    print("=" * 60)
    print("  SVD MODEL TRAINING")
    print("=" * 60)

    # ── Load data ──────────────────────────────────────────────
    interactions_path = os.path.normpath(INTERACTIONS_PATH)
    print(f"\n[1/5] Loading interactions from: {interactions_path}")
    df = pd.read_csv(interactions_path)
    print(f"      Loaded {len(df):,} interactions")
    print(f"      Users: {df['user_id'].nunique():,}  |  Items: {df['item_id'].nunique():,}")

    # ── Prepare surprise dataset ───────────────────────────────
    print("\n[2/5] Preparing dataset for surprise library...")
    reader = Reader(rating_scale=(1.0, 5.0))
    data = Dataset.load_from_df(df[['user_id', 'item_id', 'rating']], reader)

    # ── Train/test split ───────────────────────────────────────
    print("\n[3/5] Splitting into train (80%) / test (20%)...")
    trainset, testset = train_test_split(data, test_size=0.2, random_state=42)

    # ── Train SVD ──────────────────────────────────────────────
    print("\n[4/5] Training SVD model...")
    algo = SVD(n_factors=100, n_epochs=20, lr_all=0.005, reg_all=0.02, random_state=42)
    algo.fit(trainset)
    print("      Training complete!")

    # ── Evaluate ───────────────────────────────────────────────
    print("\n[5/5] Evaluating on test set...")
    predictions = algo.test(testset)

    rmse = accuracy.rmse(predictions, verbose=False)
    mae = accuracy.mae(predictions, verbose=False)
    acc = compute_accuracy(predictions, threshold=0.5)
    prec, rec = precision_recall_at_k(predictions, k=10, threshold=3.5)

    print("\n" + "=" * 60)
    print("  EVALUATION RESULTS")
    print("=" * 60)
    print(f"  RMSE          : {rmse:.4f}")
    print(f"  MAE           : {mae:.4f}")
    print(f"  Accuracy (±0.5): {acc:.4f}")
    print(f"  Precision@10  : {prec:.4f}")
    print(f"  Recall@10     : {rec:.4f}")
    print("=" * 60)

    # ── Save model and metadata ────────────────────────────────
    model_path = os.path.join(OUTPUT_DIR, 'svd_model.pkl')
    item_ids_path = os.path.join(OUTPUT_DIR, 'item_ids.pkl')
    user_ids_path = os.path.join(OUTPUT_DIR, 'user_ids.pkl')

    # Train on FULL dataset for production model
    print("\n  Retraining on full dataset for production...")
    full_trainset = data.build_full_trainset()
    algo.fit(full_trainset)

    joblib.dump(algo, model_path)
    joblib.dump(df['item_id'].unique().tolist(), item_ids_path)
    joblib.dump(df['user_id'].unique().tolist(), user_ids_path)

    print(f"\n  Model saved to: {model_path}")
    print(f"  Item IDs saved to: {item_ids_path}")
    print(f"  User IDs saved to: {user_ids_path}")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    main()
