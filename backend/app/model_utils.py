import joblib
import tensorflow as tf
import os

# Paths to your model and scaler
MODEL_PATH = os.path.join("models", "cnn_loan_default_model.keras")
SCALER_PATH = os.path.join("models", "loan_default_scaler.pkl")

# Load model and scaler
model = tf.keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

def preprocess_input(data, selected_features):
    """
    Takes a dict or pandas DataFrame and returns scaled, reshaped input for CNN.
    """
    import pandas as pd
    import numpy as np
    
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)
    
    df = df[selected_features]
    
    X_scaled = scaler.transform(df)
    X_cnn = np.expand_dims(X_scaled, axis=2)
    return X_cnn
