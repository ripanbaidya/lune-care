import React from 'react';
import {Link} from 'react-router-dom';
import {
    User,
    Building2,
    CalendarDays,
    ArrowRight,
    UserCircle,
    Clock,
    Stethoscope,
    Award,
    Languages,
} from 'lucide-react';
import {useDoctorProfile} from '../hooks/useDoctorProfile';
import {useDoctorClinics} from '../hooks/useDoctorClinics';
import {ROUTES} from '../../../routes/routePaths';
import {SPECIALIZATION_LABELS} from '../types/doctor.types';
import {CLINIC_TYPE_LABELS} from '../types/doctor.clinic.types';
import Spinner from '../../../shared/components/ui/Spinner';

const InfoRow: React.FC<{ label: string; value: string | null | undefined }> = ({label, value}) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm text-gray-800 font-medium">{value || '—'}</span>
    </div>
);

const DashboardCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    to: string;
    children: React.ReactNode;
    isLoading?: boolean;
}> = ({title, icon, to, children, isLoading}) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <div className="text-teal-600">{icon}</div>
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
            </div>
            <Link to={to} className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:underline">
                Manage <ArrowRight size={13}/>
            </Link>
        </div>
        <div className="px-5 py-4">
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Spinner size="sm"/>
                </div>
            ) : (
                children
            )}
        </div>
    </div>
);

const DoctorDashboard: React.FC = () => {
    const {data: profileRes, isLoading: profileLoading} = useDoctorProfile();
    const {data: clinicsRes, isLoading: clinicsLoading} = useDoctorClinics();

    const profile = profileRes?.data;
    const clinics = clinicsRes?.data ?? [];
    const activeClinics = clinics.filter((c) => c.active);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Welcome back, Dr. {profile?.firstName || 'Doctor'}
                </p>
            </div>

            {/* Hero strip */}
            <div className="bg-teal-600 rounded-xl px-6 py-5 flex items-center gap-4">
                {profile?.profilePhotoUrl ? (
                    <img
                        src={profile.profilePhotoUrl}
                        alt="Profile"
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/40"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <UserCircle size={32} className="text-white"/>
                    </div>
                )}
                <div>
                    {profileLoading ? (
                        <Spinner size="sm" className="border-white border-t-transparent"/>
                    ) : (
                        <>
                            <p className="text-white font-semibold text-base">
                                Dr. {profile ? `${profile.firstName} ${profile.lastName}` : '—'}
                            </p>
                            <p className="text-teal-100 text-xs mt-0.5">
                                {profile?.specialization
                                    ? SPECIALIZATION_LABELS[profile.specialization]
                                    : profile?.phoneNumber}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    {
                        label: 'Experience',
                        value: profile?.yearsOfExperience != null
                            ? `${profile.yearsOfExperience} yrs`
                            : null,
                        icon: <Clock size={14} className="text-teal-500"/>,
                    },
                    {
                        label: 'Specialization',
                        value: profile?.specialization
                            ? SPECIALIZATION_LABELS[profile.specialization]
                            : null,
                        icon: <Stethoscope size={14} className="text-teal-500"/>,
                    },
                    {
                        label: 'Qualification',
                        value: profile?.qualification ?? null,
                        icon: <Award size={14} className="text-teal-500"/>,
                    },
                    {
                        label: 'Active Clinics',
                        value: String(activeClinics.length),
                        icon: <Building2 size={14} className="text-teal-500"/>,
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                        <div className="flex items-center gap-1 mb-1">
                            {stat.icon}
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 truncate">{stat.value || '—'}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Summary */}
                <DashboardCard
                    title="Profile"
                    icon={<User size={16}/>}
                    to={ROUTES.doctorProfile}
                    isLoading={profileLoading}
                >
                    {profile ? (
                        <div>
                            <InfoRow label="First Name" value={profile.firstName}/>
                            <InfoRow label="Last Name" value={profile.lastName}/>
                            <InfoRow label="Email" value={profile.email}/>
                            <InfoRow label="Date of Birth" value={profile.dateOfBirth}/>
                            <InfoRow
                                label="Languages"
                                value={profile.languagesSpoken?.join(', ') || null}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-2">No profile data</p>
                    )}
                </DashboardCard>

                {/* Clinics Summary */}
                <DashboardCard
                    title="Clinics"
                    icon={<Building2 size={16}/>}
                    to={ROUTES.doctorClinics}
                    isLoading={clinicsLoading}
                >
                    {clinics.length > 0 ? (
                        <div className="space-y-3">
                            {clinics.slice(0, 2).map((clinic) => (
                                <div key={clinic.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div
                                        className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Building2 size={14} className="text-teal-600"/>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{clinic.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {CLINIC_TYPE_LABELS[clinic.type] || clinic.type} · {clinic.city}
                                        </p>
                                        <p className="text-xs text-teal-600 font-medium mt-0.5">
                                            ₹{clinic.consultationFees}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${clinic.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {clinic.active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                            {clinics.length > 2 && (
                                <p className="text-xs text-gray-400 text-center">
                                    +{clinics.length - 2} more clinics
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4 gap-2">
                            <Building2 size={28} className="text-gray-300"/>
                            <p className="text-sm text-gray-400">No clinics added yet</p>
                            <Link to={ROUTES.doctorClinics}
                                  className="text-xs text-teal-600 font-medium hover:underline">
                                Add clinic →
                            </Link>
                        </div>
                    )}
                </DashboardCard>
            </div>

            {/* Bio */}
            {profile?.bio && (
                <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Languages size={15} className="text-teal-600"/>
                        <p className="text-sm font-semibold text-gray-700">About</p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
            )}

            {/* Appointments Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-6 flex flex-col items-center gap-2">
                <CalendarDays size={32} className="text-gray-300"/>
                <p className="text-sm text-gray-500">Appointments coming soon</p>
            </div>
        </div>
    );
};

export default DoctorDashboard;