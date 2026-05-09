import React from "react";
import { Edit, Plus, Save, X } from "lucide-react";

interface AddressHeaderProps {
  hasAddress: boolean;
  isFormMode: boolean;
  isPending: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const AddressHeader: React.FC<AddressHeaderProps> = ({
  hasAddress,
  isFormMode,
  isPending,
  onEdit,
  onAdd,
  onCancel,
  onSave,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-white">
          {isFormMode
            ? hasAddress
              ? "Edit Address"
              : "Add Address"
            : "My Address"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {!isFormMode ? (
          hasAddress ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <Edit size={14} />
              Edit
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all duration-200"
            >
              <Plus size={14} />
              Add Address
            </button>
          )
        ) : (
          <>
            <button
              onClick={onCancel}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-all duration-200"
            >
              <Save size={14} />
              {isPending ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
