"""
Pydantic schemas for data validation and OpenAPI documentation.
Defines the request, response, behavioral signal, ML prediction, and decision models.
"""

from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field


class TransactionRequest(BaseModel):
    """
    Request model for incoming payment transaction details.
    """
    amount: float = Field(..., description="Transaction monetary amount in currency units", json_schema_extra={"example": 25000})
    recipient: str = Field(..., description="Recipient UPI ID, account, or phone handle", json_schema_extra={"example": "test@upi"})
    device: str = Field(..., description="Device name or identifier used for payment", json_schema_extra={"example": "My Phone"})
    location: str = Field(..., description="Geographical location or city of initiation", json_schema_extra={"example": "Chennai"})
    user_id: Optional[str] = Field(default="user_101", description="Identifier of the user initiating payment", json_schema_extra={"example": "user_101"})
    category: Optional[Literal["Food", "Travel", "Shopping", "Bills", "Other"]] = Field(
        default=None,
        description="Optional spending category used for history and analytics only",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "amount": 25000,
                    "recipient": "test@upi",
                    "device": "My Phone",
                    "location": "Chennai",
                    "user_id": "user_101"
                }
            ]
        }
    }


class BehavioralSignals(BaseModel):
    """
    Behavioral signals calculated by comparing current transaction against historical baseline.
    """
    is_unusual_amount: bool = Field(..., description="True if amount significantly exceeds historical average")
    amount_multiplier: float = Field(..., description="Ratio of current amount to historical average")
    is_new_recipient: bool = Field(..., description="True if user has never transacted with this recipient")
    is_new_device: bool = Field(..., description="True if payment is initiated from an unrecognized device")
    is_unusual_location: bool = Field(..., description="True if payment is initiated from an unfamiliar location")
    high_transaction_frequency: bool = Field(..., description="True if high transaction velocity observed in past 24h")
    repeated_suspicious_behavior: bool = Field(..., description="True if previous transactions had failed/flagged status")
    historical_transaction_count: int = Field(..., description="Total previous transactions analyzed")
    historical_average_amount: float = Field(..., description="Historical average transaction amount")


class MLPredictionResult(BaseModel):
    """
    Machine Learning model prediction metrics and classification output.
    """
    is_available: bool = Field(..., description="Whether the ML model is loaded and operational")
    probability: Optional[float] = Field(None, description="Predicted fraud/scam probability (0.0000 - 1.0000)")
    risk_score: Optional[int] = Field(None, description="ML risk score scaled from 0 to 100")
    prediction_label: Optional[str] = Field(None, description="Classification label ('LEGITIMATE' or 'SUSPICIOUS')")
    model_name: Optional[str] = Field("LightGBM Classifier v1.0", description="Name/version of the ML model")
    details: Optional[str] = Field(None, description="Explanatory details or error message if unavailable")


class TransactionResponse(BaseModel):
    """
    Response model returning the analyzed transaction details, behavioral signals,
    rule-based evaluation, ML predictions, and combined final risk decision.
    """
    amount: float
    recipient: str
    device: str
    location: str
    risk_score: int
    risk_level: str
    reasons: List[str]
    behavioral_signals: BehavioralSignals
    ml_result: Optional[MLPredictionResult] = Field(
        default=None,
        description="Machine learning prediction details from LightGBM model"
    )

    # Phase 5 Decision Layer Fields
    rule_score: int = Field(..., description="Rule-based heuristic risk score (0-100, 40% weight)")
    ml_score: Optional[int] = Field(None, description="LightGBM machine learning risk score (0-100, 60% weight)")
    final_risk_score: int = Field(..., description="Combined weighted final risk score (0-100)")
    final_risk_level: str = Field(..., description="Final risk classification level: 'LOW', 'MEDIUM', or 'HIGH'")
    final_decision: str = Field(..., description="Operational automated transaction decision: 'ALLOW', 'VERIFY', or 'BLOCK'")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "amount": 25000,
                    "recipient": "test@upi",
                    "device": "My Phone",
                    "location": "Chennai",
                    "risk_score": 60,
                    "risk_level": "MEDIUM",
                    "reasons": [
                        "Transaction amount of Rs. 25,000.00 is significantly higher (14.71x) than historical average (Rs. 1,700.00)",
                        "Payment recipient 'test@upi' is new with no prior transaction history"
                    ],
                    "behavioral_signals": {
                        "is_unusual_amount": True,
                        "amount_multiplier": 14.71,
                        "is_new_recipient": True,
                        "is_new_device": False,
                        "is_unusual_location": False,
                        "high_transaction_frequency": False,
                        "repeated_suspicious_behavior": False,
                        "historical_transaction_count": 6,
                        "historical_average_amount": 1700.0
                    },
                    "ml_result": {
                        "is_available": True,
                        "probability": 0.8245,
                        "risk_score": 82,
                        "prediction_label": "SUSPICIOUS",
                        "model_name": "LightGBM Classifier v1.0",
                        "details": "ML model estimated 82% risk probability using 10 behavioral and transaction features."
                    },
                    "rule_score": 60,
                    "ml_score": 82,
                    "final_risk_score": 73,
                    "final_risk_level": "HIGH",
                    "final_decision": "BLOCK"
                }
            ]
        }
    }
