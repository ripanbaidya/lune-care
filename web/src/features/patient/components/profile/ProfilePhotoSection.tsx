import React, { useRef } from "react";
import { Camera, Trash2, UserCircle } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

interface ProfilePhotoSectionProps {
  profilePhotoUrl?: string | null;
  isUploading: boolean;
  isRemoving: boolean;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

const ProfilePhotoSection: React.FC<ProfilePhotoSectionProps> = ({
  profilePhotoUrl,
  isUploading,
  isRemoving,
  onPhotoChange,
  onRemovePhoto,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-md px-6 py-6">
      <p className="text-sm font-semibold text-gray-200 mb-4">Profile Photo</p>
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          {profilePhotoUrl ? (
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-800/50 border-2 border-gray-700/50 flex items-center justify-center">
              <UserCircle size={48} className="text-gray-500" />
            </div>
          )}
          {(isUploading || isRemoving) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-full">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-600 hover:border-blue-500/50 text-gray-300 hover:text-blue-300 text-sm rounded-lg transition-all duration-200 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={16} />
            {profilePhotoUrl ? "Change Photo" : "Upload Photo"}
          </button>
          {profilePhotoUrl && (
            <button
              onClick={onRemovePhoto}
              disabled={isRemoving}
              className="flex items-center gap-2 px-4 py-2 border border-red-900/50 hover:border-red-700/50 text-red-400 hover:text-red-300 text-sm rounded-lg transition-all duration-200 hover:bg-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Remove Photo
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoChange}
        />
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Accepted: JPG, PNG, WEBP. Max 5MB.
      </p>
    </div>
  );
};

export default ProfilePhotoSection;
