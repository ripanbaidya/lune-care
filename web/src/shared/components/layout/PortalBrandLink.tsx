import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Stethoscope } from "lucide-react";
import { ROUTES } from "../../../routes/routePaths";

interface PortalBrandLinkProps {
  subtitle?: string;
  showShield?: boolean;
  className?: string;
}

const PortalBrandLink: React.FC<PortalBrandLinkProps> = ({
  subtitle,
  showShield = false,
  className = "",
}) => {
  return (
    <Link
      to={ROUTES.home}
      className={`flex items-center gap-3 px-5 py-5 border-b border-gray-800/50 ${className}`}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
        <Stethoscope size={16} className="text-white" />
      </div>
      <div>
        <span className="text-lg font-bold text-white">LuneCare</span>
        {subtitle ? (
          <div className="flex items-center gap-1 mt-0.5">
            {showShield ? (
              <ShieldCheck size={10} className="text-blue-400" />
            ) : null}
            <p className="text-[10px] text-blue-400 font-semibold leading-none tracking-wide uppercase">
              {subtitle}
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
};

export default PortalBrandLink;
