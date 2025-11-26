from app.firebase_admin import users_ref

def get_user_by_uid(uid: str):
    doc = users_ref.document(uid).get()
    if doc.exists:
        return doc.to_dict()
    return None

def user_exists(uid: str) -> bool:
    doc = users_ref.document(uid).get()
    return doc.exists