"use client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import {
  User,
  Mail,
  DollarSign,
  Calendar,
  Briefcase,
  MapPin,
} from "lucide-react";

export default function CustomerProfile() {
  const { userProfile, refreshUserProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || "",
    income: userProfile?.income || "",
    age: userProfile?.age || "",
    months_employed: userProfile?.months_employed || "",
    current_employment: userProfile?.current_employment || "",
    address: userProfile?.address || "",
  });

  const { data: profile } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: () => apiRequest("/customers/profile"),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/customers/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      refreshUserProfile();
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
    },
    onError: (error: any) => {
      toast.error("Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">Profile</h1>
        <p className="text-[#141414]/70">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <GlassCard className="p-6 lg:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-[#EEC643] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-[#141414]" />
            </div>
            <h2 className="text-xl font-bold text-[#141414]">
              {userProfile?.name}
            </h2>
            <p className="text-[#141414]/70">{userProfile?.email}</p>
            <div className="mt-4 p-3 bg-[#EEC643] rounded-lg">
              <p className="text-[#141414] font-semibold">Credit Score</p>
              <p className="text-2xl font-bold text-[#141414]">
                {userProfile?.current_credit_score || "N/A"}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Profile Form */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[#141414]">
              Personal Information
            </h3>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Email
                </label>
                <div className="flex items-center px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg">
                  <Mail className="w-4 h-4 text-[#141414]/50 mr-2" />
                  <span className="text-[#141414]">{userProfile?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Annual Income
                </label>
                <div className="flex relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">Ksh</span>
                  </div>
                  <input
                    type="number"
                    value={formData.income}
                    onChange={(e) =>
                      setFormData({ ...formData, income: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-14 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Age
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Months Employed
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    value={formData.months_employed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        months_employed: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Current Employment
                </label>
                <input
                  type="text"
                  value={formData.current_employment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_employment: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#141414]/50" />
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-[#0D21A1] hover:bg-[#0D21A1]/90 text-[#EFF0F2]"
              >
                {updateProfileMutation.isPending
                  ? "Updating..."
                  : "Save Changes"}
              </Button>
            )}
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
