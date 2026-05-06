import React from 'react';
import {Link} from 'react-router-dom';
import {User, MapPin, CalendarDays, ArrowRight, UserCircle} from 'lucide-react';
import {usePatientProfile} from '../hooks/usePatientProfile';
import {usePatientAddress} from '../hooks/usePatientAddress';
import {ROUTES} from '../../../routes/routePaths';
import {BLOOD_GROUP_LABELS, GENDER_LABELS} from '../patient.types';
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
                <div className="text-blue-600">{icon}</div>
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
            </div>
            <Link
                to={to}
                className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
            >
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

const PatientDashboard: React.FC = () => {
    const {data: profileRes, isLoading: profileLoading} = usePatientProfile();
    const {data: addressRes, isLoading: addressLoading} = usePatientAddress();

    const profile = profileRes?.data;
    const address = addressRes?.data;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Welcome back, {profile?.firstName || 'Patient'}</p>
            </div>

            {/* Hero strip */}
            <div className="bg-blue-600 rounded-xl px-6 py-5 flex items-center gap-4">
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
                                {profile ? `${profile.firstName} ${profile.lastName}` : '—'}
                            </p>
                            <p className="text-blue-100 text-xs mt-0.5">{profile?.phoneNumber}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                    {label: 'Gender', value: profile?.gender ? GENDER_LABELS[profile.gender] : null},
                    {label: 'Blood Group', value: profile?.bloodGroup ? BLOOD_GROUP_LABELS[profile.bloodGroup] : null},
                    {label: 'City', value: address?.city ?? null},
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                        <p className="text-xs text-gray-500">{stat.label}</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{stat.value || '—'}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Summary */}
                <DashboardCard
                    title="Profile"
                    icon={<User size={16}/>}
                    to={ROUTES.patientProfile}
                    isLoading={profileLoading}
                >
                    {profile ? (
                        <div>
                            <InfoRow label="First Name" value={profile.firstName}/>
                            <InfoRow label="Last Name" value={profile.lastName}/>
                            <InfoRow label="Email" value={profile.email}/>
                            <InfoRow label="Date of Birth" value={profile.dateOfBirth}/>
                            <InfoRow
                                label="Blood Group"
                                value={profile.bloodGroup ? BLOOD_GROUP_LABELS[profile.bloodGroup] : null}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-2">No profile data</p>
                    )}
                </DashboardCard>

                {/* Address Summary */}
                <DashboardCard
                    title="Address"
                    icon={<MapPin size={16}/>}
                    to={ROUTES.patientAddress}
                    isLoading={addressLoading}
                >
                    {address ? (
                        <div>
                            <InfoRow label="Address" value={address.addressLine}/>
                            <InfoRow label="City" value={address.city}/>
                            <InfoRow label="State" value={address.state}/>
                            <InfoRow label="PIN Code" value={address.pinCode}/>
                            <InfoRow label="Country" value={address.country}/>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4 gap-2">
                            <MapPin size={28} className="text-gray-300"/>
                            <p className="text-sm text-gray-400">No address saved yet</p>
                            <Link
                                to={ROUTES.patientAddress}
                                className="text-xs text-blue-600 font-medium hover:underline"
                            >
                                Add address →
                            </Link>
                        </div>
                    )}
                </DashboardCard>
            </div>

            {/* Appointments placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-6 flex flex-col items-center gap-2">
                <CalendarDays size={32} className="text-gray-300"/>
                <p className="text-sm text-gray-500">Appointments coming soon</p>
            </div>
        </div>
    );
};

export default PatientDashboard;