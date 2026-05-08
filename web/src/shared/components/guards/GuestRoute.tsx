import {Navigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {ROUTES} from '../../../routes/routePaths';

interface Props {
    children: React.ReactNode;
}

const GuestRoute: React.FC<Props> = ({children}) => {
    const {isAuthenticated, role} = useAuth();

    if (!isAuthenticated) return <>{children}</>;

    // Already logged in — send them to their dashboard
    if (role === 'ROLE_PATIENT') return <Navigate to={ROUTES.patientDashboard} replace/>;
    if (role === 'ROLE_DOCTOR') return <Navigate to={ROUTES.doctorDashboard} replace/>;
    if (role === 'ROLE_ADMIN') return <Navigate to={ROUTES.adminDashboard} replace/>;

    return <Navigate to={ROUTES.home} replace/>;
};

export default GuestRoute;