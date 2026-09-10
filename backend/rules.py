"""
Rule-based Risk Scoring Engine.

Provides a transparent, explainable heuristic scoring system based on computed behavioral signals.
This layer is decoupled from the future Machine Learning (LightGBM) model, which will be integrated in Phase 4.
"""

from typing import Dict, Any, List, Tuple


def evaluate_risk_rules(
    transaction: Dict[str, Any],
    signals: Dict[str, Any],
) -> Tuple[int, str, List[str]]:
    """
    Evaluates rule-based risk score, categorical risk level, and explanatory reasons.

    Parameters:
        transaction: Current transaction dictionary (amount, recipient, device, location).
        signals: Dictionary of behavioral signals computed by behavioral.py.

    Returns:
        Tuple of (risk_score: int, risk_level: str, reasons: List[str]).
    """
    score = 10  # Baseline trust score
    reasons: List[str] = []

    amount = float(transaction.get("amount", 0.0))
    recipient = str(transaction.get("recipient", ""))
    device = str(transaction.get("device", ""))
    location = str(transaction.get("location", ""))

    # 1. Unusual Amount Check (+30)
    if signals.get("is_unusual_amount", False):
        score += 30
        avg_amt = signals.get("historical_average_amount", 0.0)
        mult = signals.get("amount_multiplier", 1.0)
        reasons.append(
            f"Transaction amount of Rs. {amount:,.2f} is significantly higher ({mult}x) than historical average (Rs. {avg_amt:,.2f})"
        )

    # 2. New Recipient Check (+20)
    if signals.get("is_new_recipient", False):
        score += 20
        reasons.append(
            f"Payment recipient '{recipient}' is new with no prior transaction history"
        )

    # 3. New Device Check (+15)
    if signals.get("is_new_device", False):
        score += 15
        reasons.append(
            f"Transaction initiated from unfamiliar device '{device}'"
        )

    # 4. Unusual Location Check (+15)
    if signals.get("is_unusual_location", False):
        score += 15
        reasons.append(
            f"Transaction initiated from unfamiliar location '{location}'"
        )

    # 5. Transaction Frequency Check (+15)
    if signals.get("high_transaction_frequency", False):
        score += 15
        reasons.append(
            "High transaction frequency detected within a short timeframe (velocity anomaly)"
        )

    # 6. Repeated Suspicious Behavior Check (+25)
    if signals.get("repeated_suspicious_behavior", False):
        score += 25
        reasons.append(
            "Account history indicates repeated suspicious or failed payment attempts"
        )

    # Fallback reason for clean low-risk transactions
    if not reasons:
        reasons.append("Transaction conforms to established user spending patterns")

    # Clamp score to [0, 100]
    final_score = max(0, min(100, score))

    # Determine risk level category
    if final_score >= 70:
        risk_level = "HIGH"
    elif final_score >= 35:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return final_score, risk_level, reasons
