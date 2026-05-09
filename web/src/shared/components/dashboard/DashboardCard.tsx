import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Spinner from "../ui/Spinner";

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  to: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  to,
  children,
  isLoading,
}) => (
  <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="text-blue-400/90">{icon}</div>
        <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
      </div>
      <Link
        to={to}
        className="flex items-center gap-1 text-xs text-blue-400/80 font-medium hover:text-blue-300 transition-colors duration-200"
      >
        Manage
        <ArrowRight size={13} />
      </Link>
    </div>

    <div className="px-6 py-5">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default DashboardCard;
