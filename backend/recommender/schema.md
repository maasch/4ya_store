## SVD-Based Recommendation Architecture

```
User requests recommendations
    ↓
Node.js: GET /api/recommendations
    ↓
Node.js → Python SVD Service (HTTP)
    ↓
SVD Service: predict ratings for all items → return ranked item IDs
    ↓
Node.js: fetch products from DB by item IDs
    ↓
Apply business rules (rules.js — price, category, rating, stock filters)
    ↓
Return filtered top-N products to frontend
```

### Components

```
backend/
├── svd_service/          ← Python SVD microservice
│   ├── train_model.py    ← Train SVD, save model
│   ├── server.py         ← FastAPI (port 8000)
│   ├── requirements.txt
│   ├── svd_model.pkl     ← Trained model (generated)
│   ├── item_ids.pkl      ← Item ID list (generated)
│   └── user_ids.pkl      ← User ID list (generated)
├── recommender/
│   ├── rules.js          ← Business positioning rules (kept)
│   └── schema.md         ← This file
└── routes/
    └── recommendations.js ← Calls SVD service + applies rules.js
```

### Data Flow

- **Training data**: `reco_sys/processed_data/interactions.csv` (user_id, item_id, rating)
- **Model**: SVD from `surprise` library (100 factors, 20 epochs)
- **Serving**: FastAPI on port 8000, loaded at startup

### Cold Start Handling

- **Known user**: Personalized SVD predictions
- **Unknown user / no user**: Popularity-based fallback (avg rating × interaction count)

### Business Rules (rules.js)

SVD results are filtered through business positioning rules:
- In-stock only (stock > 0)
- Allowed categories: Clothing, Shoes, Kitchen, Home, Bathroom, Electronics, Accessories, Lifestyle
- Max price: 150.00 (15000 cents)
- Min average rating: 3.5 stars
- Excludes current product and cart items
