import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useQueryClient} from "@tanstack/react-query";
import {useAuthStore} from "./store/authStore";
import AppRoutes from "./routes/AppRoutes.tsx";

const App: React.FC = () => {
    const navigate = useNavigate();
    const {clearAuth} = useAuthStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handler = () => {
            clearAuth();
            queryClient.clear(); // ← ADD THIS — kills all background refetches
            navigate("/login", {replace: true});
        };
        window.addEventListener("auth:unauthorized", handler);
        return () => window.removeEventListener("auth:unauthorized", handler);
    }, []);

    return <AppRoutes/>;
};

export default App;