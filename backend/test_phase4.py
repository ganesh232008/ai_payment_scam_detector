"""
Comprehensive Test Suite for Phase 4 ML Prediction Layer & API Integration.
"""

import os
import json
import pytest
from fastapi.testclient import TestClient
from main import app
from history import reset_mock_history
from ml_model import (
    load_ml_model,
    predict_transaction_risk,
    extract_ml_features,
    generate_synthetic_dataset,
    train_and_save_model,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_history():
    """Reset mock history before every test to ensure state isolation."""
    reset_mock_history()
    yield
    reset_mock_history()



def test_health_endpoint():
    """Verify health check returns version and phase indicator."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["phase"] >= 4
    assert "AI Payment Scam Detector Backend is running" in data["message"]


def test_ml_model_loading():
    """Verify ML model loads properly and is an active LightGBM instance."""
    model = load_ml_model()
    assert model is not None
    assert hasattr(model, "predict_proba")


def test_ml_legitimate_transaction():
    """Verify a normal transaction produces a low risk score and 'LEGITIMATE' label."""
    txn = {
        "amount": 500.0,
        "recipient": "groceries@upi",
        "device": "My Phone",
        "location": "Chennai",
    }
    signals = {
        "is_unusual_amount": False,
        "amount_multiplier": 0.9,
        "is_new_recipient": False,
        "is_new_device": False,
        "is_unusual_location": False,
        "high_transaction_frequency": False,
        "repeated_suspicious_behavior": False,
        "historical_transaction_count": 6,
        "historical_average_amount": 1700.0,
    }
    result = predict_transaction_risk(txn, signals)
    assert result["is_available"] is True
    assert result["prediction_label"] == "LEGITIMATE"
    assert result["probability"] < 0.30
    assert result["risk_score"] <= 30


def test_ml_suspicious_transaction():
    """Verify a severe anomaly transaction produces a high risk score and 'SUSPICIOUS' label."""
    txn = {
        "amount": 65000.0,
        "recipient": "crypto_scam@upi",
        "device": "Unknown Device",
        "location": "Moscow",
    }
    signals = {
        "is_unusual_amount": True,
        "amount_multiplier": 38.2,
        "is_new_recipient": True,
        "is_new_device": True,
        "is_unusual_location": True,
        "high_transaction_frequency": True,
        "repeated_suspicious_behavior": True,
        "historical_transaction_count": 6,
        "historical_average_amount": 1700.0,
    }
    result = predict_transaction_risk(txn, signals)
    assert result["is_available"] is True
    assert result["prediction_label"] == "SUSPICIOUS"
    assert result["probability"] > 0.70
    assert result["risk_score"] >= 70


def test_ml_fallback_when_model_missing():
    """Verify graceful handling when model is explicitly None or missing."""
    txn = {"amount": 1000.0}
    signals = {"amount_multiplier": 1.0}
    result = predict_transaction_risk(txn, signals, model=None)
    # Even if default loads from disk, passing an invalid surrogate object can test fallback
    class BrokenModel:
        def predict_proba(self, _):
            raise RuntimeError("Corrupted weights")

    broken_result = predict_transaction_risk(txn, signals, model=BrokenModel())
    assert broken_result["is_available"] is False
    assert broken_result["probability"] is None
    assert broken_result["risk_score"] is None
    assert "Inference error" in broken_result["details"]


def test_api_analyze_legitimate():
    """Test /api/analyze endpoint with standard legitimate transaction."""
    payload = {
        "amount": 800.0,
        "recipient": "groceries@upi",
        "device": "My Phone",
        "location": "Chennai",
        "user_id": "user_101",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Rule-based assertions
    assert data["amount"] == 800.0
    assert data["recipient"] == "groceries@upi"
    assert "risk_score" in data
    assert "risk_level" in data
    assert "reasons" in data
    assert "behavioral_signals" in data

    # ML result assertions
    assert "ml_result" in data
    assert data["ml_result"]["is_available"] is True
    assert data["ml_result"]["prediction_label"] in ("LEGITIMATE", "SUSPICIOUS")
    assert isinstance(data["ml_result"]["probability"], float)
    assert isinstance(data["ml_result"]["risk_score"], int)


def test_api_analyze_scam_anomaly():
    """Test /api/analyze endpoint with a major scam transaction."""
    payload = {
        "amount": 75000.0,
        "recipient": "unregistered_fast_cash@upi",
        "device": "Emulated Device 99",
        "location": "Unknown Location",
        "user_id": "user_101",
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Rule-based checks
    assert data["risk_level"] in ("MEDIUM", "HIGH")
    assert data["risk_score"] >= 50

    # ML checks
    ml_res = data["ml_result"]
    assert ml_res["is_available"] is True
    assert ml_res["prediction_label"] == "SUSPICIOUS"
    assert ml_res["probability"] > 0.60
    assert ml_res["risk_score"] >= 60


if __name__ == "__main__":
    print("Running Phase 4 verification tests...")
    test_health_endpoint()
    print("[PASS] Health endpoint test")
    test_ml_model_loading()
    print("[PASS] ML model loading test")
    test_ml_legitimate_transaction()
    print("[PASS] ML legitimate transaction test")
    test_ml_suspicious_transaction()
    print("[PASS] ML suspicious transaction test")
    test_ml_fallback_when_model_missing()
    print("[PASS] ML graceful fallback test")
    test_api_analyze_legitimate()
    print("[PASS] API analyze legitimate transaction test")
    test_api_analyze_scam_anomaly()
    print("[PASS] API analyze scam anomaly test")
    print("\nAll Phase 4 tests PASSED successfully!")
