"""
Comprehensive Test Suite for Phase 5 Risk Decision Synthesis Layer & API Integration.
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from history import reset_mock_history
from decision import (
    calculate_weighted_risk_score,
    determine_risk_level_and_action,
    synthesize_risk_decision,
    RULE_WEIGHT,
    ML_WEIGHT,
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_history():
    """Reset mock history before every test to ensure state isolation."""
    reset_mock_history()
    yield
    reset_mock_history()



class TestDecisionUnitLogic:
    """Unit tests verifying the exact mathematical weighting and decision thresholds."""

    def test_weights_constants(self):
        assert RULE_WEIGHT == 0.40
        assert ML_WEIGHT == 0.60
        assert (RULE_WEIGHT + ML_WEIGHT) == 1.00

    def test_weighted_score_calculation(self):
        # 40% * 60 + 60% * 80 = 24 + 48 = 72
        score = calculate_weighted_risk_score(rule_score=60, ml_score=80)
        assert score == 72

        # 40% * 10 + 60% * 5 = 4 + 3 = 7
        score_low = calculate_weighted_risk_score(rule_score=10, ml_score=5)
        assert score_low == 7

        # Fallback when ML is None
        score_fallback = calculate_weighted_risk_score(rule_score=55, ml_score=None)
        assert score_fallback == 55

    def test_boundary_thresholds(self):
        # Score < 35 -> LOW / ALLOW
        assert determine_risk_level_and_action(0) == ("LOW", "ALLOW")
        assert determine_risk_level_and_action(34) == ("LOW", "ALLOW")

        # Score >= 35 and < 70 -> MEDIUM / VERIFY
        assert determine_risk_level_and_action(35) == ("MEDIUM", "VERIFY")
        assert determine_risk_level_and_action(50) == ("MEDIUM", "VERIFY")
        assert determine_risk_level_and_action(69) == ("MEDIUM", "VERIFY")

        # Score >= 70 -> HIGH / BLOCK
        assert determine_risk_level_and_action(70) == ("HIGH", "BLOCK")
        assert determine_risk_level_and_action(95) == ("HIGH", "BLOCK")
        assert determine_risk_level_and_action(100) == ("HIGH", "BLOCK")

    def test_low_risk_synthesis(self):
        # Rule=10, ML=0 -> Final Score = 4 (LOW, ALLOW)
        res = synthesize_risk_decision(
            rule_score=10,
            ml_result={"is_available": True, "risk_score": 0},
            reasons=["Normal spending pattern"],
        )
        assert res["rule_score"] == 10
        assert res["ml_score"] == 0
        assert res["final_risk_score"] == 4
        assert res["final_risk_level"] == "LOW"
        assert res["final_decision"] == "ALLOW"

    def test_medium_risk_synthesis(self):
        # Rule=40, ML=50 -> Final Score = 46 (MEDIUM, VERIFY)
        res = synthesize_risk_decision(
            rule_score=40,
            ml_result={"is_available": True, "risk_score": 50},
            reasons=["New recipient"],
        )
        assert res["rule_score"] == 40
        assert res["ml_score"] == 50
        assert res["final_risk_score"] == 46
        assert res["final_risk_level"] == "MEDIUM"
        assert res["final_decision"] == "VERIFY"

    def test_high_risk_synthesis(self):
        # Rule=90, ML=100 -> Final Score = 96 (HIGH, BLOCK)
        res = synthesize_risk_decision(
            rule_score=90,
            ml_result={"is_available": True, "risk_score": 100},
            reasons=["High amount anomaly", "New device", "New location"],
        )
        assert res["rule_score"] == 90
        assert res["ml_score"] == 100
        assert res["final_risk_score"] == 96
        assert res["final_risk_level"] == "HIGH"
        assert res["final_decision"] == "BLOCK"

    def test_fallback_synthesis_when_ml_unavailable(self):
        # When ML is unavailable, fallback gracefully to rule score
        res = synthesize_risk_decision(
            rule_score=60,
            ml_result={"is_available": False, "risk_score": None},
            reasons=["Unusual amount"],
        )
        assert res["rule_score"] == 60
        assert res["ml_score"] is None
        assert res["final_risk_score"] == 60
        assert res["final_risk_level"] == "MEDIUM"
        assert res["final_decision"] == "VERIFY"
        assert "ML model unavailable" in res["explanation"]



class TestApiAnalyzeScenarios:
    """Integration tests verifying /api/analyze for LOW, MEDIUM, and HIGH decision scenarios."""

    def test_api_health_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["phase"] == 5
        assert data["version"] == "0.5.0"

    def test_api_scenario_low_allow(self):
        """Standard familiar transaction that should result in LOW risk and ALLOW decision."""
        payload = {
            "amount": 500.0,
            "recipient": "groceries@upi",
            "device": "My Phone",
            "location": "Chennai",
            "user_id": "user_101",
        }
        response = client.post("/api/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Decision fields
        assert data["final_risk_score"] < 35
        assert data["final_risk_level"] == "LOW"
        assert data["final_decision"] == "ALLOW"
        assert data["rule_score"] < 35
        assert data["ml_score"] is not None

        # Preserved fields
        assert len(data["reasons"]) > 0
        assert "behavioral_signals" in data
        assert data["amount"] == 500.0

    def test_api_scenario_medium_verify(self, monkeypatch):
        """Moderate risk transaction that results in MEDIUM risk and VERIFY decision."""
        # Test realistic synthesis in API when rule-based or ML signals reflect moderate risk
        payload = {
            "amount": 2500.0,
            "recipient": "new_electronics_store@upi",
            "device": "New Tablet",
            "location": "Chennai",
            "user_id": "user_101",
        }
        # Simulate moderate ML prediction (probability ~0.45, risk_score=45)
        from ml_model import predict_transaction_risk
        def mock_predict(txn, signals, model=None):
            return {
                "is_available": True,
                "probability": 0.45,
                "risk_score": 45,
                "prediction_label": "LEGITIMATE",
                "model_name": "LightGBM Classifier v1.0",
                "details": "Moderate risk signals evaluated.",
            }
        monkeypatch.setattr("main.predict_transaction_risk", mock_predict)

        response = client.post("/api/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Rule score = 45 (10 base + 20 new recipient + 15 new device)
        # ML score = 45
        # Final risk score = 0.40 * 45 + 0.60 * 45 = 45 (MEDIUM / VERIFY)
        assert 35 <= data["final_risk_score"] < 70
        assert data["final_risk_level"] == "MEDIUM"
        assert data["final_decision"] == "VERIFY"
        assert data["rule_score"] == 45
        assert data["ml_score"] == 45
        assert len(data["reasons"]) >= 2

    def test_api_scenario_high_block(self):
        """Severe scam anomaly (huge amount, new device, unknown recipient) that must BLOCK."""
        payload = {
            "amount": 95000.0,
            "recipient": "urgent_crypto_airdrop@upi",
            "device": "Unknown Device 007",
            "location": "Remote Island",
            "user_id": "user_101",
        }
        response = client.post("/api/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Decision assertions
        assert data["final_risk_score"] >= 70
        assert data["final_risk_level"] == "HIGH"
        assert data["final_decision"] == "BLOCK"
        assert data["rule_score"] >= 70
        assert data["ml_score"] >= 70
        assert len(data["reasons"]) >= 3

    def test_api_response_schema_completeness(self):
        """Verify all Phase 5 decision fields are present in API response."""
        payload = {
            "amount": 500.0,
            "recipient": "groceries@upi",
            "device": "My Phone",
            "location": "Chennai",
            "user_id": "user_101",
        }
        response = client.post("/api/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()

        # Phase 5 required fields
        assert "rule_score" in data
        assert "ml_score" in data
        assert "final_risk_score" in data
        assert "final_risk_level" in data
        assert "final_decision" in data
        assert data["final_decision"] in ("ALLOW", "VERIFY", "BLOCK")
        assert data["final_risk_level"] in ("LOW", "MEDIUM", "HIGH")

