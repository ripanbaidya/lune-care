import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "./store/authStore";
import AppRoutes from "./routes/AppRoutes.tsx";

const App: React.FC = () => {
    const navigate = useNavigate();
    const {clearAuth} = useAuthStore();

    useEffect(() => {
        const handler = () => {
            clearAuth();
            navigate("/login", {replace: true});
        };
        window.addEventListener("auth:unauthorized", handler);
        return () => window.removeEventListener("auth:unauthorized", handler);
    }, []);

    return <AppRoutes/>;
};

export default App;
