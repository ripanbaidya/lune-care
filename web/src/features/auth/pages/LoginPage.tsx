import { Link } from "react-router-dom";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { ROUTES } from "../../../routes/routePaths";
import { FormError } from "../../../shared/components/ui/FormError";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../shared/components/ui/Spinner";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <Link to={ROUTES.home} className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            LuneCare
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Healthcare Management Platform
          </p>
        </div>

        {/* Premium Dark Card */}
        <div className="bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1">
              Sign in to continue to LuneCare
            </p>
          </div>

          <FormError error={formError} />

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
                className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
              />
              <FieldErrorMessage message={fieldErrors.phoneNumber} />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              <FieldErrorMessage message={fieldErrors.password} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-blue-600/40"
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

          {/* Footer */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              to={ROUTES.register}
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Help Text */}
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
  );
}
