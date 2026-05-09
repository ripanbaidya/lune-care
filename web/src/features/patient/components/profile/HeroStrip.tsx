import React from "react";
import { UserCircle } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

interface HeroStripProps {
  profile: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profilePhotoUrl?: string;
  } | null;
  isLoading: boolean;
}

const HeroStrip: React.FC<HeroStripProps> = ({ profile, isLoading }) => (
  <div className="bg-gradient-to-r from-blue-600/80 via-blue-600/60 to-indigo-600/80 backdrop-blur-md rounded-2xl px-6 py-6 flex items-center gap-4 shadow-lg border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
    {profile?.profilePhotoUrl ? (
      <img
        src={profile.profilePhotoUrl}
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
          <p className="text-white font-bold text-lg">
            {profile ? `${profile.firstName} ${profile.lastName}` : "—"}
          </p>
          <p className="text-blue-100/80 text-xs mt-1">
            {profile?.phoneNumber}
          </p>
        </>
      )}
    </div>
  </div>
);

export default HeroStrip;
