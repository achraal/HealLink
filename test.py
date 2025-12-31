import time
import uuid
import firebase_admin
from firebase_admin import credentials, firestore

# Init Firebase
cred = credentials.Certificate("heallink-project-firebase-adminsdk-fbsvc-7de9de9fb6.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Create QR session (NGO shows QR)
session_id = str(uuid.uuid4())

session_ref = db.collection("qr_sessions").document(session_id)
session_ref.set({
    "ngo_id": 1,
    "campaign_id": 100,
    "status": "waiting"
})

print("\nQR SESSION CREATED")
print("Scan this QR session id from another device:")
print(session_id)
print("\nWaiting for scan...\n")

# Listen for changes
def on_snapshot(doc_snapshot, changes, read_time):
    for doc in doc_snapshot:
        data = doc.to_dict()
        print("UPDATE:", data)

        if data["status"] == "confirmed":
            print("\nDONATION CONFIRMED 🎉")
            print("Donor:", data["donor_id"])
            print("Amount:", data["amount"])
            print("Saving to database...")
            exit(0)

session_ref.on_snapshot(on_snapshot)

# Keep script alive
while True:
    time.sleep(1)




