import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import { ACCOUNT_STATUS } from "../auth/auth.types.ts";
import { ROUTES } from "../../routes/routePaths";

interface Props {
  children: React.ReactNode;
}

/**
 * Guard for doctor routes that require ACTIVE account status.
 * Redirects based on account status:
 *   - ONBOARDING             → /doctor/onboarding
 *   - PENDING_VERIFICATION   → /doctor/pending
 *   - ACTIVE                 → allow through
 *   - anything else          → /login
 */
const DoctorActiveRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isDoctor } = useAuth();
  const { user } = useAuthStore();

  if (!isAuthenticated || !isDoctor) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === ACCOUNT_STATUS.ONBOARDING) {
    return <Navigate to={ROUTES.doctorOnboarding} replace />;
  }

  if (user?.status === ACCOUNT_STATUS.PENDING_VERIFICATION) {
    return <Navigate to={ROUTES.doctorPending} replace />;
  }

  if (user?.status !== ACCOUNT_STATUS.ACTIVE) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <>{children}</>;
};

export default DoctorActiveRoute;
