# api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Iris Prediction API")

# Allow local frontend origins; adjust for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load artifacts ----
MODEL_PATH = "iris_model.joblib"
SCALER_PATH = "iris_scaler.joblib"
ENCODER_PATH = "iris_label_encoder.joblib"
DATA_PATH = "Iris.csv"

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    encoder = joblib.load(ENCODER_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model artifacts: {e}")

# Load dataset (for frontend 3D)
try:
    df = pd.read_csv(DATA_PATH)
    if "Id" in df.columns:
        df = df.drop(columns=["Id"])
except Exception:
    df = None

FEATURE_ORDER = ["SepalLengthCm", "SepalWidthCm", "PetalLengthCm", "PetalWidthCm"]

# ---- Pydantic models ----
class PredictRequest(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

class PredictResponse(BaseModel):
    species: str
    probabilities: dict

# ---- Routes ----
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/data")
def get_data(sample: int = 150):
    """
    Return dataset samples for frontend visualizations.
    sample: number of rows (default 150)
    """
    if df is None:
        raise HTTPException(status_code=500, detail="Dataset not available on server.")
    n = max(1, min(int(sample), len(df)))
    return df.head(n).to_dict(orient="records")

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    # Build DataFrame with the exact feature names/order used in training
    try:
        X = pd.DataFrame(
            [[req.sepal_length, req.sepal_width, req.petal_length, req.petal_width]],
            columns=FEATURE_ORDER,
        )
        # Scale using saved scaler (must match training)
        X_scaled = scaler.transform(X)
        pred_encoded = model.predict(X_scaled)[0]
        pred_species = encoder.inverse_transform([pred_encoded])[0]
        probs = model.predict_proba(X_scaled)[0]
        class_names = encoder.inverse_transform(np.arange(len(probs)))
        prob_dict = {str(class_names[i]): float(round(probs[i] * 100, 3)) for i in range(len(probs))}
        return {"species": str(pred_species), "probabilities": prob_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
# To run the app, use the command:
# uvicorn api:app --reload