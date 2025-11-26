from app.firebase_admin import loans_ref, users_ref, repayments_ref, db
from app.models.analytics_models import BankAnalytics, SystemAnalytics
from app.models.user_models import CreditGrade, LoanStatus
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import statistics

class AnalyticsService:
    
    @staticmethod
    async def get_bank_analytics(bank_id: str, time_period: str = "30d") -> BankAnalytics:
        """
        Get comprehensive analytics for a bank
        time_period: "7d", "30d", "90d", "1y"
        """
        # Calculate time filter
        end_date = datetime.utcnow()
        if time_period == "7d":
            start_date = end_date - timedelta(days=7)
        elif time_period == "30d":
            start_date = end_date - timedelta(days=30)
        elif time_period == "90d":
            start_date = end_date - timedelta(days=90)
        elif time_period == "1y":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)  # Default to 30 days
        
        # Get loans processed by this bank
        loans_query = loans_ref.where("bank_id", "==", bank_id).where("created_at", ">=", start_date)
        loans = [loan.to_dict() for loan in loans_query.stream()]
        
        if not loans:
            return BankAnalytics(
                bank_id=bank_id,
                total_loans_processed=0,
                approval_rate=0,
                default_rate=0,
                average_loan_amount=0,
                total_portfolio_value=0,
                risk_distribution={},
                monthly_trends=[]
            )
        
        # Calculate basic metrics
        total_loans = len(loans)
        approved_loans = len([loan for loan in loans if loan.get('status') == LoanStatus.APPROVED])
        active_loans = len([loan for loan in loans if loan.get('status') == LoanStatus.ACTIVE])
        defaulted_loans = len([loan for loan in loans if loan.get('status') == LoanStatus.DEFAULTED])
        
        approval_rate = (approved_loans / total_loans) * 100 if total_loans > 0 else 0
        default_rate = (defaulted_loans / approved_loans) * 100 if approved_loans > 0 else 0
        
        # Calculate financial metrics
        loan_amounts = [loan['application_data']['loan_amount'] for loan in loans]
        average_loan_amount = statistics.mean(loan_amounts) if loan_amounts else 0
        total_portfolio_value = sum(loan_amounts)
        
        # Risk distribution by credit grade
        risk_distribution = {}
        for loan in loans:
            grade = loan.get('credit_grade', 'unknown')
            risk_distribution[grade] = risk_distribution.get(grade, 0) + 1
        
        # Monthly trends
        monthly_trends = AnalyticsService._calculate_monthly_trends(loans, start_date, end_date)
        
        return BankAnalytics(
            bank_id=bank_id,
            total_loans_processed=total_loans,
            approval_rate=approval_rate,
            default_rate=default_rate,
            average_loan_amount=average_loan_amount,
            total_portfolio_value=total_portfolio_value,
            risk_distribution=risk_distribution,
            monthly_trends=monthly_trends
        )
    
    @staticmethod
    def _calculate_monthly_trends(loans: List[Dict], start_date: datetime, end_date: datetime) -> List[Dict]:
        """Calculate monthly trends for loan applications and approvals"""
        trends = []
        current = start_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        while current <= end_date:
            next_month = current.replace(month=current.month + 1) if current.month < 12 else current.replace(year=current.year + 1, month=1)
            
            month_loans = [
                loan for loan in loans 
                if current <= loan['created_at'] < next_month
            ]
            
            month_approved = [
                loan for loan in month_loans 
                if loan.get('status') in [LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.PAID]
            ]
            
            trends.append({
                "month": current.strftime("%Y-%m"),
                "total_applications": len(month_loans),
                "approved_applications": len(month_approved),
                "approval_rate": (len(month_approved) / len(month_loans)) * 100 if month_loans else 0,
                "total_volume": sum(loan['application_data']['loan_amount'] for loan in month_loans)
            })
            
            current = next_month
        
        return trends
    
    @staticmethod
    async def get_system_analytics() -> SystemAnalytics:
        """Get system-wide analytics for admin dashboard"""
        # User statistics
        users = [user.to_dict() for user in users_ref.stream()]
        total_users = len(users)
        customers = [user for user in users if user.get('role') == 'customer']
        banks = [user for user in users if user.get('role') == 'bank']
        admins = [user for user in users if user.get('role') == 'admin']
        
        # Loan statistics
        loans = [loan.to_dict() for loan in loans_ref.stream()]
        total_loans = len(loans)
        active_loans = len([loan for loan in loans if loan.get('status') == LoanStatus.ACTIVE])
        paid_loans = len([loan for loan in loans if loan.get('status') == LoanStatus.PAID])
        defaulted_loans = len([loan for loan in loans if loan.get('status') == LoanStatus.DEFAULTED])
        
        # Financial metrics
        total_loan_volume = sum(loan['application_data']['loan_amount'] for loan in loans)
        active_loan_volume = sum(
            loan['application_data']['loan_amount'] 
            for loan in loans 
            if loan.get('status') in [LoanStatus.ACTIVE, LoanStatus.APPROVED]
        )
        
        # Credit score distribution
        customer_credit_scores = [
            user.get('current_credit_score', 650) 
            for user in customers 
            if user.get('current_credit_score')
        ]
        avg_credit_score = statistics.mean(customer_credit_scores) if customer_credit_scores else 0
        
        # Default probability distribution
        loan_default_probs = [loan.get('default_probability', 0) for loan in loans]
        avg_default_prob = statistics.mean(loan_default_probs) if loan_default_probs else 0
        
        return SystemAnalytics(
            total_users=total_users,
            total_loans=total_loans,
            system_uptime=AnalyticsService._get_system_uptime(),
            model_accuracy=AnalyticsService._calculate_model_accuracy(),
            avg_response_time=0.15,  # Placeholder - would need actual measurement
            active_loans=active_loans,
            total_loan_volume=total_loan_volume,
            customer_count=len(customers),
            bank_count=len(banks),
            admin_count=len(admins),
            paid_loans_count=paid_loans,
            defaulted_loans_count=defaulted_loans,
            average_credit_score=avg_credit_score,
            average_default_probability=avg_default_prob,
            active_loan_volume=active_loan_volume
        )
    
    @staticmethod
    def _get_system_uptime() -> float:
        """Calculate system uptime percentage (placeholder implementation)"""
        # In a real implementation, you'd track start time and calculate uptime
        # For now, return a high percentage
        return 99.8
    
    @staticmethod
    def _calculate_model_accuracy() -> Optional[float]:
        """
        Calculate model accuracy by comparing predictions with actual outcomes
        This requires historical data with actual default outcomes
        """
        try:
            # Get loans that have been completed (paid or defaulted)
            completed_loans = loans_ref.where("status", "in", [LoanStatus.PAID, LoanStatus.DEFAULTED]).stream()
            completed_loans_data = [loan.to_dict() for loan in completed_loans]
            
            if not completed_loans_data:
                return None
            
            correct_predictions = 0
            total_completed = 0
            
            for loan in completed_loans_data:
                predicted_default_prob = loan.get('default_probability', 0.5)
                actual_default = loan.get('status') == LoanStatus.DEFAULTED
                
                # Consider prediction correct if:
                # - Default predicted (prob > 0.5) and actually defaulted
                # - No default predicted (prob <= 0.5) and actually paid
                predicted_default = predicted_default_prob > 0.5
                if predicted_default == actual_default:
                    correct_predictions += 1
                
                total_completed += 1
            
            return (correct_predictions / total_completed) * 100 if total_completed > 0 else None
        
        except Exception as e:
            print(f"Error calculating model accuracy: {e}")
            return None
    
    @staticmethod
    async def get_risk_analysis(bank_id: Optional[str] = None) -> Dict:
        """
        Get detailed risk analysis for loans
        """
        if bank_id:
            loans_query = loans_ref.where("bank_id", "==", bank_id)
        else:
            loans_query = loans_ref
        
        loans = [loan.to_dict() for loan in loans_query.stream()]
        
        if not loans:
            return {
                "high_risk_loans": 0,
                "medium_risk_loans": 0,
                "low_risk_loans": 0,
                "average_risk_score": 0,
                "risk_by_grade": {}
            }
        
        # Categorize loans by risk
        high_risk = [loan for loan in loans if loan.get('default_probability', 0) > 0.7]
        medium_risk = [loan for loan in loans if 0.3 < loan.get('default_probability', 0) <= 0.7]
        low_risk = [loan for loan in loans if loan.get('default_probability', 0) <= 0.3]
        
        # Average risk score
        avg_risk_score = statistics.mean([loan.get('default_probability', 0) for loan in loans])
        
        # Risk distribution by credit grade
        risk_by_grade = {}
        for loan in loans:
            grade = loan.get('credit_grade', 'unknown')
            if grade not in risk_by_grade:
                risk_by_grade[grade] = {
                    "count": 0,
                    "avg_risk": 0,
                    "total_volume": 0
                }
            
            risk_by_grade[grade]["count"] += 1
            risk_by_grade[grade]["avg_risk"] += loan.get('default_probability', 0)
            risk_by_grade[grade]["total_volume"] += loan['application_data']['loan_amount']
        
        # Calculate averages
        for grade in risk_by_grade:
            risk_by_grade[grade]["avg_risk"] /= risk_by_grade[grade]["count"]
        
        return {
            "high_risk_loans": len(high_risk),
            "medium_risk_loans": len(medium_risk),
            "low_risk_loans": len(low_risk),
            "average_risk_score": avg_risk_score,
            "risk_by_grade": risk_by_grade,
            "high_risk_volume": sum(loan['application_data']['loan_amount'] for loan in high_risk),
            "total_analyzed_loans": len(loans)
        }
    
    @staticmethod
    async def get_performance_metrics(bank_id: str) -> Dict:
        """
        Get performance metrics for a bank's loan portfolio
        """
        bank_loans = loans_ref.where("bank_id", "==", bank_id).stream()
        bank_loans_data = [loan.to_dict() for loan in bank_loans]
        
        if not bank_loans_data:
            return {
                "portfolio_health": "No data",
                "recovery_rate": 0,
                "delinquency_rate": 0,
                "avg_time_to_approval": 0,
                "customer_satisfaction_score": 0
            }
        
        # Calculate recovery rate (for defaulted loans)
        defaulted_loans = [loan for loan in bank_loans_data if loan.get('status') == LoanStatus.DEFAULTED]
        recovered_amount = 0  # This would come from recovery records
        
        # Delinquency rate (loans with late payments)
        # This would require payment history analysis
        
        # Average time to approval
        approved_loans = [loan for loan in bank_loans_data if loan.get('status') in [LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.PAID]]
        
        approval_times = []
        for loan in approved_loans:
            application_time = loan.get('created_at')
            # Assuming approval time is stored or we use updated_at for approved status
            approval_time = loan.get('updated_at')
            if application_time and approval_time:
                time_diff = (approval_time - application_time).total_seconds() / 3600  # hours
                approval_times.append(time_diff)
        
        avg_approval_time = statistics.mean(approval_times) if approval_times else 0
        
        # Portfolio health score (composite metric)
        default_rate = (len(defaulted_loans) / len(bank_loans_data)) * 100
        avg_risk = statistics.mean([loan.get('default_probability', 0) for loan in bank_loans_data])
        
        if default_rate < 5 and avg_risk < 0.3:
            portfolio_health = "Excellent"
        elif default_rate < 10 and avg_risk < 0.5:
            portfolio_health = "Good"
        elif default_rate < 15:
            portfolio_health = "Fair"
        else:
            portfolio_health = "Poor"
        
        return {
            "portfolio_health": portfolio_health,
            "recovery_rate": (recovered_amount / sum(loan['application_data']['loan_amount'] for loan in defaulted_loans)) * 100 if defaulted_loans else 0,
            "delinquency_rate": 0,  # Placeholder
            "avg_time_to_approval": avg_approval_time,
            "customer_satisfaction_score": 85,  # Placeholder - would come from surveys
            "default_rate": default_rate,
            "average_risk_score": avg_risk
        }