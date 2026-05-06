import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routePaths";
import PrivateRoute from "../shared/components/guards/PrivateRoute";
import LoginPage from "../features/auth/pages/LoginPage.tsx";
import Layout from "../shared/components/layout/Layout.tsx";
import RegisterPage from "../features/auth/pages/RegisterPage.tsx";


const AppRoutes: React.FC = () => (
    <Routes>
        {/* Public routes */}
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
            element={
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            }
        >

        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
);

export default AppRoutes;
