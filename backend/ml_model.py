"""
Machine Learning Risk Scoring Layer for AI Payment Scam Detector.

Uses LightGBM binary classification to predict transaction scam/fraud probabilities
based on behavioral anomaly signals and transaction parameters.
"""

import os
import logging
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
import joblib
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)

logger = logging.getLogger("scam_detector.ml")

# Default model save paths relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_PATH = os.path.join(CURRENT_DIR, "model.joblib")
DEFAULT_LGB_TXT_PATH = os.path.join(CURRENT_DIR, "model.txt")

# Standard feature order for tabular inference
FEATURE_NAMES: List[str] = [
    "amount",
    "is_unusual_amount",
    "amount_multiplier",
    "is_new_recipient",
    "is_new_device",
    "is_unusual_location",
    "high_transaction_frequency",
    "repeated_suspicious_behavior",
    "historical_transaction_count",
    "historical_average_amount",
]

# In-memory singleton model cache
_CACHED_MODEL: Optional[lgb.LGBMClassifier] = None


def extract_ml_features(
    transaction: Dict[str, Any],
    signals: Dict[str, Any],
) -> np.ndarray:
    """
    Extracts a 1D numerical feature vector from transaction details and behavioral signals.

    Parameters:
        transaction: Dictionary containing amount, recipient, device, location.
        signals: Dictionary or object containing behavioral signals.

    Returns:
        numpy ndarray of shape (1, num_features) with dtype float64.
    """
    # Helper to access dictionary or pydantic object
    def get_val(source: Any, key: str, default: Any = 0.0) -> Any:
        if isinstance(source, dict):
            return source.get(key, default)
        return getattr(source, key, default)

    amount = float(get_val(transaction, "amount", 0.0))
    is_unusual_amount = 1.0 if get_val(signals, "is_unusual_amount", False) else 0.0
    amount_multiplier = float(get_val(signals, "amount_multiplier", 1.0))
    is_new_recipient = 1.0 if get_val(signals, "is_new_recipient", False) else 0.0
    is_new_device = 1.0 if get_val(signals, "is_new_device", False) else 0.0
    is_unusual_location = 1.0 if get_val(signals, "is_unusual_location", False) else 0.0
    high_transaction_frequency = 1.0 if get_val(signals, "high_transaction_frequency", False) else 0.0
    repeated_suspicious_behavior = 1.0 if get_val(signals, "repeated_suspicious_behavior", False) else 0.0
    historical_transaction_count = float(get_val(signals, "historical_transaction_count", 0))
    historical_average_amount = float(get_val(signals, "historical_average_amount", 0.0))

    feature_vector = [
        amount,
        is_unusual_amount,
        amount_multiplier,
        is_new_recipient,
        is_new_device,
        is_unusual_location,
        high_transaction_frequency,
        repeated_suspicious_behavior,
        historical_transaction_count,
        historical_average_amount,
    ]

    return np.array([feature_vector], dtype=np.float64)


def generate_synthetic_dataset(
    n_samples: int = 1500,
    random_seed: int = 42,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates a reproducible synthetic dataset of payment transactions with ground truth labels.
    
    Labels:
        0: Legitimate Transaction
        1: Suspicious / Fraudulent Transaction

    Returns:
        Tuple of (X: np.ndarray, y: np.ndarray)
    """
    rng = np.random.default_rng(seed=random_seed)
    n_legit = n_samples // 2
    n_fraud = n_samples - n_legit

    # --- 1. Legitimate Transactions (n_legit) ---
    # Normal spending distributions
    legit_avg_amounts = rng.uniform(500.0, 5000.0, size=n_legit)
    # Multiplier usually centered around 0.3 - 2.0
    legit_multipliers = rng.normal(loc=0.9, scale=0.4, size=n_legit)
    legit_multipliers = np.clip(legit_multipliers, 0.1, 2.5)
    legit_amounts = legit_avg_amounts * legit_multipliers
    legit_unusual_amount = (legit_multipliers >= 3.0).astype(float)
    
    # Occasional new recipient (25%), rare new device (10%), rare new location (12%)
    legit_new_recipient = rng.binomial(n=1, p=0.25, size=n_legit).astype(float)
    legit_new_device = rng.binomial(n=1, p=0.10, size=n_legit).astype(float)
    legit_unusual_loc = rng.binomial(n=1, p=0.12, size=n_legit).astype(float)
    legit_high_freq = rng.binomial(n=1, p=0.08, size=n_legit).astype(float)
    legit_repeated_susp = np.zeros(n_legit, dtype=float)  # Very clean history
    legit_txn_counts = rng.integers(3, 40, size=n_legit).astype(float)

    X_legit = np.column_stack([
        legit_amounts,
        legit_unusual_amount,
        legit_multipliers,
        legit_new_recipient,
        legit_new_device,
        legit_unusual_loc,
        legit_high_freq,
        legit_repeated_susp,
        legit_txn_counts,
        legit_avg_amounts,
    ])
    y_legit = np.zeros(n_legit, dtype=int)

    # --- 2. Suspicious / Fraudulent Transactions (n_fraud) ---
    fraud_avg_amounts = rng.uniform(800.0, 4000.0, size=n_fraud)
    # High multipliers (3.5x to 25x normal spending)
    fraud_multipliers = rng.uniform(3.5, 20.0, size=n_fraud)
    fraud_amounts = fraud_avg_amounts * fraud_multipliers
    fraud_unusual_amount = np.ones(n_fraud, dtype=float)

    # High scam correlations: new recipient (85%), new device (65%), unusual location (70%)
    fraud_new_recipient = rng.binomial(n=1, p=0.85, size=n_fraud).astype(float)
    fraud_new_device = rng.binomial(n=1, p=0.65, size=n_fraud).astype(float)
    fraud_unusual_loc = rng.binomial(n=1, p=0.70, size=n_fraud).astype(float)
    fraud_high_freq = rng.binomial(n=1, p=0.55, size=n_fraud).astype(float)
    fraud_repeated_susp = rng.binomial(n=1, p=0.45, size=n_fraud).astype(float)
    fraud_txn_counts = rng.integers(1, 25, size=n_fraud).astype(float)

    X_fraud = np.column_stack([
        fraud_amounts,
        fraud_unusual_amount,
        fraud_multipliers,
        fraud_new_recipient,
        fraud_new_device,
        fraud_unusual_loc,
        fraud_high_freq,
        fraud_repeated_susp,
        fraud_txn_counts,
        fraud_avg_amounts,
    ])
    y_fraud = np.ones(n_fraud, dtype=int)

    # Combine and shuffle
    X = np.vstack([X_legit, X_fraud])
    y = np.concatenate([y_legit, y_fraud])
    indices = rng.permutation(len(y))

    return X[indices], y[indices]


def train_and_save_model(
    model_path: str = DEFAULT_MODEL_PATH,
    n_samples: int = 1500,
    random_seed: int = 42,
) -> Tuple[lgb.LGBMClassifier, Dict[str, float]]:
    """
    Trains a LightGBM binary classifier on synthetic transaction data,
    evaluates its performance, and serializes the model to disk.

    Returns:
        Tuple of (trained_model, metrics_dict)
    """
    global _CACHED_MODEL
    logger.info(f"Generating synthetic dataset with {n_samples} samples (seed={random_seed})...")
    X, y = generate_synthetic_dataset(n_samples=n_samples, random_seed=random_seed)

    # Train / Test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_seed, stratify=y
    )

    # Instantiate LightGBM Classifier
    model = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.05,
        num_leaves=31,
        max_depth=6,
        min_child_samples=10,
        random_state=random_seed,
        class_weight="balanced",
        verbose=-1,
    )

    # Fit model
    model.fit(X_train, y_train)

    # Evaluate on test set
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
        "train_samples": len(y_train),
        "test_samples": len(y_test),
        "total_samples": len(y),
    }

    # Save to disk
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    logger.info(f"Saved LightGBM model to {model_path}")

    # Also save LightGBM booster text format for portability
    try:
        model.booster_.save_model(DEFAULT_LGB_TXT_PATH)
    except Exception as e:
        logger.warning(f"Could not save booster text format: {e}")

    # Cache model in memory
    _CACHED_MODEL = model
    return model, metrics


def load_ml_model(model_path: str = DEFAULT_MODEL_PATH) -> Optional[lgb.LGBMClassifier]:
    """
    Loads the trained LightGBM model from disk or cache.
    If the model file is not found, attempts to automatically train and initialize it.
    Returns None if loading fails.
    """
    global _CACHED_MODEL

    if _CACHED_MODEL is not None:
        return _CACHED_MODEL

    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            _CACHED_MODEL = model
            logger.info(f"Loaded LightGBM model from {model_path}")
            return model
        except Exception as e:
            logger.error(f"Failed to load model from {model_path}: {e}")
            return None

    # If model file does not exist, automatically train and initialize
    try:
        logger.info(f"Model file not found at {model_path}. Training initial model...")
        model, _ = train_and_save_model(model_path=model_path)
        _CACHED_MODEL = model
        return model
    except Exception as e:
        logger.error(f"Failed to auto-train model: {e}")
        return None


def predict_transaction_risk(
    transaction: Dict[str, Any],
    signals: Dict[str, Any],
    model: Optional[lgb.LGBMClassifier] = None,
) -> Dict[str, Any]:
    """
    Calculates ML scam/fraud probability, risk score (0-100), and prediction label.

    Parameters:
        transaction: Incoming transaction details.
        signals: Extracted behavioral signals.
        model: Optional pre-loaded LightGBM model. If None, loads from cache/disk.

    Returns:
        Dict with keys:
            - is_available: bool
            - probability: Optional[float] (0.0000 to 1.0000)
            - risk_score: Optional[int] (0 to 100)
            - prediction_label: Optional[str] ("SUSPICIOUS" or "LEGITIMATE")
            - model_name: str
            - details: Optional[str]
    """
    active_model = model or load_ml_model()

    if active_model is None:
        return {
            "is_available": False,
            "probability": None,
            "risk_score": None,
            "prediction_label": None,
            "model_name": "LightGBM Classifier",
            "details": "ML model is currently unavailable or failed to load.",
        }

    try:
        features = extract_ml_features(transaction, signals)
        proba_array = active_model.predict_proba(features)
        fraud_prob = float(proba_array[0, 1])
        ml_risk_score = int(round(fraud_prob * 100))
        prediction_label = "SUSPICIOUS" if fraud_prob >= 0.50 else "LEGITIMATE"

        return {
            "is_available": True,
            "probability": round(fraud_prob, 4),
            "risk_score": ml_risk_score,
            "prediction_label": prediction_label,
            "model_name": "LightGBM Classifier v1.0",
            "details": f"ML model estimated {ml_risk_score}% risk probability using 10 behavioral and transaction features.",
        }
    except Exception as e:
        logger.error(f"Error during ML inference: {e}")
        return {
            "is_available": False,
            "probability": None,
            "risk_score": None,
            "prediction_label": None,
            "model_name": "LightGBM Classifier",
            "details": f"Inference error: {str(e)}",
        }


if __name__ == "__main__":
    print("=== Training LightGBM Model for Scam & Fraud Detection ===")
    model, metrics = train_and_save_model()
    print("\n--- Training Results & Evaluation Metrics ---")
    print(f"Total Dataset Size : {metrics['total_samples']} samples")
    print(f"Training Samples   : {metrics['train_samples']} samples (80%)")
    print(f"Test Samples       : {metrics['test_samples']} samples (20%)")
    print(f"Accuracy           : {metrics['accuracy'] * 100:.2f}%")
    print(f"Precision          : {metrics['precision'] * 100:.2f}%")
    print(f"Recall             : {metrics['recall'] * 100:.2f}%")
    print(f"F1-Score           : {metrics['f1_score'] * 100:.2f}%")
    print(f"ROC-AUC            : {metrics['roc_auc'] * 100:.2f}%")

    # Sample test inference
    sample_txn = {"amount": 35000, "recipient": "scam@upi", "device": "New Phone", "location": "Unknown"}
    sample_signals = {
        "is_unusual_amount": True,
        "amount_multiplier": 15.0,
        "is_new_recipient": True,
        "is_new_device": True,
        "is_unusual_location": True,
        "high_transaction_frequency": True,
        "repeated_suspicious_behavior": True,
        "historical_transaction_count": 6,
        "historical_average_amount": 1700.0,
    }
    result = predict_transaction_risk(sample_txn, sample_signals, model)
    print("\n--- Test Inference on High-Risk Sample ---")
    print(result)
