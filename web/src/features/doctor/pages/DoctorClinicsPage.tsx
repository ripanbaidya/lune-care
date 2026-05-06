import React, {useState} from 'react';
import {Building2, Plus, Pencil, Trash2, X, Check, MapPin, Phone, Clock, IndianRupee} from 'lucide-react';
import {useDoctorClinics, useAddClinic, useUpdateClinic, useDeleteClinic} from '../hooks/useDoctorClinics';
import {FormError} from '../../../shared/components/ui/FormError';
import {FieldErrorMessage} from '../../../shared/components/ui/FieldErrorMessage';
import Spinner from '../../../shared/components/ui/Spinner';
import {
    CLINIC_TYPE_LABELS,
    type ClinicResponse,
    type CreateClinicRequest,
    type UpdateClinicRequest
} from '../types/doctor.clinic.types';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';
import ClinicSchedulePanel from '../components/ClinicSchedulePanel';

const CLINIC_TYPES = ['IN_PERSON', 'ONLINE', 'PRIVATE_CLINIC', 'HOSPITAL', 'CLINIC'] as const;

const EMPTY_FORM: CreateClinicRequest = {
    name: '',
    type: 'IN_PERSON',
    consultationFees: 0,
    consultationDurationMinutes: 30,
    contactNumber: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
};

interface ClinicFormProps {
    initial?: CreateClinicRequest;
    onSave: (data: CreateClinicRequest) => void;
    onCancel: () => void;
    isPending: boolean;
    formError: string | null;
    fieldErrors: Record<string, string>;
    title: string;
}

const ClinicForm: React.FC<ClinicFormProps> = ({
                                                   initial = EMPTY_FORM,
                                                   onSave,
                                                   onCancel,
                                                   isPending,
                                                   formError,
                                                   fieldErrors,
                                                   title,
                                               }) => {
    const [form, setForm] = useState<CreateClinicRequest>(initial);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'consultationFees' || name === 'consultationDurationMinutes'
                ? Number(value)
                : value,
        }));
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">{title}</p>
            <FormError error={formError} className="mb-4"/>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Clinic Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. GreenLife Health Center"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.name}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Clinic Type <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        >
                            {CLINIC_TYPES.map((t) => (
                                <option key={t} value={t}>{CLINIC_TYPE_LABELS[t] || t}</option>
                            ))}
                        </select>
                        <FieldErrorMessage message={fieldErrors.type}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Contact Number
                        </label>
                        <input
                            name="contactNumber"
                            value={form.contactNumber ?? ''}
                            onChange={handleChange}
                            placeholder="10-digit number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.contactNumber}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Consultation Fees (₹) <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="consultationFees"
                            type="number"
                            min={1}
                            value={form.consultationFees}
                            onChange={handleChange}
                            placeholder="500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.consultationFees}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Duration (minutes) <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="consultationDurationMinutes"
                            type="number"
                            min={10}
                            max={120}
                            value={form.consultationDurationMinutes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.consultationDurationMinutes}/>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Address Line <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="addressLine"
                            value={form.addressLine}
                            onChange={handleChange}
                            placeholder="Street, Building, Area"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.addressLine}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            City <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.city}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            State <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="State"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.state}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            PIN Code <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            placeholder="6-digit PIN"
                            maxLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <FieldErrorMessage message={fieldErrors.pincode}/>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                        <input
                            name="country"
                            value={form.country ?? ''}
                            onChange={handleChange}
                            placeholder="Country"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mt-5">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                >
                    <X size={14}/> Cancel
                </button>
                <button
                    onClick={() => onSave(form)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
                >
                    {isPending ? <Spinner size="sm"/> : <Check size={14}/>}
                    Save Clinic
                </button>
            </div>
            <div className="px-5 pb-4">
                <ClinicSchedulePanel
                    clinicId={clinic.id}
                    hasExistingSchedule={clinic.schedules.length > 0}
                />
            </div>
        </div>
    );
};

const ClinicCard: React.FC<{
    clinic: ClinicResponse;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}> = ({clinic, onEdit, onDelete, isDeleting}) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-teal-600"/>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">{clinic.name}</h3>
                    <p className="text-xs text-gray-500">{CLINIC_TYPE_LABELS[clinic.type] || clinic.type}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${clinic.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                >
                    {clinic.active ? 'Active' : 'Inactive'}
                </span>
                <button
                    onClick={onEdit}
                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                    <Pencil size={14}/>
                </button>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isDeleting ? <Spinner size="sm"/> : <Trash2 size={14}/>}
                </button>
            </div>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
                <IndianRupee size={13} className="text-teal-500 flex-shrink-0"/>
                <div>
                    <p className="text-xs text-gray-500">Fees</p>
                    <p className="text-sm font-medium text-gray-800">₹{clinic.consultationFees}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Clock size={13} className="text-teal-500 flex-shrink-0"/>
                <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-800">{clinic.consultationDurationMinutes} min</p>
                </div>
            </div>
            {clinic.contactNumber && (
                <div className="flex items-center gap-2">
                    <Phone size={13} className="text-teal-500 flex-shrink-0"/>
                    <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm font-medium text-gray-800">{clinic.contactNumber}</p>
                    </div>
                </div>
            )}
            <div className="flex items-start gap-2 sm:col-span-3">
                <MapPin size={13} className="text-teal-500 flex-shrink-0 mt-0.5"/>
                <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-700">
                        {clinic.addressLine}, {clinic.city}, {clinic.state} — {clinic.pincode}
                    </p>
                    {clinic.country && <p className="text-xs text-gray-500">{clinic.country}</p>}
                </div>
            </div>
            {clinic.schedules.length > 0 && (
                <div className="sm:col-span-3">
                    <p className="text-xs text-gray-500 mb-1.5">Schedule</p>
                    <div className="flex flex-wrap gap-1.5">
                        {clinic.schedules.map((s) => (
                            <span
                                key={s.id}
                                className={`text-xs px-2 py-1 rounded-full font-medium ${s.active ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-400 line-through'}`}
                            >
                                {s.dayOfWeek.slice(0, 3)} {s.startTime.slice(0, 5)}–{s.endTime.slice(0, 5)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
);

const DoctorClinicsPage: React.FC = () => {
    const {data: clinicsRes, isLoading} = useDoctorClinics();
    const {mutate: addClinic, isPending: isAdding} = useAddClinic();
    const {mutate: updateClinic, isPending: isUpdating} = useUpdateClinic();
    const {mutate: deleteClinic, isPending: isDeleting} = useDeleteClinic();

    const clinics = clinicsRes?.data ?? [];

    const [mode, setMode] = useState<'view' | 'create' | { editId: string }>('view');
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleCreate = (data: CreateClinicRequest) => {
        setFormError(null);
        addClinic(data, {
            onSuccess: () => {
                toast.success('Clinic added successfully');
                setMode('view');
            },
            onError: (err: AppError) => {
                if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
                else setFormError(err.message);
            },
        });
    };

    const handleUpdate = (clinicId: string, data: CreateClinicRequest) => {
        setFormError(null);
        const payload: UpdateClinicRequest = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== '' && v !== undefined && v !== 0),
        ) as UpdateClinicRequest;

        updateClinic({clinicId, data: payload}, {
            onSuccess: () => {
                toast.success('Clinic updated successfully');
                setMode('view');
            },
            onError: (err: AppError) => {
                if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
                else setFormError(err.message);
            },
        });
    };

    const handleDelete = (clinicId: string) => {
        if (!window.confirm('Remove this clinic? This action cannot be undone.')) return;
        setDeletingId(clinicId);
        deleteClinic(clinicId, {
            onSuccess: () => {
                toast.success('Clinic removed');
                setDeletingId(null);
            },
            onError: (err: AppError) => {
                toast.error(err.message);
                setDeletingId(null);
            },
        });
    };

    const handleCancel = () => {
        setFormError(null);
        setFieldErrors({});
        setMode('view');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Spinner size="lg"/>
            </div>
        );
    }

    const editingClinic = typeof mode === 'object'
        ? clinics.find((c) => c.id === mode.editId)
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Clinics</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your clinic locations</p>
                </div>
                {mode === 'view' && (
                    <button
                        onClick={() => setMode('create')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        <Plus size={14}/>
                        Add Clinic
                    </button>
                )}
            </div>

            {/* Create Form */}
            {mode === 'create' && (
                <ClinicForm
                    title="Add New Clinic"
                    onSave={handleCreate}
                    onCancel={handleCancel}
                    isPending={isAdding}
                    formError={formError}
                    fieldErrors={fieldErrors}
                />
            )}

            {/* Edit Form */}
            {typeof mode === 'object' && editingClinic && (
                <ClinicForm
                    title={`Edit — ${editingClinic.name}`}
                    initial={{
                        name: editingClinic.name,
                        type: editingClinic.type,
                        consultationFees: editingClinic.consultationFees,
                        consultationDurationMinutes: editingClinic.consultationDurationMinutes,
                        contactNumber: editingClinic.contactNumber ?? '',
                        addressLine: editingClinic.addressLine,
                        city: editingClinic.city,
                        state: editingClinic.state,
                        pincode: editingClinic.pincode,
                        country: editingClinic.country,
                    }}
                    onSave={(data) => handleUpdate(editingClinic.id, data)}
                    onCancel={handleCancel}
                    isPending={isUpdating}
                    formError={formError}
                    fieldErrors={fieldErrors}
                />
            )}

            {/* Clinics List */}
            {clinics.length === 0 && mode === 'view' ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-14 gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <Building2 size={24} className="text-gray-400"/>
                    </div>
                    <p className="text-sm text-gray-500">No clinics added yet</p>
                    <button
                        onClick={() => setMode('create')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        <Plus size={14}/>
                        Add Your First Clinic
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {clinics.map((clinic) => (
                        mode === 'view' || (typeof mode === 'object' && mode.editId !== clinic.id) ? (
                            <ClinicCard
                                key={clinic.id}
                                clinic={clinic}
                                onEdit={() => {
                                    setFormError(null);
                                    setFieldErrors({});
                                    setMode({editId: clinic.id});
                                }}
                                onDelete={() => handleDelete(clinic.id)}
                                isDeleting={isDeleting && deletingId === clinic.id}
                            />
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorClinicsPage;