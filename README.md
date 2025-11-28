# Adaptive Lending:  A 1 Dimension Convolution Neural Network for Credit Default Prediction
![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white&labelColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=white&labelColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?logo=tensorflow&logoColor=white&labelColor=black)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white&labelColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal?logo=fastapi&logoColor=white&labelColor=black)


## Developer Information
**Name:** Amaumo Winstone Were  
**Program:** ICS 2025  
**Admission Number:** 150797

## Project Overview
The Adaptive Lending Platform is a full-stack web application that provides banks and financial institutions with AI-powered loan risk assessment, automated loan processing, and comprehensive analytics. The system uses a 1D Convolutional Neural Network (CNN) to predict loan default probabilities with high accuracy.

## System Architecture

### Backend Structure
```
backend/
├── app/
│   ├── models/
│   │   ├── user_models.py
│   │   ├── loan_models.py
│   │   └── analytics_models.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── customers.py
│   │   ├── loan_packages.py
│   │   └── admin.py
│   ├── services/
│   │   ├── loan_service.py
│   │   ├── scoring_service.py
│   │   └── analytics_service.py
│   ├── utils/
│   │   ├── auth_utils.py
│   │   └── firestore_utils.py
│   └── middleware/
└── models/
    ├── cnn_loan_default_model.keras
    └── loan_default_scaler.pkl
```

### Frontend Structure
```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── admin/
│   │   ├── customer/
│   │   ├── apply/
│   │   ├── analytics/
│   │   └── monitoring/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   └── contexts/
└── lib/
    └── firebase/
```

## Machine Learning Model

### Model Architecture
```
1D CNN with:
- 3 convolutional layers
- Batch normalization
- Dropout
- Dense layers
```

### Performance
- Accuracy: ~85%
- Precision: ~82%
- Recall: ~79%
- AUC: ~0.89

### Input Features
- Income
- Interest Rate
- Loan Amount
- Age
- Credit Score
- Months Employed
- DTI Ratio

## Features

### Core Functionality
- Multi-role Authentication (Admin, Bank Staff, Customer)
- AI-powered Risk Assessment
- Automated Loan Processing
- Real-time Analytics Dashboard
- Loan Package Management
- System Monitoring

### User Roles
- **Customers:** Apply for loans, track applications
- **Bank Staff:** Review applications, manage customers
- **Admin:** System monitoring, analytics, user management

### Technical Features
- Real-time Risk Scoring
- Automated Decisioning
- Comprehensive Reporting
- Multi-tenant Architecture

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Firebase Project
- TensorFlow 2.x

### Backend Setup
```
cd backend
pip install -r requirements.txt
export FIREBASE_CREDENTIALS="path/to/credentials.json"
export MODEL_PATH="./models/cnn_loan_default_model.keras"
uvicorn app.main:app --reload
```

### Frontend Setup
```
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## API Endpoints

### Authentication
- POST /auth/login
- POST /auth/register
- POST /auth/google

### Loan Management
- POST /loans/apply
- GET /loans/pending
- PUT /loans/{id}/status
- GET /loans/history

### Analytics
- GET /analytics/overview
- GET /analytics/risk-metrics
- GET /analytics/performance

## Model Configuration
```
selected_features = [
    "Income",
    "InterestRate",
    "LoanAmount",
    "Age",
    "CreditScore",
    "MonthsEmployed",
    "DTIRatio"
]
```

## Business Impact
- Reduced default risk
- Faster processing
- Data-driven lending decisions
- High scalability

## Future Enhancements
- External credit bureau integration
- Explainable AI
- Mobile app
- Ensemble models
- Fraud detection
- Blockchain verification

## License
MIT License
