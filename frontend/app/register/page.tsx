"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  DollarSign,
  Calendar,
  Building,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    income: "",
    date_of_birth: "",
    employmet_start_date: "", // Note: Typo kept to match backend model
    bank_name: "",
  });

  const { register } = useAuth();
  const router = useRouter();

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Financial Details" },
    { number: 3, title: "Employment & Bank" },
    { number: 4, title: "Review" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.password) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        return true;
      case 2:
        if (!formData.income) {
          toast.error("Please enter your annual income");
          return false;
        }
        if (!formData.date_of_birth) {
          toast.error("Please enter your date of birth");
          return false;
        }
        // Basic age validation (at least 18 years old)
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (age < 18 || (age === 18 && monthDiff < 0)) {
          toast.error("You must be at least 18 years old to register");
          return false;
        }
        return true;
      case 3:
        if (!formData.employmet_start_date) {
          toast.error("Please enter your employment start date");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const calculateAge = (dateString: string): number => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const calculateMonthsEmployed = (startDateString: string): number => {
    const startDate = new Date(startDateString);
    const today = new Date();
    const months =
      (today.getFullYear() - startDate.getFullYear()) * 12 +
      (today.getMonth() - startDate.getMonth());
    return Math.max(0, months);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        income: formData.income,
        date_of_birth: formData.date_of_birth,
        employment_start_date: formData.employmet_start_date,
      };

      await register(formData.email, formData.password, userData);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full h-14 px-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full h-14 px-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full h-14 px-4 pr-12 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#141414]/40 hover:text-[#141414]/60"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-base text-[#141414]/50 mt-2">
                At least 8 characters with letters & numbers.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Annual Income (Ksh)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#141414]/50" />
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => handleInputChange("income", e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                  placeholder="50000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#141414]/50" />
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleInputChange("date_of_birth", e.target.value)
                  }
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {formData.date_of_birth && (
                <p className="text-base text-[#141414]/50 mt-2">
                  Age: {calculateAge(formData.date_of_birth)} years old
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Employment Start Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#141414]/50" />
                <input
                  type="date"
                  value={formData.employmet_start_date}
                  onChange={(e) =>
                    handleInputChange("employmet_start_date", e.target.value)
                  }
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {formData.employmet_start_date && (
                <p className="text-base text-[#141414]/50 mt-2">
                  Employed for:{" "}
                  {calculateMonthsEmployed(formData.employmet_start_date)}{" "}
                  months
                </p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Bank Name (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#141414]/50" />
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) =>
                    handleInputChange("bank_name", e.target.value)
                  }
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                  placeholder="e.g., Equity Bank, KCB, Co-operative Bank"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-[#EFF0F2] rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-[#0D21A1]" />
                <div>
                  <p className="font-medium text-[#141414]">
                    Personal Information
                  </p>
                  <p className="text-[#141414]/70">{formData.name}</p>
                  <p className="text-[#141414]/70">{formData.email}</p>
                  <p className="text-[#141414]/70">
                    Date of Birth:{" "}
                    {formData.date_of_birth
                      ? new Date(formData.date_of_birth).toLocaleDateString()
                      : "Not provided"}
                    {formData.date_of_birth &&
                      ` (${calculateAge(formData.date_of_birth)} years old)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-[#0D21A1]" />
                <div>
                  <p className="font-medium text-[#141414]">
                    Financial Details
                  </p>
                  <p className="text-[#141414]/70">
                    Annual Income:{" "}
                    {formData.income
                      ? `Ksh${parseFloat(formData.income).toLocaleString()}`
                      : "Not provided"}
                  </p>
                  <p className="text-[#141414]/70">
                    Bank: {formData.bank_name || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-5 h-5 text-[#0D21A1]" />
                <div>
                  <p className="font-medium text-[#141414]">Employment</p>
                  <p className="text-[#141414]/70">
                    Start Date:{" "}
                    {formData.employmet_start_date
                      ? new Date(
                          formData.employmet_start_date
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                  <p className="text-[#141414]/70">
                    {formData.employmet_start_date &&
                      `Months Employed: ${calculateMonthsEmployed(
                        formData.employmet_start_date
                      )}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#EEC643]/10 border border-[#EEC643] rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-[#EEC643]" />
                <p className="text-[#141414] font-medium">Customer Account</p>
              </div>
              <p className="text-[#141414]/70 text-sm mt-1">
                Apply for loans and manage your credit profile with AI-powered
                risk assessment.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Gradient Background */}
      <div
        className="hidden lg:flex lg:w-2/5 p-6 xl:p-12 flex-col justify-center text-white"
        style={{
          background:
            "linear-gradient(to bottom, #EEC643 20%, #0D21A1 50%, #011638 100%)",
        }}
      >
        <div className="max-w-md">
          <h1 className="text-xl font-semibold mb-8">Adaptive Lending</h1>
          <h2 className="text-2xl xl:text-4xl font-bold mb-6 leading-tight">
            Start Your Loan Journey
          </h2>
          <p className="text-base xl:text-lg opacity-90 leading-relaxed">
            Join thousands of customers who trust our AI-powered platform for
            fair loan decisions and personalized credit scoring.
          </p>

          {/* Steps Preview */}
          <div className="mt-8 space-y-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.number
                      ? "bg-white text-[#011638]"
                      : "bg-white/20 text-white"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={
                    currentStep >= step.number ? "text-white" : "text-white/70"
                  }
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 lg:w-3/5 bg-[#EFF0F2] p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#141414] mb-3">
              Create Customer Account
            </h1>
            <p className="text-lg text-[#141414]/70">
              Step {currentStep} of {steps.length}:{" "}
              {steps.find((s) => s.number === currentStep)?.title}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      currentStep >= step.number
                        ? "bg-[#EEC643] text-[#141414]"
                        : "bg-[#EFF0F2] border border-[#011638]/20 text-[#141414]/50"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-xs ${
                      currentStep >= step.number
                        ? "text-[#141414]"
                        : "text-[#141414]/50"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-[#EFF0F2] rounded-full h-2">
              <div
                className="bg-[#EEC643] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="flex space-x-4 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 h-14 bg-white border border-[#011638]/20 text-[#141414] hover:bg-[#EFF0F2]"
                >
                  Back
                </Button>
              )}

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-14 bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-14 bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              )}
            </div>
          </form>

          <div className="text-center space-y-5 mt-10">
            <p className="text-xs text-[#141414]/50">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-[#0D21A1] hover:text-[#0D21A1]/80 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-[#0D21A1] hover:text-[#0D21A1]/80 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>

            <p className="text-sm text-[#141414]/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#0D21A1] hover:text-[#0D21A1]/80 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
