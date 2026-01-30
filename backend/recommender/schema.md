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


Context:
I am building a Node.js + Express + Sequelize backend with SQLite for an e-commerce project (PFE).
The project already has:

A Product Sequelize model with fields like: id, name, category, subCategory, brand, stock, priceCents, rating, keywords

A recommendation system folder planned at:
backend/recommender/

The business positioning of the store is:

Target audience: students, students abroad, students living alone, hustling students

Price philosophy: affordable

Quality: normal, practical (not luxury)

Product focus: daily-use essentials (clothing, home, kitchen, electronics basics)

Avoid: luxury products, overpriced items, irrelevant or decorative-only products

Task:
Create a file called backend/recommender/rules.js that implements business positioning rules for the recommendation system.

Requirements for rules.js:

Export a function named applyBusinessRules(products, context)

The function receives:

products: an array of Sequelize Product objects

context: an optional object that may include:

currentProductId

maxPriceCents

excludedProductIds

The function must FILTER products, not rank them.

Apply the following business rules:

Product must be in stock (stock > 0)

Product price must be under a student-friendly limit (default ≤ 15000 cents)

Product category must be one of:
Clothing, Shoes, Kitchen, Home, Bathroom, Electronics, Accessories, Lifestyle

Exclude the currently viewed product (if currentProductId is provided)

Exclude products already in excludedProductIds (if provided)

If a rating exists, average rating must be ≥ 3.5

The function must return an array of eligible products only.

Code must be clean, readable, and easy to justify in an academic report.

Do NOT include any recommendation scoring or algorithms — filtering only.

Output:
Only return the full content of rules.js.