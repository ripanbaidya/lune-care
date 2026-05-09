import React from "react";
import { UserCircle } from "lucide-react";
import Spinner from "../ui/Spinner";

interface HeroStripProps {
  name: string | null | undefined;
  subtitle?: string | null;
  profilePhotoUrl?: string | null;
  isLoading: boolean;
}

const HeroStrip: React.FC<HeroStripProps> = ({
  name,
  subtitle,
  profilePhotoUrl,
  isLoading,
}) => (
  <div className="bg-gradient-to-r from-blue-600/80 via-blue-600/60 to-indigo-600/80 backdrop-blur-md rounded-2xl px-6 py-6 flex items-center gap-4 shadow-lg border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
    {profilePhotoUrl ? (
      <img
        src={profilePhotoUrl}
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-lg"
      />
    ) : (
      <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
        <UserCircle size={36} className="text-white/80" />
      </div>
    )}

    <div>
      {isLoading ? (
        <Spinner size="sm" className="border-white border-t-transparent" />
      ) : (
        <>
          <p className="text-white font-bold text-lg">{name || "—"}</p>
          {subtitle && (
            <p className="text-blue-100/80 text-xs mt-1">{subtitle}</p>
          )}
        </>
      )}
    </div>
  </div>
);

export default HeroStrip;
