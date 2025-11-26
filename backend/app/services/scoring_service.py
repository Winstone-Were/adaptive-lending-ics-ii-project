from app.models.user_models import CreditGrade
import math

class ScoringService:
    
    @staticmethod
    def calculate_credit_score(default_probability: float, current_score: float = None) -> float:
        """
        Calculate dynamic credit score based on default probability and payment history
        """
        if current_score is None:
            current_score = 650  # Default starting score
        
        # Base adjustment from default probability
        probability_penalty = default_probability * 100
        
        # Calculate new score
        new_score = current_score - probability_penalty
        
        # Ensure score stays within bounds
        return max(300, min(850, new_score))
    
    @staticmethod
    def get_credit_grade(credit_score: float) -> CreditGrade:
        if credit_score >= 720:
            return CreditGrade.EXCELLENT
        elif credit_score >= 660:
            return CreditGrade.GOOD
        elif credit_score >= 600:
            return CreditGrade.FAIR
        else:
            return CreditGrade.HIGH_RISK
    
    @staticmethod
    def calculate_loan_decision(default_probability: float, current_credit_score: float) -> dict:
        credit_grade = ScoringService.get_credit_grade(current_credit_score)
        
        if default_probability < 0.3:
            decision = "Approve"
            recommendation = "Low risk - favorable terms"
            confidence = 1 - default_probability
        elif default_probability < 0.5:
            decision = "Approve"
            recommendation = "Medium risk - standard terms"
            confidence = 0.8 - default_probability
        elif default_probability < 0.7 and credit_grade != CreditGrade.HIGH_RISK:
            decision = "Approve With Co-Signer"
            recommendation = "Higher risk detected - co-signer recommended"
            confidence = 0.6 - default_probability
        else:
            decision = "Reject"
            recommendation = "High default risk"
            confidence = default_probability
        
        return {
            "default_probability": default_probability,
            "credit_score": current_credit_score,
            "credit_grade": credit_grade,
            "decision": decision,
            "recommendation": recommendation,
            "confidence": max(0, min(1, confidence))
        }