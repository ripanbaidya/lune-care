import React from "react";
import { Link } from "react-router-dom";
import { User, MapPin, CalendarDays } from "lucide-react";

import { usePatientProfile } from "../hooks/usePatientProfile";
import { usePatientAddress } from "../hooks/usePatientAddress";

import { ROUTES } from "../../../routes/routePaths";
import { BLOOD_GROUP_LABELS, GENDER_LABELS } from "../types/patient.types";

import DashboardCard from "../../../shared/components/dashboard/DashboardCard";
import HeroStrip from "../../../shared/components/dashboard/HeroStrip";
import InfoRow from "../../../shared/components/dashboard/InfoRow";
import QuickStats, {
  type StatItem,
} from "../../../shared/components/dashboard/QuickStats";
import { useAuthStore } from "../../../store/authStore";

const PatientDashboard: React.FC = () => {
  const { data: profileRes, isLoading: profileLoading } = usePatientProfile();
  const { data: addressRes, isLoading: addressLoading } = usePatientAddress();
  const { updateUser } = useAuthStore();

  const profile = profileRes?.data;
  const address = addressRes?.data;

  React.useEffect(() => {
    if (!profile) return;
    updateUser({ profilePhotoUrl: profile.profilePhotoUrl });
  }, [profile, updateUser]);

  const stats: StatItem[] = [
    {
      label: "Gender",
      value: profile?.gender ? GENDER_LABELS[profile.gender] : null,
    },
    {
      label: "Blood Group",
      value: profile?.bloodGroup
        ? BLOOD_GROUP_LABELS[profile.bloodGroup]
        : null,
    },
    {
      label: "City",
      value: address?.city ?? null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {profile?.firstName || "Patient"}
        </p>
      </div>

      {/* Hero Strip */}
      <HeroStrip
        name={profile ? `${profile.firstName} ${profile.lastName}` : null}
        subtitle={profile?.phoneNumber}
        profilePhotoUrl={profile?.profilePhotoUrl}
        isLoading={profileLoading}
      />

      {/* Quick Stats */}
      <QuickStats stats={stats} />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Summary */}
        <DashboardCard
          title="Profile"
          icon={<User size={18} />}
          to={ROUTES.patientProfile}
          isLoading={profileLoading}
        >
          {profile ? (
            <div>
              <InfoRow label="First Name" value={profile.firstName} />
              <InfoRow label="Last Name" value={profile.lastName} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
              <InfoRow
                label="Blood Group"
                value={
                  profile.bloodGroup
                    ? BLOOD_GROUP_LABELS[profile.bloodGroup]
                    : null
                }
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-3">
              No profile data
            </p>
          )}
        </DashboardCard>

        {/* Address Summary */}
        <DashboardCard
          title="Address"
          icon={<MapPin size={18} />}
          to={ROUTES.patientAddress}
          isLoading={addressLoading}
        >
          {address ? (
            <div>
              <InfoRow label="Address" value={address.addressLine} />
              <InfoRow label="City" value={address.city} />
              <InfoRow label="State" value={address.state} />
              <InfoRow label="PIN Code" value={address.pinCode} />
              <InfoRow label="Country" value={address.country} />
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-3">
              <MapPin size={32} className="text-gray-500/70" />
              <p className="text-sm text-gray-400">No address saved yet</p>
              <Link
                to={ROUTES.patientAddress}
                className="text-xs text-blue-400/80 font-medium hover:text-blue-300 transition-colors duration-200"
              >
                Add address →
              </Link>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Appointments Placeholder */}
      <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-8 flex flex-col items-center gap-3 shadow-md hover:border-white/20 transition-all duration-300">
        <CalendarDays size={36} className="text-gray-500/70" />
        <p className="text-sm text-gray-400">Appointments coming soon</p>
      </div>
    </div>
  );
};

export default PatientDashboard;
