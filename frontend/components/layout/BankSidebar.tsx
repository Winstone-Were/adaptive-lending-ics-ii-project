"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Shield,
  LogOut,
  Home,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const bankRoutes = [
  { href: "/dashboard/bank", label: "Dashboard", icon: Home },
  { href: "/dashboard/pending", label: "Pending Loans", icon: FileText },
  { href: "/dashboard/active", label: "Active Loans", icon: TrendingUp },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/risk", label: "Risk Analysis", icon: Shield },
  { href: "/dashboard/packages", label: "Loan Packages", icon: Package },
];

export default function BankSidebar() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!userProfile) return null;

  return (
    <div className="flex flex-col h-full bg-[#0D21A1]/90 backdrop-blur-md text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#EEC643]/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-[#141414]" />
          </div>
          <div>
            <h2 className="font-semibold">{userProfile.name}</h2>
            <p className="text-[#EEC643] text-sm">Bank</p>
            {userProfile.bank_name && (
              <p className="text-white/70 text-xs">{userProfile.bank_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {bankRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;

          return (
            <button
              key={route.href}
              onClick={() => router.push(route.href)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-[#EEC643] text-[#141414] shadow-lg"
                  : "text-white/80 hover:bg-[#EEC643]/20 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{route.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#EEC643]/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
