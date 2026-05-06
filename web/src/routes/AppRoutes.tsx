import {Routes, Route, Navigate} from 'react-router-dom';
import {ROUTES} from './routePaths';
import PrivateRoute from '../shared/components/guards/PrivateRoute';
import RoleRoute from '../shared/components/guards/RoleRoute';
import Layout from '../shared/components/layout/Layout';
import PatientLayout from '../shared/components/layout/PatientLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// Patient pages
import PatientDashboard from '../features/patient/pages/PatientDashboard';
import PatientProfilePage from '../features/patient/pages/PatientProfilePage';
import PatientAddressPage from '../features/patient/pages/PatientAddressPage';

const AppRoutes: React.FC = () => (
    <Routes>
        {/* Public routes */}
        <Route path={ROUTES.login} element={<LoginPage/>}/>
        <Route path={ROUTES.register} element={<RegisterPage/>}/>

        {/* Patient routes */}
        <Route
            element={
                <PrivateRoute>
                    <RoleRoute allowedRoles={['ROLE_PATIENT']}>
                        <PatientLayout/>
                    </RoleRoute>
                </PrivateRoute>
            }
        >
            <Route path={ROUTES.patientDashboard} element={<PatientDashboard/>}/>
            <Route path={ROUTES.patientProfile} element={<PatientProfilePage/>}/>
            <Route path={ROUTES.patientAddress} element={<PatientAddressPage/>}/>
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

        {/* Doctor / Admin routes (generic layout, to be expanded) */}
        <Route
            element={
                <PrivateRoute>
                    <Layout/>
                </PrivateRoute>
            }
        >
            {/* Doctor and admin routes will go here */}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace/>}/>
    </Routes>
);

export default AppRoutes;