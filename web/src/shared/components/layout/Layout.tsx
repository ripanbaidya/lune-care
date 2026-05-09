import { Outlet } from "react-router-dom";

const Layout: React.FC = () => (
  <div className="flex min-h-screen bg-black">
    <main className="flex-1 overflow-auto px-4 md:px-6 pt-16 md:pt-6 pb-[calc(5rem_+_env(safe-area-inset-bottom))] md:pb-6">
      <Outlet />
    </main>
  </div>
);

export default Layout;
