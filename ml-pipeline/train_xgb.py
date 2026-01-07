import pandas as pd
import numpy as np
import joblib
import json
import os
import xgboost as xgb

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report
from geopy.distance import geodesic


# =========================================================
# CONFIG
# =========================================================
DATA_PATH = "fraudTrain.csv"     # adjust if needed
TARGET_COL = "is_fraud"

FEATURES = [
    "amt",
    "hour",
    "day",
    "month",
    "dayofweek",
    "distance",
    "city_pop"
]

ARTIFACT_DIR = "../fraud-ml-backend/artifacts"
os.makedirs(ARTIFACT_DIR, exist_ok=True)


# =========================================================
# LOAD DATA
# =========================================================
print("Loading data...")
df = pd.read_csv(DATA_PATH)


# =========================================================
# FEATURE ENGINEERING
# =========================================================
print("Feature engineering...")

# Parse datetime
df["trans_date_trans_time"] = pd.to_datetime(df["trans_date_trans_time"])

df["hour"] = df["trans_date_trans_time"].dt.hour
df["day"] = df["trans_date_trans_time"].dt.day
df["month"] = df["trans_date_trans_time"].dt.month
df["dayofweek"] = df["trans_date_trans_time"].dt.dayofweek

# Geographic distance (customer → merchant)
df["distance"] = df.apply(
    lambda r: geodesic(
        (r["lat"], r["long"]),
        (r["merch_lat"], r["merch_long"])
    ).km,
    axis=1
)

# Select features + target
X = df[FEATURES].values
y = df[TARGET_COL].values


# =========================================================
# TRAIN / TEST SPLIT
# =========================================================
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    stratify=y,
    random_state=42
)


# =========================================================
# SCALING
# =========================================================
print("Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# =========================================================
# MODEL TRAINING (XGBOOST)
# =========================================================
print("Training XGBoost model...")

scale_pos_weight = (len(y_train) - np.sum(y_train)) / np.sum(y_train)

xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    scale_pos_weight=scale_pos_weight,
    eval_metric="logloss"
)

xgb_model.fit(X_train_scaled, y_train)


# =========================================================
# EVALUATION
# =========================================================
print("\nEvaluating model...")
y_probs = xgb_model.predict_proba(X_test_scaled)[:, 1]
y_preds = (y_probs > 0.5).astype(int)

roc_auc = roc_auc_score(y_test, y_probs)
print(f"ROC-AUC: {roc_auc:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_preds))


# =========================================================
# EXPORT ARTIFACTS
# =========================================================
print("\nExporting artifacts...")

joblib.dump(xgb_model, os.path.join(ARTIFACT_DIR, "xgb_model.pkl"))
joblib.dump(scaler, os.path.join(ARTIFACT_DIR, "scaler.pkl"))

with open(os.path.join(ARTIFACT_DIR, "feature_schema.json"), "w") as f:
    json.dump(FEATURES, f)

with open(os.path.join(ARTIFACT_DIR, "metrics.json"), "w") as f:
    json.dump(
        {
            "roc_auc": roc_auc,
            "positive_rate": float(np.mean(y))
        },
        f,
        indent=2
    )

print("✅ Model artifacts exported successfully")
