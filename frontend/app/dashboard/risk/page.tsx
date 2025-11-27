"use client";
import { GlassCard } from "@/components/ui/GlassCard";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/utils";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Download,
} from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function RiskAnalysis() {
  const pdfRef = useRef<HTMLDivElement>(null);

  const { data: riskAnalysis, isLoading } = useQuery({
    queryKey: ["risk-analysis"],
    queryFn: () => apiRequest("/banks/analytics/risk"),
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["performance-metrics"],
    queryFn: () => apiRequest("/banks/analytics/performance"),
  });

  const { data: loanDetails, isLoading: loanDetailsLoading } = useQuery({
    queryKey: ["loan-details"],
    queryFn: () => apiRequest("/banks/loans/detailed"),
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const downloadPDF = () => {
    if (!pdfRef.current) return;

    // Add print-only class
    document.body.classList.add("print-mode");

    // Wait a microsecond for class to apply
    setTimeout(() => {
      window.print();
      document.body.classList.remove("print-mode");
    }, 50);
  };

  if (isLoading || performanceLoading || loanDetailsLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EEC643] mx-auto"></div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return "text-red-600";
    if (score >= 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return "High Risk";
    if (score >= 0.4) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Download Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#141414]">Risk Analysis</h1>
          <p className="text-[#141414]/70">
            Comprehensive risk assessment of your loan portfolio
          </p>
        </div>
      </div>

      {/* PDF Content */}
      <div ref={pdfRef} className="bg-white p-6 space-y-6" id="pdf-section">
        {/* Report Header for PDF */}
        <div className="text-center border-b-2 border-[#EEC643] pb-4 mb-6">
          <h1 className="text-3xl font-bold text-[#141414]">
            Risk Analysis Report
          </h1>
          <p className="text-[#141414]/70">
            Generated on {new Date().toLocaleDateString()}
          </p>
          <p className="text-[#141414]/70">Portfolio Summary</p>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141414]/70 text-sm">Average Risk Score</p>
                <p className="text-2xl font-bold text-[#141414]">
                  {riskAnalysis?.average_risk_score
                    ? (riskAnalysis.average_risk_score * 100).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-sm text-[#141414]/70">Portfolio Average</p>
              </div>
              <Shield className="w-8 h-8 text-[#011638]" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141414]/70 text-sm">High Risk Loans</p>
                <p className="text-2xl font-bold text-red-600">
                  {riskAnalysis?.high_risk_loans || 0}
                </p>
                <p className="text-sm text-[#141414]/70">Requires Attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141414]/70 text-sm">Portfolio Health</p>
                <p className="text-2xl font-bold text-[#141414]">
                  {performance?.portfolio_health || "Good"}
                </p>
                <p className="text-sm text-[#141414]/70">Overall Status</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#EEC643]" />
              <h3 className="text-lg font-semibold text-[#141414]">
                Risk Distribution
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#141414]">High Risk</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${
                          ((riskAnalysis?.high_risk_loans || 0) /
                            (riskAnalysis?.total_analyzed_loans || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-[#141414] font-medium w-12 text-right">
                    {riskAnalysis?.high_risk_loans || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#141414]">Medium Risk</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${
                          ((riskAnalysis?.medium_risk_loans || 0) /
                            (riskAnalysis?.total_analyzed_loans || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-[#141414] font-medium w-12 text-right">
                    {riskAnalysis?.medium_risk_loans || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#141414]">Low Risk</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          ((riskAnalysis?.low_risk_loans || 0) /
                            (riskAnalysis?.total_analyzed_loans || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-[#141414] font-medium w-12 text-right">
                    {riskAnalysis?.low_risk_loans || 0}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Performance Metrics */}
          <GlassCard className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#0D21A1]" />
              <h3 className="text-lg font-semibold text-[#141414]">
                Performance Metrics
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#141414]">Default Rate</span>
                <span className="font-semibold text-[#141414]">
                  {performance?.default_rate
                    ? `${performance.default_rate.toFixed(1)}%`
                    : "0%"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#141414]">Recovery Rate</span>
                <span className="font-semibold text-[#141414]">
                  {performance?.recovery_rate
                    ? `${performance.recovery_rate.toFixed(1)}%`
                    : "0%"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#141414]">Avg Approval Time</span>
                <span className="font-semibold text-[#141414]">
                  {performance?.avg_time_to_approval
                    ? `${performance.avg_time_to_approval.toFixed(1)}h`
                    : "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#141414]">Customer Satisfaction</span>
                <span className="font-semibold text-[#141414]">
                  {performance?.customer_satisfaction_score || 85}/100
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Risk by Credit Grade */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">
            Risk Analysis by Credit Grade
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riskAnalysis?.risk_by_grade &&
              Object.entries(riskAnalysis.risk_by_grade).map(
                ([grade, data]: [string, any]) => (
                  <div
                    key={grade}
                    className="text-center p-4 bg-[#EFF0F2] rounded-lg"
                  >
                    <p className="text-lg font-bold text-[#141414] capitalize">
                      {grade}
                    </p>
                    <p className="text-2xl font-bold text-[#141414]">
                      {data.count}
                    </p>
                    <p className="text-sm text-[#141414]/70">Loans</p>
                    <p className="text-sm text-[#141414]/70">
                      Avg Risk: {(data.avg_risk * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm font-semibold text-[#141414]">
                      ${(data.total_volume / 1000).toFixed(1)}K
                    </p>
                  </div>
                )
              )}
          </div>
        </GlassCard>

        {/* Individual Loan Analysis */}
        {loanDetails?.loans && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-[#141414] mb-4">
              Individual Loan Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#EEC643]">
                    <th className="text-left py-3 px-4 text-[#141414] font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-[#141414] font-semibold">
                      Loan Amount
                    </th>
                    <th className="text-left py-3 px-4 text-[#141414] font-semibold">
                      Credit Grade
                    </th>
                    <th className="text-left py-3 px-4 text-[#141414] font-semibold">
                      Risk Score
                    </th>
                    <th className="text-left py-3 px-4 text-[#141414] font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-[#141414] font-semibold">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loanDetails.loans.slice(0, 10).map((loan: any) => (
                    <tr
                      key={loan.id}
                      className="border-b border-[#EFF0F2] hover:bg-[#EFF0F2]"
                    >
                      <td className="py-3 px-4 text-[#141414]">
                        <div>
                          <p className="font-medium">{loan.customer_name}</p>
                          <p className="text-sm text-[#141414]/70">
                            {loan.customer_id}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#141414]">
                        ${(loan.amount / 1000).toFixed(1)}K
                      </td>
                      <td className="py-3 px-4 text-[#141414] capitalize">
                        {loan.credit_grade}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${getRiskColor(
                            loan.risk_score
                          )}`}
                        >
                          {(loan.risk_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getRiskLevel(loan.risk_score) === "High Risk"
                              ? "bg-red-100 text-red-800"
                              : getRiskLevel(loan.risk_score) === "Medium Risk"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {getRiskLevel(loan.risk_score)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#141414]">
                        {loan.duration_months} months
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loanDetails.loans.length > 10 && (
              <p className="text-center text-[#141414]/70 mt-4">
                Showing 10 of {loanDetails.loans.length} loans
              </p>
            )}
          </GlassCard>
        )}

        {/* Summary Statistics */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">
            Portfolio Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#EFF0F2] rounded-lg">
              <p className="text-2xl font-bold text-[#141414]">
                {riskAnalysis?.total_analyzed_loans || 0}
              </p>
              <p className="text-sm text-[#141414]/70">Total Loans</p>
            </div>
            <div className="text-center p-4 bg-[#EFF0F2] rounded-lg">
              <p className="text-2xl font-bold text-[#141414]">
                $
                {((riskAnalysis?.total_portfolio_value || 0) / 1000000).toFixed(
                  1
                )}
                M
              </p>
              <p className="text-sm text-[#141414]/70">Portfolio Value</p>
            </div>
            <div className="text-center p-4 bg-[#EFF0F2] rounded-lg">
              <p className="text-2xl font-bold text-[#141414]">
                {performance?.active_loans || 0}
              </p>
              <p className="text-sm text-[#141414]/70">Active Loans</p>
            </div>
            <div className="text-center p-4 bg-[#EFF0F2] rounded-lg">
              <p className="text-2xl font-bold text-[#141414]">
                {performance?.delinquent_loans || 0}
              </p>
              <p className="text-sm text-[#141414]/70">Delinquent</p>
            </div>
          </div>
        </GlassCard>

        {/* PDF Footer */}
        <div className="text-center border-t-2 border-[#EEC643] pt-4 mt-6">
          <p className="text-[#141414]/70 text-sm">
            Confidential Risk Analysis Report - Generated by Bank Analytics
            System
          </p>
          <p className="text-[#141414]/70 text-sm">
            Page 1 of 1 - {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
