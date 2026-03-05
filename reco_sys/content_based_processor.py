"""
content_based_processor.py
===========================
Processes items_metadata.csv (output of data_processor.py) into
algorithm-ready features for all 3 content-based algorithms:
    1. TF-IDF + Cosine Similarity
    2. Word2Vec / Item Embeddings
    3. Random Forest Profile Matching

Output files (in ./content_based_data/):
    items_features.csv          ← clean scalar columns + metadata
    tfidf_matrix.npz            ← sparse TF-IDF matrix (rows = items)
    w2v_matrix.npy              ← dense Word2Vec matrix (rows = items)
    tfidf_vectorizer.pkl        ← fitted TF-IDF vectorizer
    w2v_model.pkl               ← fitted Word2Vec model
    label_encoder.pkl           ← fitted LabelEncoder for category
    scaler.pkl                  ← fitted MinMaxScaler for price + rating

Usage:
    python content_based_processor.py \
        --metadata ./processed_data/items_metadata.csv \
        --interactions ./processed_data/interactions.csv \
        --output_dir ./content_based_data
"""

import os
import re
import pickle
import argparse
import warnings
import numpy as np
import pandas as pd
import scipy.sparse as sp

from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from gensim.models import Word2Vec

warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────────────────────
# STEP 1 — LOAD & VALIDATE item_id
# ─────────────────────────────────────────────────────────────

def step1_load_and_validate(metadata_path: str, interactions_path: str) -> pd.DataFrame:
    print("\n── STEP 1: Load & Validate item_id ──────────────────────")

    df = pd.read_csv(metadata_path, low_memory=False)
    print(f"  Loaded {len(df):,} rows from {os.path.basename(metadata_path)}")

    # Drop rows where item_id is null
    before = len(df)
    df = df.dropna(subset=["item_id"])
    if before - len(df) > 0:
        print(f"  Dropped {before - len(df):,} rows with null item_id")

    # Remove duplicates — keep row with most non-null values
    df["_non_null_count"] = df.notna().sum(axis=1)
    df = df.sort_values("_non_null_count", ascending=False)
    df = df.drop_duplicates(subset="item_id", keep="first")
    df = df.drop(columns=["_non_null_count"])
    print(f"  After dedup: {len(df):,} unique items")

    # Filter to items that exist in interactions (remove dead items)
    if interactions_path and os.path.exists(interactions_path):
        interactions = pd.read_csv(interactions_path, usecols=["item_id"])
        valid_items = set(interactions["item_id"].astype(str))
        before = len(df)
        df = df[df["item_id"].astype(str).isin(valid_items)]
        print(f"  Filtered to items in interactions: {before:,} → {len(df):,}")
    else:
        print("  [SKIP] No interactions file provided — keeping all items")

    df["item_id"] = df["item_id"].astype(str).str.strip()
    print(f"  ✅ item_id: {df['item_id'].nunique():,} unique, 0 nulls")
    return df.reset_index(drop=True)


# ─────────────────────────────────────────────────────────────
# STEP 2 — FIX BRAND / CATEGORY / SUB_CATEGORY
# ─────────────────────────────────────────────────────────────

def step2_fix_categorical_fields(df: pd.DataFrame) -> pd.DataFrame:
    print("\n── STEP 2: Fix brand / category / sub_category ──────────")

    for col in ["brand", "category", "sub_category"]:
        if col not in df.columns:
            df[col] = "Unknown"
            print(f"  Created missing column: {col}")
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace({"nan": "Unknown", "": "Unknown", "None": "Unknown"})

    # Try to recover "Unknown" categories from sub_category
    unknown_cat_mask = df["category"] == "Unknown"
    recoverable = unknown_cat_mask & (df["sub_category"] != "Unknown")
    df.loc[recoverable, "category"] = df.loc[recoverable, "sub_category"]
    if recoverable.sum() > 0:
        print(f"  Recovered {recoverable.sum():,} categories from sub_category")

    # Try to recover "Unknown" brands from title (first word heuristic)
    unknown_brand_mask = df["brand"] == "Unknown"
    if "title" in df.columns:
        recovered_brands = df.loc[unknown_brand_mask, "title"].str.split().str[0].str.title()
        df.loc[unknown_brand_mask, "brand"] = recovered_brands.fillna("Unknown")
        recovered = (df["brand"] != "Unknown") & unknown_brand_mask
        if recovered.sum() > 0:
            print(f"  Recovered {recovered.sum():,} brands from title (first word)")

    # Report Unknown percentage
    for col in ["category", "brand"]:
        pct = (df[col] == "Unknown").mean() * 100
        status = "✅" if pct <= 5 else "⚠️ "
        print(f"  {status} '{col}' Unknown: {pct:.1f}%  (target ≤ 5%)")

    return df


# ─────────────────────────────────────────────────────────────
# STEP 3 — FIX PRICE
# ─────────────────────────────────────────────────────────────

def step3_fix_price(df: pd.DataFrame) -> pd.DataFrame:
    print("\n── STEP 3: Fix price ────────────────────────────────────")

    if "price" not in df.columns:
        df["price"] = np.nan
        print("  Created missing price column")

    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    # Remove clearly invalid prices
    df.loc[df["price"] <= 0, "price"] = np.nan
    df.loc[df["price"] > 10000, "price"] = np.nan

    missing = df["price"].isna().sum()
    median_price = df["price"].median()
    df["price"] = df["price"].fillna(median_price).round(2)

    print(f"  Filled {missing:,} missing prices with median: ${median_price:.2f}")
    print(f"  Price range: ${df['price'].min():.2f} – ${df['price'].max():.2f}")
    print(f"  ✅ price: 0 nulls")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 4 — FIX AVG_RATING
# ─────────────────────────────────────────────────────────────

def step4_fix_avg_rating(df: pd.DataFrame) -> pd.DataFrame:
    print("\n── STEP 4: Fix avg_rating ───────────────────────────────")

    if "avg_rating" not in df.columns:
        df["avg_rating"] = np.nan
        print("  Created missing avg_rating column")

    df["avg_rating"] = pd.to_numeric(df["avg_rating"], errors="coerce")
    df.loc[~df["avg_rating"].between(1.0, 5.0), "avg_rating"] = np.nan

    missing = df["avg_rating"].isna().sum()
    global_mean = df["avg_rating"].mean()
    df["avg_rating"] = df["avg_rating"].fillna(global_mean).round(2)

    if "rating_number" not in df.columns:
        df["rating_number"] = 0
    df["rating_number"] = pd.to_numeric(df["rating_number"], errors="coerce").fillna(0).astype(int)

    print(f"  Filled {missing:,} missing avg_ratings with global mean: {global_mean:.2f}")
    print(f"  Rating range: {df['avg_rating'].min():.2f} – {df['avg_rating'].max():.2f}")
    print(f"  ✅ avg_rating: 0 nulls")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 5 — BUILD CONTENT COLUMN (20-word minimum)
# ─────────────────────────────────────────────────────────────

def _clean_text(text: str) -> str:
    """Lowercase, remove special chars, normalize whitespace."""
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def step5_build_content_column(df: pd.DataFrame) -> pd.DataFrame:
    print("\n── STEP 5: Build content column ─────────────────────────")

    for col in ["title", "description", "tags", "category", "sub_category", "brand"]:
        if col not in df.columns:
            df[col] = ""
        df[col] = df[col].fillna("").astype(str)

    # Build rich content string from all text fields
    df["content"] = (
        df["title"] + " " +
        df["category"] + " " +
        df["sub_category"] + " " +
        df["brand"] + " " +
        df["tags"] + " " +
        df["description"]
    ).apply(_clean_text)

    # Enforce 20-word minimum
    df["_word_count"] = df["content"].str.split().str.len()
    below_threshold = df["_word_count"] < 20

    # For items below threshold, try to pad with repeated title + category
    if below_threshold.sum() > 0:
        padding = (df.loc[below_threshold, "title"] + " " +
                   df.loc[below_threshold, "category"] + " " +
                   df.loc[below_threshold, "sub_category"]).apply(_clean_text)
        # Repeat up to 5 times to reach minimum
        df.loc[below_threshold, "content"] = (
            df.loc[below_threshold, "content"] + " " + (padding + " ") * 4
        ).apply(_clean_text)
        df["_word_count"] = df["content"].str.split().str.len()

    # Drop items still below 20 words after padding
    still_below = df["_word_count"] < 20
    if still_below.sum() > 0:
        print(f"  Dropped {still_below.sum():,} items with < 20 words after padding")
        df = df[~still_below]

    df = df.drop(columns=["_word_count"])

    word_counts = df["content"].str.split().str.len()
    print(f"  Content word count — min: {word_counts.min()}, "
          f"mean: {word_counts.mean():.0f}, max: {word_counts.max()}")
    print(f"  ✅ content: {len(df):,} items, all ≥ 20 words")
    return df.reset_index(drop=True)


# ─────────────────────────────────────────────────────────────
# STEP 6 — LABEL ENCODE CATEGORY
# ─────────────────────────────────────────────────────────────

def step6_encode_category(df: pd.DataFrame) -> tuple[pd.DataFrame, LabelEncoder]:
    print("\n── STEP 6: Label encode category ───────────────────────")

    le = LabelEncoder()
    df["category_encoded"] = le.fit_transform(df["category"].astype(str))

    print(f"  Categories found : {len(le.classes_):,}")
    print(f"  Encoded range    : 0 – {df['category_encoded'].max()}")
    print(f"  ✅ category_encoded: integer labels, no raw strings")
    return df, le


# ─────────────────────────────────────────────────────────────
# STEP 7 — SCALE PRICE & AVG_RATING
# ─────────────────────────────────────────────────────────────

def step7_scale_numerical(df: pd.DataFrame) -> tuple[pd.DataFrame, MinMaxScaler]:
    print("\n── STEP 7: Scale price & avg_rating ────────────────────")

    scaler = MinMaxScaler()
    df[["price_scaled", "avg_rating_scaled"]] = scaler.fit_transform(
        df[["price", "avg_rating"]]
    ).round(4)

    print(f"  price_scaled     : {df['price_scaled'].min():.4f} – {df['price_scaled'].max():.4f}")
    print(f"  avg_rating_scaled: {df['avg_rating_scaled'].min():.4f} – {df['avg_rating_scaled'].max():.4f}")
    print(f"  ✅ price_scaled + avg_rating_scaled: MinMaxScaler applied")
    return df, scaler


# ─────────────────────────────────────────────────────────────
# STEP 8 — COMPUTE TF-IDF MATRIX
# ─────────────────────────────────────────────────────────────

def step8_compute_tfidf(df: pd.DataFrame) -> tuple[sp.csr_matrix, TfidfVectorizer]:
    print("\n── STEP 8: Compute TF-IDF matrix ────────────────────────")

    vectorizer = TfidfVectorizer(
        max_features=5000,      # vocabulary cap — keeps memory manageable
        ngram_range=(1, 2),     # unigrams + bigrams for richer representation
        min_df=2,               # ignore terms appearing in < 2 documents
        max_df=0.95,            # ignore terms appearing in > 95% of documents
        sublinear_tf=True,      # apply log normalization to term frequency
        strip_accents="unicode",
        analyzer="word",
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(df["content"])

    print(f"  Vocabulary size  : {len(vectorizer.vocabulary_):,} terms")
    print(f"  Matrix shape     : {tfidf_matrix.shape[0]:,} items × {tfidf_matrix.shape[1]:,} features")
    print(f"  Matrix sparsity  : {1 - tfidf_matrix.nnz / (tfidf_matrix.shape[0] * tfidf_matrix.shape[1]):.2%}")
    print(f"  ✅ tfidf_matrix: precomputed, rows align with items_features.csv")
    return tfidf_matrix, vectorizer


# ─────────────────────────────────────────────────────────────
# STEP 9 — COMPUTE WORD2VEC MATRIX
# ─────────────────────────────────────────────────────────────

def step9_compute_word2vec(df: pd.DataFrame) -> tuple[np.ndarray, Word2Vec]:
    print("\n── STEP 9: Compute Word2Vec matrix ─────────────────────")

    # Tokenize content into word lists
    sentences = [text.split() for text in df["content"]]

    # Train Word2Vec
    w2v_model = Word2Vec(
        sentences=sentences,
        vector_size=100,    # embedding dimensions
        window=5,           # context window size
        min_count=2,        # ignore words with freq < 2
        workers=4,          # parallel threads
        epochs=10,          # training passes
        sg=1                # Skip-Gram (better for sparse, diverse text)
    )

    # Build item matrix: average word vectors for each item
    def get_item_vector(tokens: list[str]) -> np.ndarray:
        vectors = [
            w2v_model.wv[word]
            for word in tokens
            if word in w2v_model.wv
        ]
        if vectors:
            return np.mean(vectors, axis=0)
        else:
            return np.zeros(w2v_model.vector_size)

    w2v_matrix = np.array([
        get_item_vector(text.split())
        for text in df["content"]
    ])

    print(f"  Vocabulary size  : {len(w2v_model.wv):,} words")
    print(f"  Vector size      : {w2v_model.vector_size} dimensions")
    print(f"  Matrix shape     : {w2v_matrix.shape[0]:,} items × {w2v_matrix.shape[1]} features")
    zero_vecs = (w2v_matrix.sum(axis=1) == 0).sum()
    print(f"  Zero vectors     : {zero_vecs:,} items (content too rare to embed)")
    print(f"  ✅ w2v_matrix: precomputed, rows align with items_features.csv")
    return w2v_matrix, w2v_model


# ─────────────────────────────────────────────────────────────
# SAVE ALL OUTPUTS
# ─────────────────────────────────────────────────────────────

def save_all(df: pd.DataFrame,
             tfidf_matrix: sp.csr_matrix,
             w2v_matrix: np.ndarray,
             vectorizer: TfidfVectorizer,
             w2v_model: Word2Vec,
             label_encoder: LabelEncoder,
             scaler: MinMaxScaler,
             output_dir: str):

    os.makedirs(output_dir, exist_ok=True)

    # Save main features CSV (no vector columns — stored separately)
    csv_cols = [
        "item_id", "title", "content", "description", "tags",
        "category", "category_encoded", "sub_category",
        "brand", "price", "price_scaled",
        "avg_rating", "avg_rating_scaled", "rating_number"
    ]
    # Only keep columns that exist
    csv_cols = [c for c in csv_cols if c in df.columns]
    df[csv_cols].to_csv(os.path.join(output_dir, "items_features.csv"), index=False)

    # Save matrices
    sp.save_npz(os.path.join(output_dir, "tfidf_matrix.npz"), tfidf_matrix)
    np.save(os.path.join(output_dir, "w2v_matrix.npy"), w2v_matrix)

    # Save fitted models/transformers
    with open(os.path.join(output_dir, "tfidf_vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)
    with open(os.path.join(output_dir, "label_encoder.pkl"), "wb") as f:
        pickle.dump(label_encoder, f)
    with open(os.path.join(output_dir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    w2v_model.save(os.path.join(output_dir, "w2v_model.pkl"))

    print(f"\n── SAVED ────────────────────────────────────────────────")
    print(f"  📄 items_features.csv   → {len(df):,} items, {len(csv_cols)} columns")
    print(f"  🧮 tfidf_matrix.npz     → {tfidf_matrix.shape}")
    print(f"  🧮 w2v_matrix.npy       → {w2v_matrix.shape}")
    print(f"  🔧 tfidf_vectorizer.pkl")
    print(f"  🔧 w2v_model.pkl")
    print(f"  🔧 label_encoder.pkl")
    print(f"  🔧 scaler.pkl")
    print(f"  📁 All saved to: {output_dir}/")


# ─────────────────────────────────────────────────────────────
# FINAL CHECKLIST REPORT
# ─────────────────────────────────────────────────────────────

def print_checklist(df: pd.DataFrame, tfidf_matrix, w2v_matrix):
    print("\n" + "="*55)
    print("     CONTENT-BASED READINESS CHECKLIST")
    print("="*55)

    checks = {
        "item_id: no nulls, no duplicates":
            df["item_id"].notna().all() and df["item_id"].nunique() == len(df),
        "content: all items ≥ 20 words":
            (df["content"].str.split().str.len() >= 20).all(),
        "category Unknown ≤ 5%":
            (df["category"] == "Unknown").mean() <= 0.05,
        "price: 0 nulls":
            df["price"].notna().all(),
        "avg_rating: 0 nulls":
            df["avg_rating"].notna().all(),
        "category_encoded: integer type":
            pd.api.types.is_integer_dtype(df["category_encoded"]),
        "price_scaled: range [0,1]":
            df["price_scaled"].between(0, 1).all(),
        "avg_rating_scaled: range [0,1]":
            df["avg_rating_scaled"].between(0, 1).all(),
        "tfidf_matrix: precomputed":
            tfidf_matrix is not None and tfidf_matrix.shape[0] == len(df),
        "w2v_matrix: precomputed":
            w2v_matrix is not None and w2v_matrix.shape[0] == len(df),
    }

    all_passed = True
    for check, passed in checks.items():
        icon = "✅" if passed else "❌"
        print(f"  {icon}  {check}")
        if not passed:
            all_passed = False

    print("="*55)
    if all_passed:
        print("  🎉 ALL CHECKS PASSED — Data is ready for:")
        print("     → content_based_models.ipynb")
    else:
        print("  ⚠️  Some checks failed — review warnings above")
    print("="*55 + "\n")


# ─────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--metadata",     required=True,  help="Path to items_metadata.csv")
    parser.add_argument("--interactions", default=None,   help="Path to interactions.csv (optional but recommended)")
    parser.add_argument("--output_dir",   default="./content_based_data")
    args = parser.parse_args()

    print("\n" + "="*55)
    print("   CONTENT-BASED PROCESSOR — STARTING PIPELINE")
    print("="*55)

    df = step1_load_and_validate(args.metadata, args.interactions)
    df = step2_fix_categorical_fields(df)
    df = step3_fix_price(df)
    df = step4_fix_avg_rating(df)
    df = step5_build_content_column(df)
    df, label_encoder = step6_encode_category(df)
    df, scaler        = step7_scale_numerical(df)
    tfidf_matrix, vectorizer = step8_compute_tfidf(df)
    w2v_matrix, w2v_model    = step9_compute_word2vec(df)

    save_all(df, tfidf_matrix, w2v_matrix,
             vectorizer, w2v_model, label_encoder, scaler,
             args.output_dir)

    print_checklist(df, tfidf_matrix, w2v_matrix)


if __name__ == "__main__":
    main()
