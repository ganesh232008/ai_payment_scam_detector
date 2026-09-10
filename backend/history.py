"""Transaction history access with Firestore and an in-memory fallback."""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

try:
    from firebase_config import db
except Exception:
    # The backend can still run when Firebase is not configured or reachable.
    db = None


TRANSACTIONS_COLLECTION = "transactions"

# Reference baseline time for deterministic/mock data
_NOW = datetime.now(timezone.utc)

# Mock historical transactions representing past spending behavior
MOCK_TRANSACTION_HISTORY: Dict[str, List[Dict[str, Any]]] = {
    "user_101": [
        {
            "transaction_id": "txn_1001",
            "amount": 450.0,
            "recipient": "groceries@upi",
            "device": "My Phone",
            "location": "Chennai",
            "timestamp": (_NOW - timedelta(days=12)).isoformat(),
            "status": "SUCCESS",
        },
        {
            "transaction_id": "txn_1002",
            "amount": 1200.0,
            "recipient": "utility_bill@upi",
            "device": "My Phone",
            "location": "Chennai",
            "timestamp": (_NOW - timedelta(days=9)).isoformat(),
            "status": "SUCCESS",
        },
        {
            "transaction_id": "txn_1003",
            "amount": 3500.0,
            "recipient": "landlord@upi",
            "device": "My Phone",
            "location": "Chennai",
            "timestamp": (_NOW - timedelta(days=6)).isoformat(),
            "status": "SUCCESS",
        },
        {
            "transaction_id": "txn_1004",
            "amount": 850.0,
            "recipient": "mom@upi",
            "device": "My Phone",
            "location": "Chennai",
            "timestamp": (_NOW - timedelta(days=3)).isoformat(),
            "status": "SUCCESS",
        },
        {
            "transaction_id": "txn_1005",
            "amount": 2200.0,
            "recipient": "cafe_chennai@upi",
            "device": "My Phone",
            "location": "Chennai",
            "timestamp": (_NOW - timedelta(hours=36)).isoformat(),
            "status": "SUCCESS",
        },
        {
            "transaction_id": "txn_1006",
            "amount": 1800.0,
            "recipient": "bookstore@upi",
            "device": "MacBook Pro",
            "location": "Bangalore",
            "timestamp": (_NOW - timedelta(hours=14)).isoformat(),
            "status": "SUCCESS",
        },
    ],
    "user_102": [
        # User with recent suspicious/failed activity
        {
            "transaction_id": "txn_2001",
            "amount": 50000.0,
            "recipient": "unknown_crypto@upi",
            "device": "Unknown Device",
            "location": "Kolkata",
            "timestamp": (_NOW - timedelta(minutes=45)).isoformat(),
            "status": "FAILED",
        },
        {
            "transaction_id": "txn_2002",
            "amount": 45000.0,
            "recipient": "unknown_crypto@upi",
            "device": "Unknown Device",
            "location": "Kolkata",
            "timestamp": (_NOW - timedelta(minutes=15)).isoformat(),
            "status": "FLAGGED",
        },
    ],
}


def get_transaction_history(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve historical transactions for a user.
    Falls back to 'user_101' as the default profile if none specified.
    """
    uid = user_id or "user_101"

    if db is not None:
        try:
            firestore_history = [
                document.to_dict()
                for document in db.collection(TRANSACTIONS_COLLECTION)
                .where("user_id", "==", uid)
                .stream()
            ]
            if firestore_history:
                return firestore_history
        except Exception:
            # Network, credentials, or permission errors use the local baseline.
            pass

    fallback_uid = uid if uid in MOCK_TRANSACTION_HISTORY else "user_101"
    return list(MOCK_TRANSACTION_HISTORY.get(fallback_uid, []))


def get_all_transactions(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Return stored transactions, using mock history when Firestore is unavailable."""
    if db is not None:
        try:
            query = db.collection(TRANSACTIONS_COLLECTION)
            if user_id:
                query = query.where("user_id", "==", user_id)
            firestore_history = [document.to_dict() for document in query.stream()]
            if firestore_history:
                return firestore_history
        except Exception:
            pass

    if user_id:
        return get_transaction_history(user_id)

    return [transaction for history in MOCK_TRANSACTION_HISTORY.values() for transaction in history]


def record_transaction(transaction_data: Dict[str, Any], user_id: Optional[str] = None) -> None:
    """
    Append a completed transaction to local history and Firestore when available.
    """
    firestore_uid = user_id or "user_101"
    local_uid = (
        firestore_uid if firestore_uid in MOCK_TRANSACTION_HISTORY else "user_101"
    )
    if local_uid not in MOCK_TRANSACTION_HISTORY:
        MOCK_TRANSACTION_HISTORY[local_uid] = []

    new_record = dict(transaction_data)
    new_record.update({
        "transaction_id": transaction_data.get(
            "transaction_id",
            f"txn_{len(MOCK_TRANSACTION_HISTORY[local_uid]) + 1001}",
        ),
        "user_id": firestore_uid,
        "amount": float(transaction_data.get("amount", 0.0)),
        "recipient": str(transaction_data.get("recipient", "")),
        "device": str(transaction_data.get("device", "")),
        "location": str(transaction_data.get("location", "")),
        "timestamp": transaction_data.get(
            "timestamp", datetime.now(timezone.utc).isoformat()
        ),
        "status": transaction_data.get("status", "SUCCESS"),
    })
    MOCK_TRANSACTION_HISTORY[local_uid].append(new_record)

    if db is not None:
        try:
            db.collection(TRANSACTIONS_COLLECTION).document().set(new_record)
        except Exception:
            # Persistence is best effort; local history remains available.
            pass


def reset_mock_history() -> None:
    """
    Resets local history and clears persisted mock-user transactions.
    Useful for ensuring test isolation across integration tests.
    """
    global MOCK_TRANSACTION_HISTORY

    if db is not None:
        try:
            for user_id in MOCK_TRANSACTION_HISTORY:
                documents = (
                    db.collection(TRANSACTIONS_COLLECTION)
                    .where("user_id", "==", user_id)
                    .stream()
                )
                for document in documents:
                    document.reference.delete()
        except Exception:
            # Reset still works for local tests if Firestore is unavailable.
            pass

    now = datetime.now(timezone.utc)
    MOCK_TRANSACTION_HISTORY.clear()
    MOCK_TRANSACTION_HISTORY.update({
        "user_101": [
            {
                "transaction_id": "txn_1001",
                "amount": 450.0,
                "recipient": "groceries@upi",
                "device": "My Phone",
                "location": "Chennai",
                "timestamp": (now - timedelta(days=12)).isoformat(),
                "status": "SUCCESS",
            },
            {
                "transaction_id": "txn_1002",
                "amount": 1200.0,
                "recipient": "utility_bill@upi",
                "device": "My Phone",
                "location": "Chennai",
                "timestamp": (now - timedelta(days=9)).isoformat(),
                "status": "SUCCESS",
            },
            {
                "transaction_id": "txn_1003",
                "amount": 3500.0,
                "recipient": "landlord@upi",
                "device": "My Phone",
                "location": "Chennai",
                "timestamp": (now - timedelta(days=6)).isoformat(),
                "status": "SUCCESS",
            },
            {
                "transaction_id": "txn_1004",
                "amount": 850.0,
                "recipient": "mom@upi",
                "device": "My Phone",
                "location": "Chennai",
                "timestamp": (now - timedelta(days=3)).isoformat(),
                "status": "SUCCESS",
            },
            {
                "transaction_id": "txn_1005",
                "amount": 2200.0,
                "recipient": "cafe_chennai@upi",
                "device": "My Phone",
                "location": "Chennai",
                "timestamp": (now - timedelta(hours=36)).isoformat(),
                "status": "SUCCESS",
            },
            {
                "transaction_id": "txn_1006",
                "amount": 1800.0,
                "recipient": "bookstore@upi",
                "device": "MacBook Pro",
                "location": "Bangalore",
                "timestamp": (now - timedelta(hours=14)).isoformat(),
                "status": "SUCCESS",
            },
        ],
        "user_102": [
            {
                "transaction_id": "txn_2001",
                "amount": 50000.0,
                "recipient": "unknown_crypto@upi",
                "device": "Unknown Device",
                "location": "Kolkata",
                "timestamp": (now - timedelta(minutes=45)).isoformat(),
                "status": "FAILED",
            },
            {
                "transaction_id": "txn_2002",
                "amount": 45000.0,
                "recipient": "unknown_crypto@upi",
                "device": "Unknown Device",
                "location": "Kolkata",
                "timestamp": (now - timedelta(minutes=15)).isoformat(),
                "status": "FLAGGED",
            },
        ],
    })

