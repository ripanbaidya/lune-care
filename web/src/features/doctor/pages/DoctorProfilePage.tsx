import React, {useRef, useState, useEffect} from 'react';
import {Camera, Trash2, Pencil, X, Check, UserCircle} from 'lucide-react';
import {
    useDoctorProfile,
    useUpdateDoctorProfile,
    useUploadDoctorPhoto,
    useRemoveDoctorPhoto,
} from '../hooks/useDoctorProfile';
import {FormError} from '../../../shared/components/ui/FormError';
import {FieldErrorMessage} from '../../../shared/components/ui/FieldErrorMessage';
import Spinner from '../../../shared/components/ui/Spinner';
import {
    GENDER_LABELS,
    SPECIALIZATION_LABELS,
    type DoctorGender,
    type Specialization,
    type UpdateDoctorProfileRequest,
} from '../types/doctor.types';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';

const DisplayField: React.FC<{ label: string; value: string | null | undefined }> = ({label, value}) => (
    <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
    </div>
);

const DoctorProfilePage: React.FC = () => {
    const {data: profileRes, isLoading} = useDoctorProfile();
    const {mutate: updateProfile, isPending: isUpdating} = useUpdateDoctorProfile();
    const {mutate: uploadPhoto, isPending: isUploading} = useUploadDoctorPhoto();
    const {mutate: removePhoto, isPending: isRemoving} = useRemoveDoctorPhoto();

    const profile = profileRes?.data;
    const [isEditing, setIsEditing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState<UpdateDoctorProfileRequest & { languagesText?: string }>({});
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setForm({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email ?? '',
                gender: profile.gender ?? undefined,
                dateOfBirth: profile.dateOfBirth ?? '',
                specialization: profile.specialization ?? undefined,
                qualification: profile.qualification ?? '',
                yearsOfExperience: profile.yearsOfExperience ?? undefined,
                bio: profile.bio ?? '',
                languagesText: profile.languagesSpoken?.join(', ') ?? '',
            });
        }
    }, [profile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value || undefined}));
        if (fieldErrors[name]) setFieldErrors((prev) => ({...prev, [name]: ''}));
    };

    const handleSave = () => {
        setFormError(null);
        setFieldErrors({});

        const {languagesText, ...rest} = form;
        const payload: UpdateDoctorProfileRequest = Object.fromEntries(
            Object.entries(rest).filter(([, v]) => v !== '' && v !== undefined),
        ) as UpdateDoctorProfileRequest;

        if (languagesText?.trim()) {
            payload.languagesSpoken = languagesText.split(',').map((l) => l.trim()).filter(Boolean);
        }

        if (form.yearsOfExperience !== undefined) {
            payload.yearsOfExperience = Number(form.yearsOfExperience);
        }

        updateProfile(payload, {
            onSuccess: () => {
                toast.success('Profile updated successfully');
                setIsEditing(false);
            },
            onError: (err: AppError) => {
                if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
                else setFormError(err.message);
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadPhoto(file, {
            onSuccess: () => toast.success('Photo updated'),
            onError: (err: AppError) => toast.error(err.message),
        });
        e.target.value = '';
    };

    const handleRemovePhoto = () => {
        removePhoto(undefined, {
            onSuccess: () => toast.success('Photo removed'),
            onError: (err: AppError) => toast.error(err.message),
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Spinner size="lg"/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Profile</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your professional information</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        <Pencil size={14}/>
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setFormError(null);
                                setFieldErrors({});
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                        >
                            <X size={14}/>
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
                        >
                            {isUpdating ? <Spinner size="sm"/> : <Check size={14}/>}
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Photo Card */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Profile Photo</p>
                <div className="flex items-center gap-5">
                    <div className="relative">
                        {profile?.profilePhotoUrl ? (
                            <img
                                src={profile.profilePhotoUrl}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                <UserCircle size={40} className="text-gray-400"/>
                            </div>
                        )}
                        {(isUploading || isRemoving) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                                <Spinner size="sm"/>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <Camera size={14}/>
                            {profile?.profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {profile?.profilePhotoUrl && (
                            <button
                                onClick={handleRemovePhoto}
                                disabled={isRemoving}
                                className="flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                                <Trash2 size={14}/>
                                Remove Photo
                            </button>
                        )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                </div>
                <p className="text-xs text-gray-400 mt-3">Accepted: JPG, PNG, WEBP. Max 5MB.</p>
            </div>

            {/* Personal Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Personal Information</p>
                <FormError error={formError} className="mb-4"/>

                {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                            <input
                                name="firstName"
                                value={form.firstName ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.firstName}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                            <input
                                name="lastName"
                                value={form.lastName ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.lastName}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.email}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                            <input
                                name="dateOfBirth"
                                type="date"
                                value={form.dateOfBirth ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.dateOfBirth}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={form.gender ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select gender</option>
                                {(Object.keys(GENDER_LABELS) as DoctorGender[]).map((g) => (
                                    <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                                ))}
                            </select>
                            <FieldErrorMessage message={fieldErrors.gender}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                            <select
                                name="specialization"
                                value={form.specialization ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select specialization</option>
                                {(Object.keys(SPECIALIZATION_LABELS) as Specialization[]).map((s) => (
                                    <option key={s} value={s}>{SPECIALIZATION_LABELS[s]}</option>
                                ))}
                            </select>
                            <FieldErrorMessage message={fieldErrors.specialization}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Qualification</label>
                            <input
                                name="qualification"
                                value={form.qualification ?? ''}
                                onChange={handleChange}
                                placeholder="e.g. MBBS, MD"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.qualification}/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Years of Experience</label>
                            <input
                                name="yearsOfExperience"
                                type="number"
                                min={0}
                                max={60}
                                value={form.yearsOfExperience ?? ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.yearsOfExperience}/>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Languages Spoken <span className="text-gray-400">(comma-separated)</span>
                            </label>
                            <input
                                name="languagesText"
                                value={(form as any).languagesText ?? ''}
                                onChange={handleChange}
                                placeholder="e.g. English, Hindi"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Bio <span className="text-gray-400">(max 250 chars)</span>
                            </label>
                            <textarea
                                name="bio"
                                value={form.bio ?? ''}
                                onChange={handleChange}
                                rows={3}
                                maxLength={250}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                            />
                            <FieldErrorMessage message={fieldErrors.bio}/>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <DisplayField label="First Name" value={profile?.firstName}/>
                        <DisplayField label="Last Name" value={profile?.lastName}/>
                        <DisplayField label="Phone Number" value={profile?.phoneNumber}/>
                        <DisplayField label="Email" value={profile?.email}/>
                        <DisplayField label="Date of Birth" value={profile?.dateOfBirth}/>
                        <DisplayField label="Gender" value={profile?.gender ? GENDER_LABELS[profile.gender] : null}/>
                        <DisplayField
                            label="Specialization"
                            value={profile?.specialization ? SPECIALIZATION_LABELS[profile.specialization] : null}
                        />
                        <DisplayField label="Qualification" value={profile?.qualification}/>
                        <DisplayField
                            label="Years of Experience"
                            value={profile?.yearsOfExperience != null ? `${profile.yearsOfExperience} years` : null}
                        />
                        <DisplayField
                            label="Languages Spoken"
                            value={profile?.languagesSpoken?.join(', ') || null}
                        />
                        {profile?.bio && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-gray-500 mb-0.5">Bio</p>
                                <p className="text-sm text-gray-800 leading-relaxed">{profile.bio}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorProfilePage;