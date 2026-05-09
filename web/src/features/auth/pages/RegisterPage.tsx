import { Link } from "react-router-dom";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { ROUTES } from "../../../routes/routePaths";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage.tsx";
import Spinner from "../../../shared/components/ui/Spinner.tsx";
import { Eye, EyeOff } from "lucide-react";
import FormCard from "../components/FormCard";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";

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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <Link to={ROUTES.home} className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            LuneCare
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Join our healthcare community
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-3 bg-gray-950/50 border border-gray-800 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => switchTab("patient")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "patient"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => switchTab("doctor")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "doctor"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
            }`}
          >
            Doctor
          </button>
        </div>

        {/* Form Card */}
        <FormCard
          title={`Create ${activeTab === "patient" ? "Patient" : "Doctor"} Account`}
          subtitle={
            activeTab === "patient"
              ? "Access your health records and connect with healthcare providers"
              : "Start providing care to patients on LuneCare"
          }
          formError={formError}
          footer={
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to={ROUTES.login}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                />
                <FieldErrorMessage message={fieldErrors.firstName} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                />
                <FieldErrorMessage message={fieldErrors.lastName} />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
              />
              <FieldErrorMessage message={fieldErrors.phoneNumber} />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrengthIndicator password={form.password} />
              <FieldErrorMessage message={fieldErrors.password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 pr-12 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldErrorMessage message={fieldErrors.confirmPassword} />
            </div>

            {/* Doctor Info Alert */}
            {activeTab === "doctor" && (
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-700/40 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-300">
                  Verification Required
                </p>
                <p className="text-xs text-amber-200/80">
                  After registration, you'll need to complete onboarding and
                  submit verification documents. Your account will be reviewed
                  by our admin team before activation.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-blue-600/40"
            >
              {isPending ? (
                <>
                  <Spinner size="sm" />
                  <span>Creating account...</span>
                </>
              ) : (
                `Register as ${activeTab === "patient" ? "Patient" : "Doctor"}`
              )}
            </button>
          </form>
        </FormCard>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By registering, you agree to our{" "}
          <a
            href="#"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
