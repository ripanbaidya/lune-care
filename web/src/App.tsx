import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import AppRoutes from "./routes/AppRoutes";
import { ROUTES } from "./routes/routePaths";
import { clearApiAuthHeader } from "./lib/axios";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    const privatePrefixes = ["/patient", "/doctor", "/admin"];

    const handler = () => {
      const { accessToken, user } = useAuthStore.getState();
      const hadAuthenticatedSession = Boolean(accessToken || user);
      if (!hadAuthenticatedSession) return;

      clearAuth();
      clearApiAuthHeader();

      const onPrivateRoute = privatePrefixes.some((prefix) =>
        location.pathname.startsWith(prefix),
      );

      if (onPrivateRoute) {
        navigate(ROUTES.login, { replace: true });
      }
    };

    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [clearAuth, location.pathname, navigate]);

  return <AppRoutes />;
};

export default App;
