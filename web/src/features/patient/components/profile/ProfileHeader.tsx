import React from "react";
import { Pencil, X, Check } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

interface ProfileHeaderProps {
  isEditing: boolean;
  isUpdating: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isEditing,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your personal information
        </p>
      </div>
      {!isEditing ? (
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-sm font-medium rounded-lg transition-all duration-200"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 text-sm rounded-lg transition-all duration-200 hover:bg-gray-800/50"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isUpdating ? <Spinner size="sm" /> : <Check size={16} />}
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
