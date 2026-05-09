import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Building2,
  CalendarDays,
  Clock,
  Stethoscope,
  Award,
  Languages,
} from "lucide-react";

import { useDoctorProfile } from "../hooks/useDoctorProfile";
import { useDoctorClinics } from "../hooks/useDoctorClinics";

import { ROUTES } from "../../../routes/routePaths";
import { SPECIALIZATION_LABELS } from "../types/doctor.types";
import { CLINIC_TYPE_LABELS } from "../types/doctor.clinic.types";

import DashboardCard from "../../../shared/components/dashboard/DashboardCard";
import HeroStrip from "../../../shared/components/dashboard/HeroStrip";
import InfoRow from "../../../shared/components/dashboard/InfoRow";
import QuickStats, { type StatItem } from "../../../shared/components/dashboard/QuickStats";

const DoctorDashboard: React.FC = () => {
  const { data: profileRes, isLoading: profileLoading } = useDoctorProfile();
  const { data: clinicsRes, isLoading: clinicsLoading } = useDoctorClinics();

  const profile = profileRes?.data;
  const clinics = clinicsRes?.data ?? [];
  const activeClinics = clinics.filter((c) => c.active);

  const stats: StatItem[] = [
    {
      label: "Experience",
      value:
        profile?.yearsOfExperience != null
          ? `${profile.yearsOfExperience} yrs`
          : null,
      icon: <Clock size={14} />,
    },
    {
      label: "Specialization",
      value: profile?.specialization
        ? SPECIALIZATION_LABELS[profile.specialization]
        : null,
      icon: <Stethoscope size={14} />,
    },
    {
      label: "Qualification",
      value: profile?.qualification ?? null,
      icon: <Award size={14} />,
    },
    {
      label: "Active Clinics",
      value: String(activeClinics.length),
      icon: <Building2 size={14} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Welcome back, Dr. {profile?.firstName || "Doctor"}
        </p>
      </div>

      {/* Hero Strip */}
      <HeroStrip
        name={profile ? `Dr. ${profile.firstName} ${profile.lastName}` : null}
        subtitle={
          profile?.specialization
            ? SPECIALIZATION_LABELS[profile.specialization]
            : profile?.phoneNumber
        }
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
          icon={<User size={16} />}
          to={ROUTES.doctorProfile}
          isLoading={profileLoading}
        >
          {profile ? (
            <div>
              <InfoRow label="First Name" value={profile.firstName} />
              <InfoRow label="Last Name" value={profile.lastName} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
              <InfoRow
                label="Languages"
                value={profile.languagesSpoken?.join(", ") || null}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              No profile data
            </p>
          )}
        </DashboardCard>

        {/* Clinics Summary */}
        <DashboardCard
          title="Clinics"
          icon={<Building2 size={16} />}
          to={ROUTES.doctorClinics}
          isLoading={clinicsLoading}
        >
          {clinics.length > 0 ? (
            <div className="space-y-3">
              {clinics.slice(0, 2).map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={14} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate">
                      {clinic.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {CLINIC_TYPE_LABELS[clinic.type] || clinic.type} ·{" "}
                      {clinic.city}
                    </p>
                    <p className="text-xs text-blue-400 font-medium mt-0.5">
                      ₹{clinic.consultationFees}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      clinic.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-700/50 text-gray-500"
                    }`}
                  >
                    {clinic.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {clinics.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{clinics.length - 2} more clinics
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-3">
              <Building2 size={28} className="text-gray-600" />
              <p className="text-sm text-gray-400">No clinics added yet</p>
              <Link
                to={ROUTES.doctorClinics}
                className="text-xs text-blue-400/80 font-medium hover:text-blue-300 transition-colors duration-200"
              >
                Add clinic →
              </Link>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 px-5 py-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Languages size={15} className="text-blue-400/80" />
            <p className="text-sm font-semibold text-gray-200">About</p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Appointments Shortcut */}
      <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 px-5 py-8 flex flex-col items-center gap-3 shadow-md hover:border-white/20 transition-all duration-300">
        <CalendarDays size={32} className="text-gray-500/70" />
        <p className="text-sm text-gray-400">
          View and manage your appointments
        </p>
        <Link
          to={ROUTES.doctorAppointments}
          className="text-xs text-blue-400/80 font-medium hover:text-blue-300 transition-colors duration-200"
        >
          Go to Appointments →
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboard;
