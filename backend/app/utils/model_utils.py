import numpy as np
from tensorflow import keras
from app.config import settings
import os

# Global variables for model and scaler
model = None
scaler = None

def load_model():
    """Load the trained model from file"""
    global model
    if model is None:
        try:
            model_path = settings.MODEL_PATH
            model = keras.models.load_model(model_path)
        except Exception as e:
            # Create a dummy model for development
            model = create_dummy_model()
    return model

def load_scaler():
    """Load the scaler from file using joblib"""
    global scaler
    if scaler is None:
        try:
            scaler_path = settings.SCALER_PATH
            import joblib
            scaler = joblib.load(scaler_path)
        except Exception as e:
            # Create a dummy scaler for development
            scaler = create_dummy_scaler()
    return scaler

def create_dummy_model():
    """Create a dummy model for development when real model is not available"""
    model = keras.Sequential([
        keras.layers.Dense(64, activation='relu', input_shape=(7,)),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def create_dummy_scaler():
    """Create a dummy scaler for development"""
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    dummy_data = np.array([
        [50000, 5.0, 25000, 35, 650, 24, 0.3],
        [80000, 3.5, 50000, 45, 750, 60, 0.2],
        [30000, 10.0, 10000, 25, 550, 6, 0.5],
    ])
    scaler.fit(dummy_data)
    return scaler

def preprocess_input(input_data: dict, selected_features: list) -> np.ndarray:
    """
    Preprocess input data for model prediction
    """
    # Load model and scaler if not already loaded
    model = load_model()
    scaler = load_scaler()
    
    # Extract features in the correct order
    feature_values = []
    for feature in selected_features:
        if feature in input_data:
            feature_values.append(input_data[feature])
        else:
            # If feature is missing, use a default value
            default_values = {
                "Income": 50000,
                "InterestRate": 7.5,
                "LoanAmount": 25000,
                "Age": 35,
                "CreditScore": 650,
                "MonthsEmployed": 24,
                "DTIRatio": 0.3
            }
            feature_values.append(default_values.get(feature, 0))
    
    # Convert to numpy array and reshape for single sample
    input_array = np.array(feature_values).reshape(1, -1)
    
    # Scale the input
    scaled_input = scaler.transform(input_array)
    
    return scaled_input

def predict_default_probability(input_data: dict) -> float:
    """
    Predict default probability for given input data
    """
    SELECTED_FEATURES = [
        "Income",
        "InterestRate", 
        "LoanAmount",
        "Age",
        "CreditScore",
        "MonthsEmployed",
        "DTIRatio"
    ]
    
    # Preprocess input
    X_input = preprocess_input(input_data, SELECTED_FEATURES)
    
    # Make prediction
    model = load_model()
    prediction = model.predict(X_input, verbose=0)
    
    return float(prediction[0][0])

# Initialize model and scaler on module import
load_model()
load_scaler()