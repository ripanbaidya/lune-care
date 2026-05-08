import React, {useState} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Building2,
    CalendarDays,
    Bell,
    LogOut,
    Menu,
    X,
    Stethoscope,
} from 'lucide-react';
import {useAuthStore} from '../../../store/authStore';
import {authService} from '../../auth/authService.ts';
import {ROUTES} from '../../../routes/routePaths';
import clsx from 'clsx';
import {useUnreadNotificationCount} from "../../notification/hooks/useNotifications.ts";

interface NavItem {
    label: string;
    to: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    {label: 'Dashboard', to: ROUTES.doctorDashboard, icon: <LayoutDashboard size={18}/>},
    {label: 'Profile', to: ROUTES.doctorProfile, icon: <User size={18}/>},
    {label: 'Clinics', to: ROUTES.doctorClinics, icon: <Building2 size={18}/>},
    {label: 'Appointments', to: ROUTES.doctorAppointments, icon: <CalendarDays size={18}/>},
    {label: 'Notifications', to: ROUTES.doctorNotifications, icon: <Bell size={18}/>},
];

const DoctorSidebar: React.FC = () => {
    const {clearAuth, refreshToken} = useAuthStore();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const {data: unreadData} = useUnreadNotificationCount();
    const unreadCount = unreadData?.data?.unreadCount ?? 0;

    const handleLogout = async () => {
        try {
            if (refreshToken) await authService.logout({refreshToken});
        } catch {
            // best-effort logout
        } finally {
            clearAuth();
            navigate(ROUTES.login, {replace: true});
        }
    };

    const NavList = () => (
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({isActive}) =>
                        clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-teal-50 text-teal-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )
                    }
                >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {/* Badge — only for Notifications nav item */}
                    {item.label === 'Notifications' && unreadCount > 0 && (
                        <span
                            className="min-w-[18px] h-[18px] px-1 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                    )}
                </NavLink>
            ))}
        </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-30">
                <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Stethoscope size={16} className="text-white"/>
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900">LuneCare</span>
                        <p className="text-xs text-teal-600 font-medium leading-none">Doctor Portal</p>
                    </div>
                </div>

                <NavList/>

                <div className="px-3 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18}/>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <div
                className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Stethoscope size={14} className="text-white"/>
                    </div>
                    <span className="text-base font-bold text-gray-900">LuneCare</span>
                </div>
                <button onClick={() => setMobileOpen(true)} className="text-gray-600">
                    <Menu size={22}/>
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)}/>
                    <div className="relative flex flex-col w-64 bg-white h-full shadow-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <span className="font-bold text-gray-900">Menu</span>
                            <button onClick={() => setMobileOpen(false)}>
                                <X size={20} className="text-gray-500"/>
                            </button>
                        </div>
                        <NavList/>
                        <div className="px-3 py-4 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={18}/>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DoctorSidebar;