ALL PRODUCTS
↓ (business rules)
ELIGIBLE PRODUCTS
↓ (weights & scoring)
RANKED RECOMMENDATIONS

1. Business Positioning
2. Business Rules (filters)
3. Content-Based Scoring
4. Collaborative Scoring
5. Hybrid Combination
6. Final Ranking

User requests recommendations
↓
Apply business rules (filter)
↓
Content-based scoring
↓
Collaborative scoring
↓
Hybrid weighting
↓
Rank products
↓
Return top N products

backend/
└── recommender/
├── rules.js ← business rules
├── contentBased.js ← similarity logic
├── collaborative.js ← behavior logic
├── utils.js ← helpers
└── index.js ← hybrid orchestrator

roles:

rules.js => filters products

contentBased.js => scores similarity using product data

collaborative.js => scores based on other users’ behavior

index.js => combines everything

“The recommendation system follows a layered approach where business rules ensure strategic alignment, content-based filtering ensures relevance based on product characteristics, and collaborative filtering leverages user interactions. A hybrid strategy combines both algorithms to improve recommendation quality and robustness.”
