# 🚨 Full-Stack Fraud Detection Platform (ML + Web)

An end-to-end **fraud detection system** demonstrating the complete machine learning lifecycle — from **feature engineering and model training** to **real-time inference, explainability (SHAP), drift-ready logging**, and a **full-stack React dashboard**.

This project is intentionally designed to resemble a **real-world production ML system**, not just a notebook-based experiment.

---

## 📌 Project Highlights

- 🧠 **XGBoost-based fraud detection model**
- ⚙️ **FastAPI-powered ML inference service**
- 🔍 **SHAP explainability for every prediction**
- 📉 **Prediction logging for monitoring & drift analysis**
- 🖥️ **React dashboard for real-time interaction**
- 📦 **Clear separation of training, serving, and UI layers**

---

## 🏗️ System Architecture


+-----------------------+
|   React Dashboard     |
|  (frontend_dashboard) |
+----------+------------+
           |
           | HTTP (REST)
           v
+-----------------------+
|     FastAPI Service   |
|      (ml-service)     |
|  - /predict           |
|  - /health            |
|  - SHAP explanation   |
+----------+------------+
           |
           | Loads model + schema
           v
+-----------------------+
|   Model Artifacts     |
| (ml-service/artifacts)|
|  - model.joblib       |
|  - feature_schema.json|
|  - metrics.json       |
+----------+------------+
           ^
           |
           | Training + evaluation
           |
+----------+------------+
|    ML Training        |
|     (ml-pipeline)     |
|  - feature engg       |
|  - train_xgb.py       |
|  - notebook           |
+-----------------------+


## 🧠 Machine Learning Details

### Model
- **Algorithm:** XGBoost Classifier  
- **Problem Type:** Binary classification (Fraud vs Non-Fraud)
- **Metrics:** ROC-AUC, Precision, Recall, F1-score

### Feature Engineering
- Temporal features:
  - Transaction hour
  - Day of week
- Geospatial feature:
  - Distance between customer and merchant (Haversine)
- Demographic feature:
  - City population
- Transaction metadata:
  - Amount, category, etc.

### Training Pipeline
Located in:
ml-pipeline/
├── train_xgb.py
├── Project_Credit_Card_Fraud_Transactions_Detection_Data_Pipeline.ipynb



Pipeline steps:
1. Load and clean transaction data
2. Perform feature engineering
3. Scale numeric features
4. Train XGBoost model
5. Save:
   - Trained model artifact
   - Feature schema
   - Evaluation metrics

---

## ⚡ ML Inference Service (FastAPI)

Located in:
ml-service/
├── main.py
├── artifacts/
│ ├── model.joblib
│ ├── feature_schema.json
│ ├── metrics.json



🔍 Explainability (SHAP)

SHAP values generated for each prediction
Feature-level contribution to fraud probability
Improves transparency, trust, and auditability
Mirrors real-world financial ML compliance needs

📉 Logging & Monitoring

All predictions logged with timestamps
Enables:
Drift detection
Historical performance analysis
Model auditing



🛠️ Tech Stack

Machine Learning

Python
XGBoost
Scikit-learn
SHAP
Pandas, NumPy

Backend

FastAPI
Pydantic
Joblib

Frontend

React
JavaScript
Recharts
Axios


