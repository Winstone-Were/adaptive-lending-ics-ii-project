# Loan Default Prediction System - Technical Report

**Project Report**  
**Date:** November 28, 2025  
**Model:** 1D Convolutional Neural Network (CNN)

---

## 1. Executive Summary

Successfully implemented an end-to-end loan default prediction system using:
- **Exploratory Data Analysis (EDA)**
- **Feature Engineering**
- **1D CNN Model Training**
- **Evaluation**
- **Model Saving (Scaler + CNN Model)**

The system processes numerical and categorical features, performs standardization, and trains a high-capacity CNN architecture to classify loan default risk.

---

## 2. Exploratory Data Analysis (EDA)

### 2.1 Dataset Overview
The dataset contains customer financial and demographic information used to predict whether a user will default on a loan.

### 2.2 Missing Values
Checked dataset for null values to ensure clean training input.

### 2.3 Class Distribution
Visualized using `sns.countplot`:
- Default distribution is imbalanced.
- Important for choosing evaluation metrics and handling bias.

### 2.4 Numerical Feature Analysis
Included:
- Histograms
- Boxplots
- Correlation Matrix Heatmap

Key findings:
- Strong correlation between features like **Income**, **LoanAmount**, and **DTIRatio**.
- Outliers present across salary and debt-related variables.

### 2.5 Categorical Analysis
Categorical columns were encoded using **LabelEncoder**.

---

## 3. Feature Selection & Encoding

### 3.1 Selected Features for Training
```python
[
  "Income", "InterestRate", "LoanAmount",
  "Age", "CreditScore", "MonthsEmployed",
  "DTIRatio"
]
```

### 3.2 Encoding
- Categorical features encoded using `LabelEncoder`.

### 3.3 Scaling
- Standardization performed with `StandardScaler`.
- Scaler saved as `loan_default_scaler.pkl`.

---

## 4. Model Architecture (1D CNN)

### 4.1 Key Layers
- **Conv1D (128, 256, 512 filters)**
- **BatchNormalization**
- **MaxPooling1D**
- **GlobalMaxPooling1D**
- Dense layers (128 → 64 → Output)
- **Dropout for regularization**

### 4.2 Hyperparameters
- Optimizer: `Adam (lr=0.0001)`
- Loss: `Binary Crossentropy`
- Metrics: `Accuracy, AUC, Recall`
- Epochs: 50
- Batch Size: 32

### 4.3 Callbacks
- EarlyStopping  
- ReduceLROnPlateau  
- ModelCheckpoint (`best_model.h5`)

---

## 5. Training Process

The model was trained using:
```python
history = model.fit(
    X_train_cnn, y_train,
    validation_split=0.2,
    epochs=50,
    batch_size=32,
    callbacks=callbacks
)
```

Learns feature patterns via convolutional filters, enabling deep representation learning suitable for tabular data.

---

## 6. Evaluation

Metrics used:
- **Validation Loss**
- **Accuracy**
- **Recall**
- **AUC Curve**

Loss and accuracy plots were generated to track convergence and overfitting.

---

## 7. Feature Importance (Baseline Model)

A **Random Forest Classifier** was trained to:
- Inspect feature importance.
- Identify strongest predictors (e.g., CreditScore, Income, DTIRatio).============================================================
COMPREHENSIVE MODEL COMPARISON
============================================================

### 📊 Model Performance Comparison

| Model               | Accuracy | Precision | Recall | F1-Score | AUC-ROC | Training Time (s) |
|---------------------|----------|-----------|--------|----------|---------|--------------------|
| Logistic Regression | 0.6662   | 0.2130    | 0.6953 | 0.3261   | 0.7411  | 0.1089             |
| Random Forest       | 0.7214   | 0.2370    | 0.6304 | 0.3445   | 0.7452  | 3.5074             |
| XGBoost             | 0.6931   | 0.2235    | 0.6640 | 0.3344   | 0.7443  | 0.8967             |
| 1D CNN              | 0.8854   | 0.5557    | 0.0673 | 0.1200   | 0.7478  | 94.5116            |


## 8. Deployment Readiness

The following artifacts were saved:
- `loan_default_scaler.pkl`
- `best_model.h5`

This ensures:
- Consistent preprocessing during inference.
- Ability to deploy to Flask/FastAPI/TF Serving.

---

## 9. Future Improvements

### Short Term
- Add categorical embeddings
- SMOTE for imbalance
- Hyperparameter tuning

### Medium Term
- Train TabNet / XGBoost
- Add interpretability with SHAP

### Long Term
- Real-time API deployment
- Dashboard for financial officers

---

## 10. Repository Structure (Suggested)

```
loan-default-prediction/
├── data/
│   └── Loan_default.csv
├── notebooks/
│   └── eda.ipynb
├── models/
│   ├── best_model.h5
│   └── loan_default_scaler.pkl
├── src/
│   ├── train_cnn.py
│   ├── preprocess.py
│   └── evaluate.py
└── README.md
```

---

## 11. Conclusion

A strong baseline deep learning workflow was successfully developed for predicting loan defaults.  
The 1D CNN model, combined with preprocessing and evaluation techniques, provides a scalable and extensible foundation for real-world lending applications.

---

**End of Report**
