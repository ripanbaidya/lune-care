import {Link} from 'react-router-dom';
import {useState} from 'react';
import {useLogin} from '../hooks/useLogin';
import {ROUTES} from '../../../routes/routePaths';
import {FormError} from "../../../shared/components/ui/FormError.tsx";
import {FieldErrorMessage} from "../../../shared/components/ui/FieldErrorMessage.tsx";
import Spinner from "../../../shared/components/ui/Spinner.tsx";

export default function LoginPage() {
    const {
        phoneNumber,
        setPhoneNumber,
        password,
        setPassword,
        fieldErrors,
        formError,
        isPending,
        handleSubmit,
    } = useLogin();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to={ROUTES.home}>
                        <h1 className="text-3xl font-bold text-blue-600">LuneCare</h1>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome back</h2>

                    <FormError error={formError}/>

                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter 10-digit number"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
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

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Spinner size="sm"/>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to={ROUTES.register} className="text-blue-600 font-medium hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}