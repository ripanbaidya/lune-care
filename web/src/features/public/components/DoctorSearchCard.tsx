import React from 'react';
import {useNavigate} from 'react-router-dom';
import {IndianRupee, MapPin, UserCircle} from 'lucide-react';
import type {DoctorSearchResult} from '../hooks/useDoctorSearch';
import {SPECIALIZATION_LABELS} from '../../doctor/types/doctor.types';

interface Props {
    doctor: DoctorSearchResult;
}

const DoctorSearchCard: React.FC<Props> = ({doctor}) => {
    const navigate = useNavigate();

    const primaryClinic = doctor.clinics?.[0];
    const specLabel = doctor.specialization
        ? (SPECIALIZATION_LABELS[doctor.specialization as keyof typeof SPECIALIZATION_LABELS] ?? doctor.specialization)
        : null;

    return (
        <button
            onClick={() => navigate(`/doctors/${doctor.id}`)}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
            <div className="flex items-start gap-3">
                {doctor.profilePhotoUrl ? (
                    <img
                        src={doctor.profilePhotoUrl}
                        alt={doctor.firstName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={24} className="text-blue-400"/>
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                    </p>
                    {specLabel && (
                        <p className="text-xs text-blue-600 font-medium">{specLabel}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                        {doctor.qualification}
                        {doctor.yearsOfExperience != null ? ` · ${doctor.yearsOfExperience} yrs exp` : ''}
                    </p>
                </div>
            </div>

            {primaryClinic && (
                <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={11} className="flex-shrink-0"/>
                        <span className="truncate">{primaryClinic.city}, {primaryClinic.state}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            {primaryClinic.type}
                        </span>
                        <span className="text-sm font-bold text-blue-700 flex items-center gap-0.5">
                            <IndianRupee size={11}/>{primaryClinic.consultationFees}
                        </span>
                    </div>
                </div>
            )}
        </button>
    );
};

export default DoctorSearchCard;