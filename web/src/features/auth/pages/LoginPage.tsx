import { Link } from "react-router-dom";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { ROUTES } from "../../../routes/routePaths";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../shared/components/ui/Spinner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import FormCard from "../components/FormCard";

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
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 h-full w-full">
        <div className="absolute top-4 left-4 z-20">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-700/60 bg-gray-950/70 text-gray-300 text-sm hover:text-white hover:border-gray-500/70 hover:bg-gray-900/80 transition-all duration-200 backdrop-blur-md"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
        </div>

        <div className="h-full w-full bg-gray-950/70 backdrop-blur-xl overflow-hidden">
          <div className="grid h-full w-full lg:grid-cols-[1.1fr_1fr]">
            {/* Left Visual Section */}
            <div className="hidden lg:flex relative overflow-hidden p-10 bg-gradient-to-br from-emerald-900 via-cyan-800 to-black">
              <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.45),transparent_55%),radial-gradient(circle_at_85%_70%,rgba(34,211,238,0.35),transparent_45%)]"></div>
              <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"></div>
              <div className="absolute bottom-12 right-12 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl"></div>
              <div className="absolute top-1/3 right-16 h-24 w-24 rounded-2xl border border-white/20 bg-white/10 rotate-12"></div>

              <div className="relative z-10 w-full p-8 flex flex-col justify-between">
                <div>
                  <h2 className="mt-6 text-4xl font-bold leading-tight text-white">
                    Continue your healthcare journey
                  </h2>
                  <p className="mt-4 text-base text-emerald-100/80 max-w-md">
                    Access appointments, medical records, and secure updates in
                    one place with your LuneCare account.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-200">
                        Access
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Instant dashboard login
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-cyan-200">
                        Security
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        Protected role-based access
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 to-white/5 p-4">
                    <p className="text-sm font-semibold text-white">
                      What you can do after login
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-emerald-100/90">
                      <p>• Manage appointments and payments quickly</p>
                      <p>• Track notifications and clinical updates</p>
                      <p>• Continue care with verified providers</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <img
                        src="/avatars/2.png"
                        alt="user"
                        className="h-8 w-8 rounded-full border-2 border-indigo-900 object-cover"
                      />
                      <img
                        src="/avatars/1.png"
                        alt="user"
                        className="h-8 w-8 rounded-full border-2 border-indigo-900 object-cover"
                      />
                      <img
                        src="/avatars/3.png"
                        alt="user"
                        className="h-8 w-8 rounded-full border-2 border-indigo-900 object-cover"
                      />
                    </div>
                    <p className="text-xs text-emerald-100/80">
                      Trusted by patients and doctors every day
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="h-full overflow-y-auto">
              <div className="min-h-full flex items-center justify-center p-5 md:p-10 lg:p-12">
                <div className="w-full max-w-lg">
                  <FormCard
                    title="Welcome Back"
                    subtitle="Sign in to continue to your LuneCare account"
                    formError={formError}
                    footer={
                      <p className="text-center text-sm text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link
                          to={ROUTES.register}
                          className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                        >
                          Create one
                        </Link>
                      </p>
                    }
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Phone Number Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter 10-digit number"
                          maxLength={10}
                          className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                        />
                        <FieldErrorMessage message={fieldErrors.phoneNumber} />
                      </div>

                      {/* Password Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
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
                        <FieldErrorMessage message={fieldErrors.password} />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isPending}
                        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-blue-600/40"
                      >
                        {isPending ? (
                          <>
                            <Spinner size="sm" />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          "Login"
                        )}
                      </button>
                    </form>
                  </FormCard>

                  <p className="text-center text-xs text-gray-600 mt-6">
                    By signing in, you agree to our{" "}
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
