import {Navigate} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {ROUTES} from '../../../routes/routePaths';

interface Props {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({children}) => {
    const {isAuthenticated} = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.login} replace/>;
};

export default PrivateRoute;