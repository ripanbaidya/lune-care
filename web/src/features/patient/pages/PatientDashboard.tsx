import React from "react";
import { Link } from "react-router-dom";
import { User, MapPin, CalendarDays } from "lucide-react";

import { usePatientProfile } from "../hooks/usePatientProfile";
import { usePatientAddress } from "../hooks/usePatientAddress";

import { ROUTES } from "../../../routes/routePaths";
import { BLOOD_GROUP_LABELS } from "../types/patient.types.ts";

import InfoRow from "../components/profile/InfoRow.tsx";
import DashboardCard from "../components/profile/DashboardCard.tsx";
import HeroStrip from "../components/profile/HeroStrip.tsx";
import QuickStats from "../components/profile/QuickStats.tsx";

const PatientDashboard: React.FC = () => {
  const { data: profileRes, isLoading: profileLoading } = usePatientProfile();
  const { data: addressRes, isLoading: addressLoading } = usePatientAddress();

  const profile = profileRes?.data;
  const address = addressRes?.data;

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
      <HeroStrip profile={profile} isLoading={profileLoading} />

      {/* Quick Stats */}
      <QuickStats profile={profile} address={address} />

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
