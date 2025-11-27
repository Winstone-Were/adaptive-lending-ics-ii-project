"use client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  History,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerDashboard() {
  const router = useRouter();

  const { userProfile } = useAuth();

  const { data: loans } = useQuery({
    queryKey: ["customer-loans"],
    queryFn: () => apiRequest("/customers/loans"),
  });

  const activeLoans =
    loans?.loans?.filter(
      (loan: any) => loan.status === "active" || loan.status === "approved"
    ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">
          Customer Dashboard
        </h1>
        <p className="text-[#141414]/70">Welcome back, {userProfile?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Credit Score</p>
              <p className="text-2xl font-bold text-[#141414]">
                {userProfile?.current_credit_score
                  ? userProfile.current_credit_score.toFixed(0)
                  : "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#141414]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Active Loans</p>
              <p className="text-2xl font-bold text-[#141414]">
                {activeLoans.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0D21A1] rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#EFF0F2]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Debt</p>
              <p className="text-2xl font-bold text-[#141414]">
                Ksh {userProfile?.total_debt || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#011638] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#EFF0F2]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard/apply")}
              className="w-full bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
            <Button
              onClick={() => router.push("/dashboard/loans")}
              className="w-full bg-[#0D21A1] hover:bg-[#0D21A1]/90 text-[#EFF0F2]"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View My Loans
            </Button>
            <Button
              onClick={() => router.push("/dashboard/profile")}
              className="w-full bg-[#011638] hover:bg-[#011638]/90 text-[#EFF0F2]"
            >
              <User className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">
            Recent Loans
          </h3>
          <div className="space-y-3">
            {loans?.loans?.slice(0, 3).map((loan: any) => (
              <div
                key={loan.loan_id}
                className="flex items-center justify-between p-3 bg-[#EFF0F2] rounded-lg"
              >
                <div>
                  <p className="font-medium text-[#141414]">
                    ${loan.application_data.loan_amount}
                  </p>
                  <p className="text-sm text-[#141414]/70 capitalize">
                    {loan.status}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    loan.status === "approved"
                      ? "bg-[#EEC643] text-[#141414]"
                      : loan.status === "pending"
                      ? "bg-[#0D21A1] text-[#EFF0F2]"
                      : "bg-[#011638] text-[#EFF0F2]"
                  }`}
                >
                  {loan.status}
                </div>
              </div>
            ))}
            {(!loans?.loans || loans.loans.length === 0) && (
              <p className="text-[#141414]/70 text-center py-4">No loans yet</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
