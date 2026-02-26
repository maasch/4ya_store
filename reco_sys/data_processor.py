"""
data_processor.py
=================
Processes Amazon JSONL review and metadata files into clean,
algorithm-ready DataFrames for all 8 recommendation algorithms.

Output files:
    - interactions.csv       → For CF algorithms (User-Based, Item-Based, SVD/ALS)
    - items_metadata.csv     → For Content-Based algorithms (TF-IDF, Word2Vec, Random Forest)
    - hybrid_ready.csv       → For Hybrid algorithms (Weighted Hybrid, LightFM)
    - user_item_matrix.csv   → Pivot matrix ready for CF (optional, can be heavy)

Usage:
    python data_processor.py \
        --reviews All_Beauty.jsonl \
        --metadata meta_All_Beauty.jsonl \
        --output_dir ./processed_data
"""

import json
import os
import argparse
import pandas as pd
import numpy as np
from datetime import datetime


# ─────────────────────────────────────────────
# 1. LOADING
# ─────────────────────────────────────────────

def load_jsonl(filepath: str) -> list[dict]:
    """Load a .jsonl file and return a list of dicts."""
    data = []
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    data.append(json.loads(line))
                except json.JSONDecodeError:
                    continue  # skip malformed lines
    print(f"[LOAD] Loaded {len(data):,} records from {os.path.basename(filepath)}")
    return data


# ─────────────────────────────────────────────
# 2. PARSE REVIEWS → INTERACTIONS TABLE
# ─────────────────────────────────────────────

def parse_reviews(raw_reviews: list[dict]) -> pd.DataFrame:
    """
    Extract and clean the interactions table from raw reviews.

    Output columns:
        user_id, item_id, rating, timestamp
    """
    records = []
    for r in raw_reviews:
        user_id   = r.get("user_id")
        item_id   = r.get("parent_asin") or r.get("asin")
        rating    = r.get("rating")
        timestamp = r.get("sort_timestamp") or r.get("timestamp")

        # Skip rows with missing critical fields
        if not user_id or not item_id or rating is None:
            continue

        # Convert timestamp from ms to readable datetime if available
        if timestamp:
            try:
                timestamp = datetime.utcfromtimestamp(int(timestamp) / 1000).strftime('%Y-%m-%d %H:%M:%S')
            except Exception:
                timestamp = None

        records.append({
            "user_id":   str(user_id).strip(),
            "item_id":   str(item_id).strip(),
            "rating":    float(rating),
            "timestamp": timestamp
        })

    df = pd.DataFrame(records)
    print(f"[REVIEWS] Parsed {len(df):,} raw interactions")
    return df


# ─────────────────────────────────────────────
# 3. PARSE METADATA → ITEMS TABLE
# ─────────────────────────────────────────────

def parse_metadata(raw_meta: list[dict]) -> pd.DataFrame:
    """
    Extract and clean the item metadata table from raw metadata.

    Output columns:
        item_id, title, description, category, sub_category,
        brand, price, tags, avg_rating
    """
    records = []
    for m in raw_meta:
        item_id = m.get("parent_asin")
        if not item_id:
            continue

        # ── Title ──────────────────────────────────────────
        title = m.get("title", "")

        # ── Description: join list into single string ──────
        raw_desc = m.get("description", [])
        if isinstance(raw_desc, list):
            description = " ".join([d for d in raw_desc if isinstance(d, str)]).strip()
        else:
            description = str(raw_desc).strip()

        # ── Features: join into tags string ────────────────
        features = m.get("features", [])
        tags = " | ".join(features) if isinstance(features, list) else str(features)

        # ── Categories ─────────────────────────────────────
        category     = m.get("main_category", "Unknown")
        categories   = m.get("categories", [])
        # Flatten nested list if needed
        if categories and isinstance(categories[0], list):
            categories = [item for sublist in categories for item in sublist]
        sub_category = categories[1] if len(categories) > 1 else (categories[0] if categories else "Unknown")

        # ── Brand from details dict ─────────────────────────
        details = m.get("details", {})
        brand   = details.get("Brand") or m.get("store") or "Unknown"

        # ── Price ───────────────────────────────────────────
        price = m.get("price")
        try:
            price = float(price) if price is not None else np.nan
        except (ValueError, TypeError):
            price = np.nan

        # ── Average rating ──────────────────────────────────
        avg_rating = m.get("average_rating", np.nan)

        records.append({
            "item_id":      str(item_id).strip(),
            "title":        str(title).strip(),
            "description":  description,
            "category":     str(category).strip(),
            "sub_category": str(sub_category).strip(),
            "brand":        str(brand).strip(),
            "price":        price,
            "tags":         tags,
            "avg_rating":   float(avg_rating) if avg_rating else np.nan
        })

    df = pd.DataFrame(records)
    # Drop duplicate item_ids (keep last, most complete)
    df = df.drop_duplicates(subset="item_id", keep="last")
    print(f"[METADATA] Parsed {len(df):,} unique items")
    return df


# ─────────────────────────────────────────────
# 4. CLEAN INTERACTIONS
# ─────────────────────────────────────────────

def clean_interactions(df: pd.DataFrame,
                        min_user_interactions: int = 5,
                        min_item_interactions: int = 5,
                        max_users: int = 5000,
                        max_items: int = 2000) -> pd.DataFrame:
    """
    Clean the interactions table:
      - Remove duplicates (keep last review per user-item pair)
      - Remove users with fewer than min_user_interactions
      - Remove items with fewer than min_item_interactions
      - Cap to max_users and max_items for performance
      - Validate rating range [1.0, 5.0]
    """
    initial = len(df)

    # Remove duplicate user-item pairs
    df = df.sort_values("timestamp", na_position='last')
    df = df.drop_duplicates(subset=["user_id", "item_id"], keep="last")

    # Validate rating range
    df = df[df["rating"].between(1.0, 5.0)]

    # Filter users with too few interactions
    user_counts = df["user_id"].value_counts()
    active_users = user_counts[user_counts >= min_user_interactions].index
    df = df[df["user_id"].isin(active_users)]

    # Filter items with too few interactions
    item_counts = df["item_id"].value_counts()
    active_items = item_counts[item_counts >= min_item_interactions].index
    df = df[df["item_id"].isin(active_items)]

    # Cap size for performance
    top_users = user_counts[user_counts.index.isin(active_users)].nlargest(max_users).index
    top_items = item_counts[item_counts.index.isin(active_items)].nlargest(max_items).index
    df = df[df["user_id"].isin(top_users) & df["item_id"].isin(top_items)]

    print(f"[CLEAN] Interactions: {initial:,} → {len(df):,}")
    print(f"        Unique users : {df['user_id'].nunique():,}")
    print(f"        Unique items : {df['item_id'].nunique():,}")
    sparsity = 1 - len(df) / (df["user_id"].nunique() * df["item_id"].nunique())
    print(f"        Sparsity     : {sparsity:.2%}")
    return df.reset_index(drop=True)


# ─────────────────────────────────────────────
# 5. CLEAN METADATA
# ─────────────────────────────────────────────

def clean_metadata(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the metadata table:
      - Fill missing descriptions with title + tags
      - Fill missing prices with median price
      - Fill missing brands/categories with 'Unknown'
      - Create a unified 'content' column for NLP models
    """
    # Fill missing text fields
    df["title"]       = df["title"].fillna("").str.strip()
    df["description"] = df["description"].fillna("").str.strip()
    df["tags"]        = df["tags"].fillna("").str.strip()
    df["brand"]       = df["brand"].replace("", "Unknown").fillna("Unknown")
    df["category"]    = df["category"].replace("", "Unknown").fillna("Unknown")
    df["sub_category"]= df["sub_category"].replace("", "Unknown").fillna("Unknown")

    # If description is empty, fall back to title + tags
    empty_desc = df["description"] == ""
    df.loc[empty_desc, "description"] = (
        df.loc[empty_desc, "title"] + " " + df.loc[empty_desc, "tags"]
    ).str.strip()

    # Fill missing price with median
    median_price = df["price"].median()
    df["price"] = df["price"].fillna(median_price).round(2)

    # Fill missing avg_rating with global mean
    mean_rating = df["avg_rating"].mean()
    df["avg_rating"] = df["avg_rating"].fillna(mean_rating).round(2)

    # ── Unified content column (for TF-IDF and Word2Vec) ──
    # Combines all text fields into one rich string
    df["content"] = (
        df["title"] + " " +
        df["category"] + " " +
        df["sub_category"] + " " +
        df["brand"] + " " +
        df["tags"] + " " +
        df["description"]
    ).str.lower().str.strip()

    print(f"[CLEAN] Metadata: {len(df):,} items after cleaning")
    print(f"        Missing prices filled   : {empty_desc.sum():,}")
    return df.reset_index(drop=True)


# ─────────────────────────────────────────────
# 6. ENFORCE THE CRITICAL JOIN RULE
# ─────────────────────────────────────────────

def enforce_join_integrity(interactions: pd.DataFrame,
                            metadata: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    CRITICAL RULE: Every item_id in interactions MUST exist in metadata.
    Items in interactions that have no metadata entry are dropped.
    """
    valid_items = set(metadata["item_id"])
    before = len(interactions)
    interactions = interactions[interactions["item_id"].isin(valid_items)]
    dropped = before - len(interactions)
    if dropped > 0:
        print(f"[JOIN] Dropped {dropped:,} interactions with no matching metadata")
    else:
        print(f"[JOIN]  All item_ids in interactions exist in metadata")
    return interactions.reset_index(drop=True), metadata


# ─────────────────────────────────────────────
# 7. BUILD OUTPUT FILES
# ─────────────────────────────────────────────

def build_hybrid_ready(interactions: pd.DataFrame,
                        metadata: pd.DataFrame) -> pd.DataFrame:
    """
    Merge interactions with item metadata to create a flat
    hybrid-ready table for LightFM and Weighted Hybrid models.
    """
    hybrid = interactions.merge(metadata, on="item_id", how="inner")
    print(f"[HYBRID] Built hybrid_ready table: {len(hybrid):,} rows")
    return hybrid


def build_user_item_matrix(interactions: pd.DataFrame) -> pd.DataFrame:
    """
    Build a user-item pivot matrix.
    Rows = users, Columns = items, Values = ratings (0 if no interaction).
    WARNING: only build this if you capped users/items to reasonable size.
    """
    matrix = interactions.pivot_table(
        index="user_id",
        columns="item_id",
        values="rating",
        aggfunc="mean"
    ).fillna(0)
    print(f"[MATRIX] User-Item Matrix shape: {matrix.shape}")
    return matrix


# ─────────────────────────────────────────────
# 8. SAVE OUTPUTS
# ─────────────────────────────────────────────

def save_outputs(interactions: pd.DataFrame,
                 metadata: pd.DataFrame,
                 hybrid: pd.DataFrame,
                 matrix: pd.DataFrame,
                 output_dir: str):
    """Save all processed files to the output directory."""
    os.makedirs(output_dir, exist_ok=True)

    interactions.to_csv(os.path.join(output_dir, "interactions.csv"), index=False)
    metadata.to_csv(os.path.join(output_dir, "items_metadata.csv"), index=False)
    hybrid.to_csv(os.path.join(output_dir, "hybrid_ready.csv"), index=False)
    matrix.to_csv(os.path.join(output_dir, "user_item_matrix.csv"))

    print(f"\n[SAVE]  All files saved to: {output_dir}/")
    print(f"        interactions.csv      → {len(interactions):,} rows")
    print(f"        items_metadata.csv    → {len(metadata):,} rows")
    print(f"        hybrid_ready.csv      → {len(hybrid):,} rows")
    print(f"        user_item_matrix.csv  → {matrix.shape[0]:,} users × {matrix.shape[1]:,} items")


# ─────────────────────────────────────────────
# 9. SUMMARY REPORT
# ─────────────────────────────────────────────

def print_summary(interactions: pd.DataFrame, metadata: pd.DataFrame):
    """Print a final summary of the processed data."""
    print("\n" + "="*55)
    print("          FINAL DATA SUMMARY")
    print("="*55)
    print(f"  Total interactions   : {len(interactions):,}")
    print(f"  Unique users         : {interactions['user_id'].nunique():,}")
    print(f"  Unique items         : {interactions['item_id'].nunique():,}")
    sparsity = 1 - len(interactions) / (
        interactions['user_id'].nunique() * interactions['item_id'].nunique()
    )
    print(f"  Matrix sparsity      : {sparsity:.2%}")
    print(f"  Avg rating           : {interactions['rating'].mean():.2f}")
    print(f"  Rating distribution  :")
    for r, count in interactions['rating'].value_counts().sort_index().items():
        print(f"      {r:.1f} ⭐  →  {count:,}")
    print(f"\n  Items with price     : {metadata['price'].notna().sum():,}")
    print(f"  Items with content   : {(metadata['content'] != '').sum():,}")
    print(f"  Categories           : {metadata['category'].nunique():,}")
    print(f"  Brands               : {metadata['brand'].nunique():,}")
    print("="*55)
    print("\n  Data is ready for all 8 algorithms:")
    print("     CF          → interactions.csv")
    print("     Content     → items_metadata.csv  (use 'content' column)")
    print("     Hybrid      → hybrid_ready.csv")
    print("     Matrix ops  → user_item_matrix.csv")
    print("="*55 + "\n")


# ─────────────────────────────────────────────
# 10. MAIN PIPELINE
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Process Amazon JSONL files for recommendation systems.")
    parser.add_argument("--reviews",    required=True, help="Path to reviews .jsonl file")
    parser.add_argument("--metadata",   required=True, help="Path to metadata .jsonl file")
    parser.add_argument("--output_dir", default="./processed_data", help="Output directory")
    parser.add_argument("--min_user_interactions", type=int, default=5)
    parser.add_argument("--min_item_interactions", type=int, default=5)
    parser.add_argument("--max_users",  type=int, default=5000)
    parser.add_argument("--max_items",  type=int, default=2000)
    args = parser.parse_args()

    print("\n" + "="*55)
    print("       STARTING DATA PROCESSING PIPELINE")
    print("="*55 + "\n")

    # Step 1: Load raw files
    raw_reviews  = load_jsonl(args.reviews)
    raw_meta     = load_jsonl(args.metadata)

    # Step 2: Parse into DataFrames
    interactions = parse_reviews(raw_reviews)
    metadata     = parse_metadata(raw_meta)

    # Step 3: Clean each table
    interactions = clean_interactions(
        interactions,
        min_user_interactions=args.min_user_interactions,
        min_item_interactions=args.min_item_interactions,
        max_users=args.max_users,
        max_items=args.max_items
    )
    metadata = clean_metadata(metadata)

    # Step 4: Enforce join integrity (CRITICAL)
    interactions, metadata = enforce_join_integrity(interactions, metadata)

    # Step 5: Subset metadata to only items that exist in interactions
    valid_items = set(interactions["item_id"])
    metadata    = metadata[metadata["item_id"].isin(valid_items)].reset_index(drop=True)

    # Step 6: Build output files
    hybrid = build_hybrid_ready(interactions, metadata)
    matrix = build_user_item_matrix(interactions)

    # Step 7: Save everything
    save_outputs(interactions, metadata, hybrid, matrix, args.output_dir)

    # Step 8: Print summary
    print_summary(interactions, metadata)


if __name__ == "__main__":
    main()