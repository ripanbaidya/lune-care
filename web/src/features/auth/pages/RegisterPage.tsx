import { Link } from "react-router-dom";
import { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { ROUTES } from "../../../routes/routePaths";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../shared/components/ui/Spinner";
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
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 h-full w-full">
        <div className="h-full w-full bg-gray-950/70 backdrop-blur-xl overflow-hidden">
          <div className="grid h-full w-full lg:grid-cols-[1.1fr_1fr]">
           
            {/* Left Visual Section */}
            <div className="hidden lg:flex relative overflow-hidden p-10 bg-gradient-to-br from-blue-900 via-indigo-700 to-black">
              <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.45),transparent_55%),radial-gradient(circle_at_85%_70%,rgba(129,140,248,0.35),transparent_45%)]"></div>
              <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl"></div>
              <div className="absolute bottom-12 right-12 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl"></div>
              <div className="absolute top-1/3 right-16 h-24 w-24 rounded-2xl border border-white/20 bg-white/10 rotate-12"></div>

              <div className="relative z-10 w-full p-8 flex flex-col justify-between">
                <div>
                  <h2 className="mt-6 text-4xl font-bold leading-tight text-white">
                    Build your healthcare profile in minutes
                  </h2>
                  <p className="mt-4 text-base text-blue-100/80 max-w-md">
                    Track health records, connect with trusted providers, and
                    start your care journey with a secure account.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-blue-200">
                        Privacy
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        End-to-end encrypted data
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-blue-200">
                        Speed
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Signup under 30 seconds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 to-white/5 p-4">
                    <p className="text-sm font-semibold text-white">
                      Why people choose LuneCare
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-blue-100/90">
                      <p>• Unified patient and doctor onboarding</p>
                      <p>• Instant profile setup and verification flow</p>
                      <p>• Secure records with role-based access</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img src="/public/avatars/2.png" alt="user" className="h-8 w-8 rounded-full border-2 border-indigo-900 object-cover"/>
                      <img src="/public/avatars/1.png" alt="user" className="h-8 w-8 rounded-full border-2 border-indigo-900 object-cover"/>
                      <img src="/public/avatars/3.png" alt="user" className="h-8 w-8 rounded-full border-2 border-indigo-900 object-cover"/>
                    </div>
                    <p className="text-xs text-blue-100/80">
                      Join thousands building healthier routines
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="h-full overflow-y-auto">
              <div className="min-h-full flex items-center justify-center p-5 md:p-10 lg:p-12">
                <div className="w-full max-w-lg">
                  
                  {/* Tab Switcher */}
                  <div className="flex gap-3 bg-gray-950/50 border border-gray-800 rounded-full p-1 mb-5">
                    <button
                      type="button"
                      onClick={() => switchTab("patient")}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
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
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
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
                            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
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
                            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
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
                          className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
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
                            className="w-full px-4 py-3 pr-12 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
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
                            aria-label={
                              showConfirm ? "Hide password" : "Show password"
                            }
                          >
                            {showConfirm ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        <FieldErrorMessage message={fieldErrors.confirmPassword} />
                      </div>

                      {/* Doctor Info Alert */}
                      {activeTab === "doctor" && (
                        <div className="bg-gradient-to-br from-amber-900/30 to-amber-900/10 border border-amber-700/40 rounded-xl p-4 space-y-2">
                          <p className="text-xs font-semibold text-amber-300">
                            Important !
                          </p>
                          <p className="text-xs text-amber-200/80">
                            After registration, you'll need to complete the onboarding process. 
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-blue-600/40"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
