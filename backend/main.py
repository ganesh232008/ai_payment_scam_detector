"""
Main FastAPI application for AI Payment Scam Detector.
Provides health check and transaction risk analysis endpoints integrating
behavioral anomaly detection, rule-based heuristics, LightGBM machine learning inference,
and automated risk decision synthesis (ALLOW / VERIFY / BLOCK).
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import local modules with support for both direct execution and package imports
try:
    from schemas import (
        TransactionRequest,
        TransactionResponse,
        BehavioralSignals,
        MLPredictionResult,
    )
    from history import get_all_transactions, get_transaction_history, record_transaction
    from behavioral import extract_behavioral_signals
    from rules import evaluate_risk_rules
    from ml_model import load_ml_model, predict_transaction_risk
    from decision import synthesize_risk_decision
except ImportError:
    from backend.schemas import (
        TransactionRequest,
        TransactionResponse,
        BehavioralSignals,
        MLPredictionResult,
    )
    from backend.history import get_all_transactions, get_transaction_history, record_transaction
    from backend.behavioral import extract_behavioral_signals
    from backend.rules import evaluate_risk_rules
    from backend.ml_model import load_ml_model, predict_transaction_risk
    from backend.decision import synthesize_risk_decision


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler to pre-load and initialize the LightGBM model on startup.
    """
    # Initialize ML model if available or train baseline if first run
    load_ml_model()
    yield


# Initialize FastAPI application
app = FastAPI(
    title="AI Payment Scam Detector Backend",
    description=(
        "Backend API for detecting potentially fraudulent or scam payment transactions. "
        "Phase 5 integrates behavioral anomaly detection, rule-based heuristics, "
        "LightGBM machine learning inference, and weighted decision synthesis (ALLOW / VERIFY / BLOCK)."
    ),
    version="0.5.0",
    lifespan=lifespan,
)

# Enable CORS for communication with the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health Check"])
def read_root():
    """
    Health check endpoint to verify backend status.
    Returns a simple confirmation message.
    """
    return {
        "message": "AI Payment Scam Detector Backend is running",
        "version": "0.5.0",
        "phase": 5,
    }


@app.get("/api/transactions", tags=["Transaction History"])
def list_transactions(user_id: str | None = None):
    """Return Firestore transaction history with the local fallback when needed."""
    return get_all_transactions(user_id)


@app.post("/api/analyze", response_model=TransactionResponse, tags=["Transaction Analysis"])
def analyze_transaction(transaction: TransactionRequest):
    """
    Analyze a transaction for scam and fraud indicators using a multi-layer evaluation pipeline:
    1. Behavioral comparison against historical user baseline.
    2. Transparent heuristic rule-based risk scoring (0-100) and explanations.
    3. Machine learning (LightGBM) statistical fraud probability and classification.
    4. Decision synthesis combining Rule Score (40%) and ML Score (60%) into final action (ALLOW / VERIFY / BLOCK).

    Returns the transaction details, behavioral signals, rule-based evaluation, ML prediction, and final decision.
    """
    transaction_dict = transaction.model_dump()

    # Step 1: Retrieve historical transactions for the user
    history = get_transaction_history(transaction.user_id)

    # Step 2: Compute behavioral signals against historical baseline
    signals_dict = extract_behavioral_signals(transaction_dict, history)

    # Step 3: Evaluate rule-based risk score and explanations via heuristic engine
    rule_score, rule_level, reasons = evaluate_risk_rules(transaction_dict, signals_dict)

    # Step 4: Evaluate ML risk score and prediction probability via LightGBM model
    ml_output = predict_transaction_risk(transaction_dict, signals_dict)

    # Step 5: Synthesize final weighted risk score, category, and operational decision
    decision_output = synthesize_risk_decision(
        rule_score=rule_score,
        ml_result=ml_output,
        reasons=reasons,
    )

    # Step 6: Record the complete analysis for future history and auditing.
    transaction_record = dict(transaction_dict)
    transaction_record.update({
        "risk_score": rule_score,
        "risk_level": rule_level,
        "final_risk_score": decision_output["final_risk_score"],
        "final_risk_level": decision_output["final_risk_level"],
        "final_decision": decision_output["final_decision"],
        "behavioral_signals": signals_dict,
        "rule_score": decision_output["rule_score"],
        "ml_score": decision_output["ml_score"],
        "reasons": reasons,
    })
    record_transaction(transaction_record, transaction.user_id)

    # Step 7: Construct and return validated response with both individual and synthesized results
    return TransactionResponse(
        amount=transaction.amount,
        recipient=transaction.recipient,
        device=transaction.device,
        location=transaction.location,
        risk_score=rule_score,
        risk_level=rule_level,
        reasons=reasons,
        behavioral_signals=BehavioralSignals(**signals_dict),
        ml_result=MLPredictionResult(**ml_output),
        rule_score=decision_output["rule_score"],
        ml_score=decision_output["ml_score"],
        final_risk_score=decision_output["final_risk_score"],
        final_risk_level=decision_output["final_risk_level"],
        final_decision=decision_output["final_decision"],
    )
