<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/maasch/4ya_store@main/pics/pfe_cover_image_1775080078268.png" alt="4YA Store Cover" width="100%" />

  <h1>4YA Store</h1>
  <p><strong>A Modern E-Commerce Platform with a Personalized AI Recommendation Engine</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Status-Completed-success" alt="Project Status" />
    <img src="https://img.shields.io/badge/Frontend-React_19%20%7C%20Vite-blue" alt="React" />
    <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green" alt="Node.js" />
    <img src="https://img.shields.io/badge/ML_Service-Python%20%7C%20FastAPI-yellow" alt="Python" />
    <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker" alt="Docker" />
  </p>
</div>

<hr />

## Overview

**4YA Store** is a full-stack e-commerce web application developed as a final year project (PFE). Beyond traditional e-commerce capabilities, its standout feature is a deeply integrated **Personalized Recommendation System**. By leveraging advanced Machine Learning algorithms, 4YA Store dynamically adapts to user behaviors, serving highly tailored product recommendations in real-time.

## Key Features

- ** Modern Storefront**: A lightning-fast, highly responsive Single Page Application built with React.
- ** AI-Driven Recommendations**: Uses Singular Value Decomposition (SVD) and collaborative filtering models to rank and recommend items based on interaction history.
- ** Smart Fallback Mechanisms**: Gracefully handles "Cold-Start" scenarios, providing default or rating-based suggestions for new users when interaction data is scarce.
- ** Contextual Rule Engine**: Implements dynamic business logic (filtering out out-of-stock items, hiding currently viewed products, category enforcement) above the SVD output.
- ** Automated Seeding**: Instantly provisions the SQLite database with default e-commerce products, users, and scenarios to guarantee a seamless developer experience out of the box.
- ** Dockerized Environment**: A fully containerized setup for a one-click multi-service launch.

<br/>

## Platform Sneak Peek

| Homepage | Product Details |
| :---: | :---: |
| <img src="https://cdn.jsdelivr.net/gh/maasch/4ya_store@main/pics/homepage_4ya_store_1775080955949.png" alt="Homepage view" width="100%"/> | <img src="https://cdn.jsdelivr.net/gh/maasch/4ya_store@main/pics/product_detail_4ya_store_1775080983249.png" alt="Product details view" width="100%"/> |

<br/>

## System Architecture

Our solution follows a decoupled, microservices-oriented architecture:

<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/maasch/4ya_store@main/pics/tech_architecture_1775080098855.png" alt="Technical Architecture" width="80%" />
</div>

1. **Jupyter Notebooks (`reco_sys`)**: Used for data mining, model training, and comparing Content-Based, Collaborative Filtering, and Hybrid algorithms.
2. **AI Microservice (`backend/svd_service`)**: A lightweight Python service using pre-trained `LightFM`/`Surprise` models (`.pkl`) to infer user preferences and map them to product IDs.
3. **Node.js API Gateway (`backend`)**: Bridges the frontend with the Python AI module. It orchestrates user sessions, executes business logic, and aggregates data.
4. **React Client (`frontend`)**: The UI layer capturing user events, displaying catalog data safely routed from the node backend, and rendering personalized components.

<br/>

## Running the Project (Docker)

The fastest and most reliable way to run the 4YA Store is by using **Docker Compose**. It spins up the UI, the backend server, and the Python recommender service, automatically linking and exposing them correctly.

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) installed and running.

### Quick Start

1. Clone the repository and navigate into the root directory:
```bash
git clone <repository_url>
cd 4YA_Store
```

2. Start all services using Docker Compose:
```bash
docker-compose up --build -d
```

3. **Access the application**:
   - **Frontend (Store UI)**: http://localhost
   - **Backend API**: http://localhost:3691
   - **Python SVD Service**: http://localhost:8000

*(Note: The database is automatically seeded upon backend startup. To stop the application, run `docker-compose down`)*

<br/>

*(Legacy Manual Setup)*
<details>
<summary><b>Click to view instructions for running manually (without Docker)</b></summary>

### 1. Python ML Service
```bash
cd backend/svd_service
pip install -r requirements.txt
python server.py # Runs on http://localhost:8000
```

### 2. Node.js API
```bash
cd backend
npm install
npm run dev # Runs on http://localhost:3691
```

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev # Runs on http://localhost:5173
```
</details>

<br/>

## Repository Structure

```text
4YA_Store/
├── backend/                  # Express.js API + SQLite DB
│   ├── models/               # Sequelize ORM Definitions
│   ├── routes/               # API endpoints
│   ├── recommender/          # Business rule post-processing
│   └── svd_service/          # Python AI Microservice layer
├── frontend/                 # React UI Client
│   ├── src/components/       # Reusable React components
│   ├── src/pages/            # View specific pages
│   └── src/utils/            # Axios interceptors, formatting helpers
├── reco_sys/                 # Model Training & Exploratory Data Analysis
├── pics/                     # Documentation assets and screenshots
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Project documentation
```

<br/>

## Authors & Credits
Developed as an academic capstone module requirement (PFE).
