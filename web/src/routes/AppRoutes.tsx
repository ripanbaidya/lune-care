import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routePaths";
import PrivateRoute from "../shared/components/guards/PrivateRoute";
import RoleRoute from "../shared/components/guards/RoleRoute";
import Layout from "../shared/components/layout/Layout";
import PatientLayout from "../shared/components/layout/PatientLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

// Patient pages
import PatientDashboard from "../features/patient/pages/PatientDashboard";
import PatientProfilePage from "../features/patient/pages/PatientProfilePage";
import PatientAddressPage from "../features/patient/pages/PatientAddressPage";

// Doctor pages
import DoctorOnboardingPage from "../features/doctor/pages/DoctorOnboardingPage";
import DoctorPendingVerificationPage from "../features/doctor/pages/DoctorPendingVerificationPage";
import DoctorLayout from "../features/doctor/pages/DoctorLayout";
import DoctorActiveRoute from "../features/doctor/DoctorActiveRoute";
import DoctorDashboard from "../features/doctor/pages/DoctorDashboard";
import DoctorProfilePage from "../features/doctor/pages/DoctorProfilePage";
import DoctorClinicsPage from "../features/doctor/pages/DoctorClinicsPage";

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public routes */}
    <Route path={ROUTES.login} element={<LoginPage />} />
    <Route path={ROUTES.register} element={<RegisterPage />} />

    {/* Patient routes */}
    <Route
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={["ROLE_PATIENT"]}>
            <PatientLayout />
          </RoleRoute>
        </PrivateRoute>
      }
    >
      <Route path={ROUTES.patientDashboard} element={<PatientDashboard />} />
      <Route path={ROUTES.patientProfile} element={<PatientProfilePage />} />
      <Route path={ROUTES.patientAddress} element={<PatientAddressPage />} />
      {/* Placeholders for upcoming features */}
      <Route
        path={ROUTES.patientAppointments}
        element={
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Appointments — coming soon
          </div>
        }
      />
      <Route
        path={ROUTES.patientNotifications}
        element={
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Notifications — coming soon
          </div>
        }
      />
    </Route>

    {/* Doctor — onboarding & pending (no ACTIVE status required) */}
    <Route
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={["ROLE_DOCTOR"]}>
            <DoctorOnboardingPage />
          </RoleRoute>
        </PrivateRoute>
      }
      path={ROUTES.doctorOnboarding}
    />
    <Route
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={["ROLE_DOCTOR"]}>
            <DoctorPendingVerificationPage />
          </RoleRoute>
        </PrivateRoute>
      }
      path={ROUTES.doctorPending}
    />

    {/* Doctor — active routes (ACTIVE status required) */}
    <Route
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={["ROLE_DOCTOR"]}>
            <DoctorActiveRoute>
              <DoctorLayout />
            </DoctorActiveRoute>
          </RoleRoute>
        </PrivateRoute>
      }
    >
      <Route path={ROUTES.doctorDashboard} element={<DoctorDashboard />} />
      <Route path={ROUTES.doctorProfile} element={<DoctorProfilePage />} />
      <Route path={ROUTES.doctorClinics} element={<DoctorClinicsPage />} />
      <Route
        path={ROUTES.doctorAppointments}
        element={
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Appointments — coming soon
          </div>
        }
      />
      <Route
        path={ROUTES.doctorNotifications}
        element={
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Notifications — coming soon
          </div>
        }
      />
    </Route>

    {/* Admin routes (generic layout) */}
    <Route
      element={
        <PrivateRoute>
          <RoleRoute allowedRoles={["ROLE_ADMIN"]}>
            <Layout />
          </RoleRoute>
        </PrivateRoute>
      }
    >
      {/* Admin routes will go here */}
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
  </Routes>
);

export default AppRoutes;
