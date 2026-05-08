import React, {useState} from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import {LayoutDashboard, LogOut, Menu, ShieldCheck, Stethoscope, X,} from 'lucide-react';
import {ROUTES} from '../../../routes/routePaths';
import clsx from 'clsx';
import {useLogout} from "../../../shared/hooks/useLogout.ts";

const NAV_ITEMS = [
    { label: 'Dashboard', to: ROUTES.adminDashboard, icon: <LayoutDashboard size={18} /> },
];

const AdminLayout: React.FC = () => {
    // const { clearAuth, refreshToken } = useAuthStore();
    // const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = useLogout();

    const NavList = () => (
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                        clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                                : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200',
                        )
                    }
                >
                    {item.icon}
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );

    const SidebarBrand = () => (
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800/60">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Stethoscope size={16} className="text-white" />
            </div>
            <div>
                <span className="text-base font-bold text-white">LuneCare</span>
                <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={10} className="text-blue-400" />
                    <p className="text-[10px] text-blue-400 font-semibold leading-none tracking-wide uppercase">
                        Admin Portal
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gray-950/80 border-r border-gray-800/60 fixed left-0 top-0 z-30 backdrop-blur-xl">
                <SidebarBrand />
                <NavList />
                <div className="px-3 py-4 border-t border-gray-800/60">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Mobile Top Bar ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-950/90 border-b border-gray-800/60 backdrop-blur-xl flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Stethoscope size={14} className="text-white" />
                    </div>
                    <span className="text-base font-bold text-white">LuneCare</span>
                    <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">Admin</span>
                </div>
                <button onClick={() => setMobileOpen(true)} className="text-gray-400">
                    <Menu size={22} />
                </button>
            </div>

            {/* ── Mobile Drawer ── */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="relative flex flex-col w-64 bg-gray-950 border-r border-gray-800/60 h-full shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
                            <span className="font-bold text-white">Menu</span>
                            <button onClick={() => setMobileOpen(false)}>
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <NavList />
                        <div className="px-3 py-4 border-t border-gray-800/60">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main Content ── */}
            <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;