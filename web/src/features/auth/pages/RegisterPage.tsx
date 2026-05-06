import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useRegister} from '../hooks/useRegister';
import {ROUTES} from '../../../routes/routePaths';
import {FormError} from "../../../shared/components/ui/FormError.tsx";
import {FieldErrorMessage} from "../../../shared/components/ui/FieldErrorMessage.tsx";
import Spinner from "../../../shared/components/ui/Spinner.tsx";

export default function RegisterPage() {
    const {
        activeTab,
        switchTab,
        form,
        handleChange,
        fieldErrors,
        formError,
        isPending,
        handleSubmit,
    } = useRegister();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to={ROUTES.home}>
                        <h1 className="text-3xl font-bold text-blue-600">LuneCare</h1>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">Create your account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {/* Tab switcher */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-6">
                        <button
                            type="button"
                            onClick={() => switchTab('patient')}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === 'patient'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Patient
                        </button>
                        <button
                            type="button"
                            onClick={() => switchTab('doctor')}
                            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === 'doctor'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Doctor
                        </button>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Register as {activeTab === 'patient' ? 'Patient' : 'Doctor'}
                    </h2>

                    <FormError error={formError}/>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                <FieldErrorMessage message={fieldErrors.firstName}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                <FieldErrorMessage message={fieldErrors.lastName}/>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                            <FieldErrorMessage message={fieldErrors.phoneNumber}/>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <FieldErrorMessage message={fieldErrors.password}/>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                                >
                                    {showConfirm ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <FieldErrorMessage message={fieldErrors.confirmPassword}/>
                        </div>

                        {/* Doctor note */}
                        {activeTab === 'doctor' && (
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                After registration, you'll need to complete onboarding and submit verification
                                documents. Your account will be reviewed by admin before activation.
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {isPending ? (
                                <>
                                    <Spinner size="sm"/>
                                    Creating account...
                                </>
                            ) : (
                                `Register as ${activeTab === 'patient' ? 'Patient' : 'Doctor'}`
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to={ROUTES.login} className="text-blue-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}