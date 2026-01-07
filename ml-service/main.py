from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import joblib
import json
import os
import shap
from datetime import datetime
import csv


app = FastAPI(title="Fraud Detection ML API with Explainability")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.path.join(BASE_DIR, "artifacts")

# Load artifacts
model = joblib.load(os.path.join(ARTIFACT_DIR, "xgb_model.pkl"))
scaler = joblib.load(os.path.join(ARTIFACT_DIR, "scaler.pkl"))

with open(os.path.join(ARTIFACT_DIR, "feature_schema.json")) as f:
    FEATURES = json.load(f)

# Initialize SHAP explainer once (IMPORTANT)
explainer = shap.TreeExplainer(model)


class Transaction(BaseModel):
    amt: float
    hour: int
    day: int
    month: int
    dayofweek: int
    distance: float
    city_pop: float


@app.get("/health")
def health():
    return {"status": "ok"}



@app.post("/predict")
def predict(txn: Transaction):
    # Prepare input
    x = np.array([[getattr(txn, f) for f in FEATURES]])
    x_scaled = scaler.transform(x)

    # Prediction
    prob = model.predict_proba(x_scaled)[0][1]
    label = "FRAUD" if prob >= 0.7 else "LEGIT"


    # SHAP explanation
    shap_values = explainer.shap_values(x_scaled)

    # Handle binary classifier output shape
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0]
    else:
        shap_vals = shap_values[0]

    # Top contributing features
    feature_contributions = sorted(
        zip(FEATURES, shap_vals),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:3]

    explanations = [
        {
            "feature": feature,
            "shap_value": float(value)
        }
        for feature, value in feature_contributions
    ]

    return {
        "risk_score": float(prob),
        "label": label,
        "explanations": explanations
    }

LOG_FILE = "logs/predictions.csv"

def log_prediction(input_data, risk_score, label):
    file_exists = os.path.isfile(LOG_FILE)

    with open(LOG_FILE, mode="a", newline="") as f:
        writer = csv.writer(f)

        if not file_exists:
            writer.writerow([
                "timestamp",
                "amt",
                "hour",
                "day",
                "month",
                "dayofweek",
                "distance",
                "city_pop",
                "risk_score",
                "label"
            ])

        writer.writerow([
            datetime.utcnow().isoformat(),
            input_data.amt,
            input_data.hour,
            input_data.day,
            input_data.month,
            input_data.dayofweek,
            input_data.distance,
            input_data.city_pop,
            risk_score,
            label
        ])
