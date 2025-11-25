import os
from firebase_admin import credentials, firestore, auth
import firebase_admin

# Resolve path relative to this file
SERVICE_ACCOUNT_PATH = os.path.join(os.path.dirname(__file__), "adaptive-lending-firebase-adminsdk-fbsvc-05ddcda299.json")

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

db = firestore.client()
