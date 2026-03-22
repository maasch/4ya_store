"""
server.py
=========
FastAPI microservice that serves SVD recommendations.

Endpoints:
    GET /recommend?user_id=X&limit=N&exclude=id1,id2
    GET /health

Startup:
    cd d:\\DEV\\4YA_Store\\backend\\svd_service
    python -m uvicorn server:app --host 0.0.0.0 --port 8000

Requires:
    - svd_model.pkl  (from train_model.py)
    - item_ids.pkl   (from train_model.py)
    - interactions.csv in reco_sys/processed_data/
"""

import os
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# ── Paths ──────────────────────────────────────────────────────
SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SERVICE_DIR, 'svd_model.pkl')
ITEM_IDS_PATH = os.path.join(SERVICE_DIR, 'item_ids.pkl')
INTERACTIONS_PATH = os.path.join(
    SERVICE_DIR, '..', '..', 'reco_sys', 'processed_data', 'interactions.csv'
)

# ── Global state ───────────────────────────────────────────────
model = None
all_item_ids = []
item_popularity = {}  # item_id -> avg rating (for cold start)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and data at startup."""
    global model, all_item_ids, item_popularity

    print("[SVD Service] Loading model...")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run train_model.py first."
        )

    model = joblib.load(MODEL_PATH)
    all_item_ids = joblib.load(ITEM_IDS_PATH)
    print(f"[SVD Service] Model loaded. {len(all_item_ids)} items available.")

    # Build popularity index for cold-start fallback
    interactions_path = os.path.normpath(INTERACTIONS_PATH)
    if os.path.exists(interactions_path):
        df = pd.read_csv(interactions_path)
        item_popularity.update(
            df.groupby('item_id')['rating']
            .agg(['mean', 'count'])
            .assign(score=lambda x: x['mean'] * 0.7 + (x['count'] / x['count'].max()) * 0.3 * 5)
            ['score']
            .to_dict()
        )
        print(f"[SVD Service] Popularity index built for {len(item_popularity)} items.")

    yield

    print("[SVD Service] Shutting down.")


app = FastAPI(title="SVD Recommendation Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "total_items": len(all_item_ids),
    }


@app.get("/recommend")
async def recommend(
    user_id: str = Query(default=None, description="User ID for personalized recommendations"),
    limit: int = Query(default=10, ge=1, le=200, description="Number of recommendations"),
    exclude: str = Query(default="", description="Comma-separated item IDs to exclude"),
):
    """
    Returns top-N recommended item IDs for a user.

    - If user_id is provided and known: personalized SVD predictions.
    - If user_id is None or unknown (cold start): popularity-based fallback.
    """
    excluded_set = set(
        eid.strip() for eid in exclude.split(",") if eid.strip()
    ) if exclude else set()

    # Filter candidates
    candidates = [iid for iid in all_item_ids if iid not in excluded_set]

    if not candidates:
        return {"item_ids": [], "cold_start": True}

    # Check if user is known to the model
    is_known_user = False
    if user_id and model is not None:
        try:
            inner_uid = model.trainset.to_inner_uid(user_id)
            is_known_user = inner_uid is not None
        except ValueError:
            is_known_user = False

    if is_known_user:
        # ── Personalized SVD predictions ───────────────────────
        scored = []
        for iid in candidates:
            try:
                pred = model.predict(user_id, iid)
                scored.append((iid, pred.est))
            except Exception:
                continue

        scored.sort(key=lambda x: x[1], reverse=True)
        top_items = [iid for iid, _ in scored[:limit]]

        return {
            "item_ids": top_items,
            "cold_start": False,
        }
    else:
        # ── Cold start: popularity fallback ────────────────────
        scored = [
            (iid, item_popularity.get(iid, 0.0))
            for iid in candidates
        ]
        scored.sort(key=lambda x: x[1], reverse=True)
        top_items = [iid for iid, _ in scored[:limit]]

        return {
            "item_ids": top_items,
            "cold_start": True,
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
