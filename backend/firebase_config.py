from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore


SERVICE_ACCOUNT_FILE = (
    Path(__file__).resolve().parent
    / "credentials"
    / "aipaymentmodel-firebase-adminsdk-fbsvc-4ff95caeb5.json"
)

if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(str(SERVICE_ACCOUNT_FILE)))

db = firestore.client()
