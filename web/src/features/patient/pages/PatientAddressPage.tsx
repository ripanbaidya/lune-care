import React, {useState, useEffect} from 'react';
import {MapPin, Pencil, X, Check, Trash2, Plus} from 'lucide-react';
import {
    usePatientAddress,
    useCreateAddress,
    useUpdateAddress,
    useDeleteAddress,
} from '../hooks/usePatientAddress';
import {FormError} from '../../../shared/components/ui/FormError';
import {FieldErrorMessage} from '../../../shared/components/ui/FieldErrorMessage';
import Spinner from '../../../shared/components/ui/Spinner';
import type {AddressRequest} from '../patient-address.types';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';

const EMPTY_ADDRESS: AddressRequest = {
    addressLine: '',
    city: '',
    state: '',
    pinCode: '',
    country: '',
};

const PatientAddressPage: React.FC = () => {
    const {data: addressRes, isLoading} = usePatientAddress();
    const {mutate: createAddress, isPending: isCreating} = useCreateAddress();
    const {mutate: updateAddress, isPending: isUpdating} = useUpdateAddress();
    const {mutate: deleteAddress, isPending: isDeleting} = useDeleteAddress();

    const address = addressRes?.data ?? null;
    const hasAddress = !!address;

    const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view');
    const [form, setForm] = useState<AddressRequest>(EMPTY_ADDRESS);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Sync form when address data loads
    useEffect(() => {
        if (address) {
            setForm({
                addressLine: address.addressLine,
                city: address.city,
                state: address.state,
                pinCode: address.pinCode,
                country: address.country,
            });
        }
    }, [address]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
        if (fieldErrors[name]) setFieldErrors((prev) => ({...prev, [name]: ''}));
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!form.addressLine.trim()) errors.addressLine = 'Address line is required';
        if (!form.city.trim()) errors.city = 'City is required';
        if (!form.state.trim()) errors.state = 'State is required';
        if (!form.pinCode.trim()) errors.pinCode = 'PIN code is required';
        if (!form.country.trim()) errors.country = 'Country is required';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        setFormError(null);
        if (!validate()) return;

        const onSuccess = () => {
            toast.success(hasAddress ? 'Address updated' : 'Address saved');
            setMode('view');
        };
        const onError = (err: AppError) => {
            if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
            else setFormError(err.message);
        };

        if (mode === 'create') {
            createAddress(form, {onSuccess, onError});
        } else {
            updateAddress(form, {onSuccess, onError});
        }
    };

    const handleDelete = () => {
        if (!window.confirm('Remove your saved address?')) return;
        deleteAddress(undefined, {
            onSuccess: () => {
                toast.success('Address removed');
                setForm(EMPTY_ADDRESS);
                setMode('view');
            },
            onError: (err: AppError) => toast.error(err.message),
        });
    };

    const handleCancel = () => {
        setFormError(null);
        setFieldErrors({});
        if (address) {
            setForm({
                addressLine: address.addressLine,
                city: address.city,
                state: address.state,
                pinCode: address.pinCode,
                country: address.country,
            });
        } else {
            setForm(EMPTY_ADDRESS);
        }
        setMode('view');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48">
                <Spinner size="lg"/>
            </div>
        );
    }

    const isPending = isCreating || isUpdating;
    const isFormMode = mode === 'edit' || mode === 'create';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Address</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Your saved delivery / contact address</p>
                </div>
                {!isFormMode ? (
                    hasAddress ? (
                        <button
                            onClick={() => setMode('edit')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Pencil size={14}/>
                            Edit
                        </button>
                    ) : (
                        <button
                            onClick={() => setMode('create')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={14}/>
                            Add Address
                        </button>
                    )
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                        >
                            <X size={14}/>
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                        >
                            {isPending ? <Spinner size="sm"/> : <Check size={14}/>}
                            Save
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                {/* Empty state */}
                {!hasAddress && !isFormMode && (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <MapPin size={24} className="text-gray-400"/>
                        </div>
                        <p className="text-sm text-gray-500">No address saved yet</p>
                        <button
                            onClick={() => setMode('create')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={14}/>
                            Add Address
                        </button>
                    </div>
                )}

                {/* Form mode */}
                {isFormMode && (
                    <div className="space-y-4">
                        <FormError error={formError}/>

                        {/* Address Line */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Address Line <span className="text-red-400">*</span>
                            </label>
                            <input
                                name="addressLine"
                                value={form.addressLine}
                                onChange={handleChange}
                                placeholder="Street, Building, Area"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FieldErrorMessage message={fieldErrors.addressLine}/>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* City */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    City <span className="text-red-400">*</span>
                                </label>
                                <input
                                    name="city"
                                    value={form.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FieldErrorMessage message={fieldErrors.city}/>
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    State <span className="text-red-400">*</span>
                                </label>
                                <input
                                    name="state"
                                    value={form.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FieldErrorMessage message={fieldErrors.state}/>
                            </div>

                            {/* PIN Code */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    PIN Code <span className="text-red-400">*</span>
                                </label>
                                <input
                                    name="pinCode"
                                    value={form.pinCode}
                                    onChange={handleChange}
                                    placeholder="6-digit PIN"
                                    maxLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FieldErrorMessage message={fieldErrors.pinCode}/>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Country <span className="text-red-400">*</span>
                                </label>
                                <input
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FieldErrorMessage message={fieldErrors.country}/>
                            </div>
                        </div>
                    </div>
                )}

                {/* View mode - address exists */}
                {hasAddress && !isFormMode && address && (
                    <div className="space-y-4">
                        {/* Address display */}
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <MapPin size={18} className="text-blue-600 mt-0.5 flex-shrink-0"/>
                            <div>
                                <p className="text-sm font-medium text-gray-800">{address.addressLine}</p>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    {address.city}, {address.state} — {address.pinCode}
                                </p>
                                <p className="text-sm text-gray-600">{address.country}</p>
                            </div>
                        </div>

                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                            {isDeleting ? <Spinner size="sm"/> : <Trash2 size={14}/>}
                            Remove Address
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientAddressPage;