import React from "react";
import {
  Building2,
  Pencil,
  Trash2,
  IndianRupee,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import {
  CLINIC_TYPE_LABELS,
  type ClinicResponse,
} from "../../types/doctor-clinic.types";
import ClinicSchedulePanel from "./schedule/ClinicSchedulePanel";

interface ClinicCardProps {
  clinic: ClinicResponse;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  onEdit,
  onDelete,
  isDeleting,
}) => (
  <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
    {/* Header */}
    <div className="flex items-start justify-between px-5 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={16} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-100">{clinic.name}</h3>
          <p className="text-xs text-gray-400">
            {CLINIC_TYPE_LABELS[clinic.type] || clinic.type}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            clinic.active
              ? "bg-green-500/20 text-green-400"
              : "bg-gray-700/50 text-gray-500"
          }`}
        >
          {clinic.active ? "Active" : "Inactive"}
        </span>
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          aria-label="Edit clinic"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Delete clinic"
        >
          {isDeleting ? <Spinner size="sm" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>

    {/* Info grid */}
    <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex items-center gap-2">
        <IndianRupee size={13} className="text-blue-400/80 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">Fees</p>
          <p className="text-sm font-medium text-gray-100">
            ₹{clinic.consultationFees}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Clock size={13} className="text-blue-400/80 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">Duration</p>
          <p className="text-sm font-medium text-gray-100">
            {clinic.consultationDurationMinutes} min
          </p>
        </div>
      </div>

      {clinic.contactNumber && (
        <div className="flex items-center gap-2">
          <Phone size={13} className="text-blue-400/80 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Contact</p>
            <p className="text-sm font-medium text-gray-100">
              {clinic.contactNumber}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 sm:col-span-3">
        <MapPin size={13} className="text-blue-400/80 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-gray-400">Address</p>
          <p className="text-sm text-gray-300">
            {clinic.addressLine}, {clinic.city}, {clinic.state} —{" "}
            {clinic.pincode}
          </p>
          {clinic.country && (
            <p className="text-xs text-gray-500">{clinic.country}</p>
          )}
        </div>
      </div>
    </div>

    {/* Schedule panel — hasExistingSchedule prop removed; panel self-derives from fetch */}
    <div className="px-5 pb-5">
      <ClinicSchedulePanel clinicId={clinic.id} />
    </div>
  </div>
);

export default ClinicCard;
