import {Navigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {ROUTES} from '../../../routes/routePaths';
import type {UserResponse} from '../../../features/auth/auth.types';

interface Props {
    children: React.ReactNode;
    allowedRoles: UserResponse['role'][];
}

const RoleRoute: React.FC<Props> = ({children, allowedRoles}) => {
    const {isAuthenticated, role} = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.login} replace/>;
    }

    if (!role || !allowedRoles.includes(role)) {
        // Redirect to their correct dashboard if they have wrong role
        return <Navigate to={ROUTES.home} replace/>;
    }

    return <>{children}</>;
};

export default RoleRoute;