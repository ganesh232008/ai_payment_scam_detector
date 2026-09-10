"""
Decision & Risk Synthesis Engine for AI Payment Scam Detector.

Combines transparent heuristic rule scoring (40%) and statistical LightGBM
machine learning probabilities (60%) into an actionable final decision:
ALLOW, VERIFY, or BLOCK.
"""

from typing import Dict, Any, Optional, List

# Configurable decision weights
RULE_WEIGHT: float = 0.40
ML_WEIGHT: float = 0.60


def calculate_weighted_risk_score(
    rule_score: int,
    ml_score: Optional[int],
) -> int:
    """
    Calculates the combined weighted risk score from rule-based and ML outputs.

    Formula:
        If ML score is available:
            final_score = round(RULE_WEIGHT * rule_score + ML_WEIGHT * ml_score)
        If ML score is unavailable (fallback mode):
            final_score = rule_score

    Returns:
        Integer risk score clamped to range [0, 100].
    """
    if ml_score is None:
        raw_score = float(rule_score)
    else:
        raw_score = (RULE_WEIGHT * float(rule_score)) + (ML_WEIGHT * float(ml_score))

    clamped_score = max(0, min(100, int(round(raw_score))))
    return clamped_score


def determine_risk_level_and_action(final_risk_score: int) -> tuple[str, str]:
    """
    Maps the final risk score to categorical risk level and automated decision action.

    Thresholds:
        Score >= 70 : Risk Level = HIGH   -> Final Decision = BLOCK
        Score >= 35 : Risk Level = MEDIUM -> Final Decision = VERIFY
        Score <  35 : Risk Level = LOW    -> Final Decision = ALLOW

    Returns:
        Tuple of (final_risk_level: str, final_decision: str)
    """
    if final_risk_score >= 70:
        return "HIGH", "BLOCK"
    elif final_risk_score >= 35:
        return "MEDIUM", "VERIFY"
    else:
        return "LOW", "ALLOW"


def synthesize_risk_decision(
    rule_score: int,
    ml_result: Optional[Dict[str, Any]] = None,
    reasons: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Synthesizes the rule-based evaluation and ML inference into a final risk decision payload.

    Parameters:
        rule_score: Heuristic score (0-100) from rules.py.
        ml_result: Optional dictionary containing ML prediction details (ml_model.py).
        reasons: Human-readable behavioral explanatory reasons.

    Returns:
        Dictionary containing:
            - rule_score: int
            - ml_score: Optional[int]
            - final_risk_score: int
            - final_risk_level: str ("LOW", "MEDIUM", "HIGH")
            - final_decision: str ("ALLOW", "VERIFY", "BLOCK")
            - weights_used: Dict[str, float]
            - explanation: str
    """
    ml_score: Optional[int] = None
    if ml_result and ml_result.get("is_available", False):
        ml_score = ml_result.get("risk_score")

    final_risk_score = calculate_weighted_risk_score(rule_score, ml_score)
    final_risk_level, final_decision = determine_risk_level_and_action(final_risk_score)

    if ml_score is not None:
        explanation = (
            f"Combined rule score ({rule_score} × {int(RULE_WEIGHT * 100)}%) and "
            f"ML score ({ml_score} × {int(ML_WEIGHT * 100)}%) "
            f"yielded final risk score of {final_risk_score}/100 ({final_risk_level}) -> Decision: {final_decision}."
        )
    else:
        explanation = (
            f"ML model unavailable. Fallback to 100% rule-based score of {final_risk_score}/100 "
            f"({final_risk_level}) -> Decision: {final_decision}."
        )

    return {
        "rule_score": rule_score,
        "ml_score": ml_score,
        "final_risk_score": final_risk_score,
        "final_risk_level": final_risk_level,
        "final_decision": final_decision,
        "weights_used": {
            "rule_weight": RULE_WEIGHT if ml_score is not None else 1.0,
            "ml_weight": ML_WEIGHT if ml_score is not None else 0.0,
        },
        "explanation": explanation,
    }
