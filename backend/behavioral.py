"""
Behavioral Feature Extraction Module.

Analyzes an incoming transaction in the context of previous transaction history
to extract key behavioral signals and anomalies.
In Phase 4, these extracted features will serve as input features for the LightGBM ML model.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any


def extract_behavioral_signals(
    current_transaction: Dict[str, Any],
    history: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Extracts behavioral comparison signals between current transaction and history.

    Parameters:
        current_transaction: Dict containing amount, recipient, device, location.
        history: List of historical transaction dictionaries.

    Returns:
        Dict of computed behavioral signals (booleans, multipliers, velocity counts).
    """
    amount = float(current_transaction.get("amount", 0.0))
    recipient = str(current_transaction.get("recipient", "")).strip().lower()
    device = str(current_transaction.get("device", "")).strip().lower()
    location = str(current_transaction.get("location", "")).strip().lower()

    # Default metrics if no history exists (cold start)
    if not history:
        return {
            "is_unusual_amount": False,
            "amount_multiplier": 1.0,
            "is_new_recipient": True,
            "is_new_device": True,
            "is_unusual_location": True,
            "high_transaction_frequency": False,
            "repeated_suspicious_behavior": False,
            "historical_transaction_count": 0,
            "historical_average_amount": 0.0,
        }

    # 1. Historical Amount Analysis
    past_amounts = [float(txn.get("amount", 0.0)) for txn in history]
    avg_amount = sum(past_amounts) / len(past_amounts) if past_amounts else 0.0
    amount_multiplier = round(amount / avg_amount, 2) if avg_amount > 0 else 1.0

    # Unusual amount: transaction is at least 3.0x higher than typical historical average
    is_unusual_amount = amount_multiplier >= 3.0 or (avg_amount > 0 and amount > max(past_amounts) * 2.0)

    # 2. Recipient Analysis
    known_recipients = {str(txn.get("recipient", "")).strip().lower() for txn in history}
    is_new_recipient = recipient not in known_recipients

    # 3. Device Analysis
    known_devices = {str(txn.get("device", "")).strip().lower() for txn in history}
    is_new_device = device not in known_devices

    # 4. Location Analysis
    known_locations = {str(txn.get("location", "")).strip().lower() for txn in history}
    is_unusual_location = location not in known_locations

    # 5. Transaction Frequency (Velocity in recent 24 hours)
    now = datetime.now(timezone.utc)
    recent_24h_count = 0
    recent_suspicious_count = 0

    for txn in history:
        ts_str = txn.get("timestamp")
        status = str(txn.get("status", "SUCCESS")).upper()
        if ts_str:
            try:
                txn_time = datetime.fromisoformat(ts_str)
                # Ensure timezone awareness
                if txn_time.tzinfo is None:
                    txn_time = txn_time.replace(tzinfo=timezone.utc)
                diff = now - txn_time
                if diff <= timedelta(hours=24):
                    recent_24h_count += 1
                    if status in ("FAILED", "FLAGGED"):
                        recent_suspicious_count += 1
            except (ValueError, TypeError):
                continue

    # High frequency if more than 3 transactions occurred in the last 24 hours
    high_transaction_frequency = recent_24h_count >= 3

    # 6. Repeated Suspicious Behavior (any recent failed/flagged transactions or multiple previous flags)
    total_flagged = sum(1 for txn in history if str(txn.get("status", "")).upper() in ("FAILED", "FLAGGED"))
    repeated_suspicious_behavior = recent_suspicious_count > 0 or total_flagged >= 2

    return {
        "is_unusual_amount": is_unusual_amount,
        "amount_multiplier": amount_multiplier,
        "is_new_recipient": is_new_recipient,
        "is_new_device": is_new_device,
        "is_unusual_location": is_unusual_location,
        "high_transaction_frequency": high_transaction_frequency,
        "repeated_suspicious_behavior": repeated_suspicious_behavior,
        "historical_transaction_count": len(history),
        "historical_average_amount": round(avg_amount, 2),
    }
