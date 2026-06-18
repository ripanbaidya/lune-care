import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ROUTES } from "../../../routes/routePaths";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../shared/components/ui/Spinner";
import FormCard from "../components/FormCard";
import { useResetPassword } from "../hooks/useResetPassword";
import type { Location } from "react-router-dom";
import { useState } from "react";

type ResetLocationState = {
  phoneNumber?: string;
  resetToken?: string;
  expiresAt?: string;
} | null;

export default function ResetPasswordPage() {
  const location = useLocation() as Location & { state: ResetLocationState };
  const initialToken = location.state?.resetToken ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    resetToken,
    setResetToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    formError,
    isPending,
    handleSubmit,
  } = useResetPassword(initialToken);

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 h-full w-full bg-gray-950/70 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
          <Link
            to={ROUTES.forgotPassword}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-700/60 bg-gray-950/70 text-gray-300 text-sm hover:text-white hover:border-gray-500/70 hover:bg-gray-900/80 transition-all duration-200 backdrop-blur-md"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>

        <div className="min-h-full flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-xl">
            <FormCard
              title="Reset Password"
              subtitle="Enter the one-time reset token and choose a new password."
              formError={formError}
              footer={
                <p className="text-center text-sm text-gray-400">
                  Need a fresh token?{" "}
                  <Link
                    to={ROUTES.forgotPassword}
                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                  >
                    Request again
                  </Link>
                </p>
              }
            >
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 mb-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} className="mt-0.5 text-emerald-300" />
                  <p className="text-sm text-emerald-100/90">
                    Because there is no email or SMS delivery, the token is shown
                    in-app for demo use. Paste it here to complete the reset.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste the reset token"
                    className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50 font-mono"
                  />
                  <FieldErrorMessage message={fieldErrors.resetToken} />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FieldErrorMessage message={fieldErrors.newPassword} />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-12 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <FieldErrorMessage message={fieldErrors.confirmPassword} />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-blue-600/40"
                >
                  {isPending ? (
                    <>
                      <Spinner size="sm" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </FormCard>
          </div>
        </div>
      </div>
    </div>
  );
}
