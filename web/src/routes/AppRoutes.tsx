import React from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {ROUTES} from "./routePaths";
import PrivateRoute from "../shared/components/guards/PrivateRoute";
import RoleRoute from "../shared/components/guards/RoleRoute";
import Layout from "../shared/components/layout/Layout";
import PatientLayout from "../shared/components/layout/PatientLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

// Public pages
import HomePage from "../features/public/pages/HomePage";
import DoctorPublicProfilePage from "../features/doctor/pages/DoctorPublicProfilePage";

// Patient pages
import PatientDashboard from "../features/patient/pages/PatientDashboard";
import PatientProfilePage from "../features/patient/pages/PatientProfilePage";
import PatientAddressPage from "../features/patient/pages/PatientAddressPage";
import PatientAppointmentsPage from "../features/patient/pages/PatientAppointmentsPage";
import AppointmentDetailPage from "../features/patient/pages/AppointmentDetailPage";
import FindDoctorsPage from "../features/public/pages/FindDoctorsPage";
import PaymentHistoryPage from "../features/payment/pages/PaymentHistoryPage";

import NotificationsPage from '../features/notification/pages/NotificationPage';
import MySubmittedFeedbackPage from '../features/feedback/pages/MySubmittedFeedbackPage';
import MyReceivedFeedbackPage from '../features/feedback/pages/MyReceivedFeedbackPage';

// Doctor pages
import DoctorOnboardingPage from "../features/doctor/pages/DoctorOnboardingPage";
import DoctorPendingVerificationPage from "../features/doctor/pages/DoctorPendingVerificationPage";
import DoctorLayout from "../features/doctor/pages/DoctorLayout";
import DoctorActiveRoute from "../features/doctor/DoctorActiveRoute";
import DoctorDashboard from "../features/doctor/pages/DoctorDashboard";
import DoctorProfilePage from "../features/doctor/pages/DoctorProfilePage";
import DoctorClinicsPage from "../features/doctor/pages/DoctorClinicsPage";
import DoctorAppointmentsPage from "../features/doctor/pages/DoctorAppointmentsPage.tsx";

const AppRoutes: React.FC = () => (
    <Routes>
        {/* ── Fully Public Routes ── */}
        <Route path={ROUTES.home} element={<HomePage/>}/>
        <Route path="/doctors/:doctorId" element={<DoctorPublicProfilePage/>}/>

        {/* ── Auth Pages ── */}
        <Route path={ROUTES.login} element={<LoginPage/>}/>
        <Route path={ROUTES.register} element={<RegisterPage/>}/>

        {/* ── Patient Routes ── */}
        <Route element={
            <PrivateRoute>
                <RoleRoute allowedRoles={["ROLE_PATIENT"]}>
                    <PatientLayout/>
                </RoleRoute>
            </PrivateRoute>
        }
        >
            <Route path={ROUTES.patientDashboard} element={<PatientDashboard/>}/>
            <Route path={ROUTES.patientProfile} element={<PatientProfilePage/>}/>
            <Route path={ROUTES.patientAddress} element={<PatientAddressPage/>}/>

            {/* Find Doctors — inside patient layout */}
            <Route path={ROUTES.findDoctors} element={<FindDoctorsPage/>}/>

            {/* Appointments list + detail */}
            <Route path={ROUTES.patientAppointments} element={<PatientAppointmentsPage/>}/>
            <Route path={ROUTES.patientAppointmentDetail} element={<AppointmentDetailPage/>}/>

            {/* Payment history */}
            <Route path={ROUTES.patientPayments} element={<PaymentHistoryPage/>}/>

            <Route path={ROUTES.patientNotifications} element={<NotificationsPage/>}/>

            <Route path={ROUTES.patientFeedback} element={<MySubmittedFeedbackPage />} />
        </Route>

        {/* ── Doctor — onboarding & pending ── */}
        <Route
            element={
                <PrivateRoute>
                    <RoleRoute allowedRoles={["ROLE_DOCTOR"]}>
                        <DoctorOnboardingPage/>
                    </RoleRoute>
                </PrivateRoute>
            }
            path={ROUTES.doctorOnboarding}
        />
        <Route
            element={
                <PrivateRoute>
                    <RoleRoute allowedRoles={["ROLE_DOCTOR"]}>
                        <DoctorPendingVerificationPage/>
                    </RoleRoute>
                </PrivateRoute>
            }
            path={ROUTES.doctorPending}
        />

        {/* ── Doctor — active routes ── */}
        <Route
            element={
                <PrivateRoute>
                    <RoleRoute allowedRoles={["ROLE_DOCTOR"]}>
                        <DoctorActiveRoute>
                            <DoctorLayout/>
                        </DoctorActiveRoute>
                    </RoleRoute>
                </PrivateRoute>
            }
        >
            <Route path={ROUTES.doctorDashboard} element={<DoctorDashboard/>}/>
            <Route path={ROUTES.doctorProfile} element={<DoctorProfilePage/>}/>
            <Route path={ROUTES.doctorClinics} element={<DoctorClinicsPage/>}/>
            <Route path={ROUTES.doctorAppointments} element={<DoctorAppointmentsPage/>}/>
            <Route path={ROUTES.doctorNotifications} element={<NotificationsPage/>}/>
            <Route path={ROUTES.doctorFeedback} element={<MyReceivedFeedbackPage />} />
        </Route>

        {/* ── Admin Routes ── */}
        <Route element={
            <PrivateRoute>
                <RoleRoute allowedRoles={["ROLE_ADMIN"]}>
                    <Layout/>
                </RoleRoute>
            </PrivateRoute>
        }
        >
            {/* Admin routes will go here */}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace/>}/>
    </Routes>
);

export default AppRoutes;