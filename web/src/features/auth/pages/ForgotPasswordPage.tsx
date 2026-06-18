import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, LockKeyhole, Sparkles } from "lucide-react";
import { ROUTES } from "../../../routes/routePaths";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../shared/components/ui/Spinner";
import FormCard from "../components/FormCard";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    phoneNumber,
    setPhoneNumber,
    fieldErrors,
    formError,
    isPending,
    resetResponse,
    handleSubmit,
  } = useForgotPassword();
  const [copied, setCopied] = useState(false);

  const handleCopyToken = async () => {
    if (!resetResponse?.resetToken) return;
    await navigator.clipboard.writeText(resetResponse.resetToken);
    setCopied(true);
    toast.success("Reset token copied");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (!resetResponse) return;
    navigate(ROUTES.resetPassword, {
      state: {
        phoneNumber,
        resetToken: resetResponse.resetToken,
        expiresAt: resetResponse.expiresAt,
      },
    });
  };

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
            to={ROUTES.login}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-700/60 bg-gray-950/70 text-gray-300 text-sm hover:text-white hover:border-gray-500/70 hover:bg-gray-900/80 transition-all duration-200 backdrop-blur-md"
          >
            <ArrowLeft size={12} className="text-white" />
            Login
          </Link>
        </div>

        <div className="min-h-full flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-xl">
            <FormCard
              title="Forgot Password"
              subtitle="Use your registered phone number to generate a one-time reset token."
              formError={formError}
              footer={
                <p className="text-center text-sm text-gray-400">
                  Remembered your password?{" "}
                  <Link
                    to={ROUTES.login}
                    className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                  >
                    Back to login
                  </Link>
                </p>
              }
            >
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 mb-5">
                <div className="flex items-start gap-3">
                  <p className="text-sm text-amber-100/90">
                    Note: This application is in dev mode; and there is no SMS or Gmail delivery.
                  </p>
                </div>
              </div>

              {resetResponse ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-emerald-100">
                          Reset token generated !
                        </p>
                        <p className="text-xs text-emerald-100/80 mt-1">
                          Copy this token and continue to the reset screen.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-500 font-semibold">
                      Reset Token
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={resetResponse.resetToken}
                        className="flex-1 px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-2xl text-sm text-white font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyToken}
                        className="px-4 py-3 rounded-2xl border border-gray-700/60 text-gray-200 hover:bg-gray-800/60 transition-colors inline-flex items-center gap-2"
                      >
                        <Copy size={14} />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gray-950/50 p-4 text-sm text-gray-300">
                    <p className="font-semibold text-gray-100">Expires at</p>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      {new Date(resetResponse.expiresAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-600/25"
                  >
                    Continue to Reset Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter registered phone number"
                      maxLength={10}
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-full text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
                    />
                    <FieldErrorMessage message={fieldErrors.phoneNumber} />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-blue-600/40"
                  >
                    {isPending ? (
                      <>
                        <Spinner size="sm" />
                        <span>Generating token...</span>
                      </>
                    ) : (
                      "Generate Reset Token"
                    )}
                  </button>
                </form>
              )}
            </FormCard>
          </div>
        </div>
      </div>
    </div>
  );
}
