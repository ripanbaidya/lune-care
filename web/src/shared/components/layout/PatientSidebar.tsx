import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Star,
  Stethoscope,
  User,
  X,
} from "lucide-react";
import { ROUTES } from "../../../routes/routePaths";
import clsx from "clsx";
import { useUnreadNotificationCount } from "../../../features/notification/hooks/useNotifications.ts";
import { useLogout } from "../../hooks/useLogout.ts";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: ROUTES.patientDashboard,
    icon: <LayoutDashboard size={18} />,
  },
  { label: "Find Doctors", to: ROUTES.findDoctors, icon: <Search size={18} /> },
  {
    label: "Appointments",
    to: ROUTES.patientAppointments,
    icon: <CalendarDays size={18} />,
  },
  {
    label: "Payments",
    to: ROUTES.patientPayments,
    icon: <CreditCard size={18} />,
  },
  { label: "Profile", to: ROUTES.patientProfile, icon: <User size={18} /> },
  { label: "Address", to: ROUTES.patientAddress, icon: <MapPin size={18} /> },
  {
    label: "Notifications",
    to: ROUTES.patientNotifications,
    icon: <Bell size={18} />,
  },
  {
    label: "My Feedback",
    to: ROUTES.patientFeedback,
    icon: <Star size={18} />,
  },
];

const PatientSidebar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: unreadData } = useUnreadNotificationCount();
  const unreadCount = unreadData?.data?.unreadCount ?? 0;
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
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-900/50",
            )
          }
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {/* Badge — only for Notifications nav item */}
          {item.label === "Notifications" && unreadCount > 0 && (
            <span className="min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-lg shadow-red-600/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gradient-to-b from-gray-950 to-black border-r border-gray-800/50 fixed left-0 top-0 z-30">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800/50">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Stethoscope size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">LuneCare</span>
        </div>

        <NavList />

        <div className="px-3 py-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-gray-950 to-black border-b border-gray-800/50 flex items-center justify-between px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Stethoscope size={14} className="text-white" />
          </div>
          <span className="text-base font-bold text-white">LuneCare</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 bg-gradient-to-b from-gray-950 to-black h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
              <span className="font-bold text-white">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <NavList />
            <div className="px-3 py-4 border-t border-gray-800/50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientSidebar;
