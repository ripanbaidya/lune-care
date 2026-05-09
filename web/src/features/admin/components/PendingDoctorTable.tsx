import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  FileText,
  UserCircle,
  Clock,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import {
  usePendingDoctors,
  useVerifyDoctor,
  useRejectDoctor,
} from "../hooks/useAdmin";
import { SPECIALIZATION_LABELS } from "../../doctor/types/doctor.types";
import type { PendingDoctorResponse } from "../types/admin.types";
import RejectModal from "./RejectModal";
import DoctorDocumentModal from "./DoctorDocumentModal";
import Spinner from "../../../shared/components/ui/Spinner";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";

// Single doctor row

interface DoctorRowProps {
  doctor: PendingDoctorResponse;
  onViewDocs: (doctor: PendingDoctorResponse) => void;
  onApprove: (doctorId: string) => void;
  onReject: (doctor: PendingDoctorResponse) => void;
  isActing: boolean;
}

const DoctorRow: React.FC<DoctorRowProps> = ({
  doctor,
  onViewDocs,
  onApprove,
  onReject,
  isActing,
}) => {
  const specLabel = doctor.specialization
    ? (SPECIALIZATION_LABELS[
        doctor.specialization as keyof typeof SPECIALIZATION_LABELS
      ] ?? doctor.specialization)
    : null;

  const joinedAt = new Date(doctor.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 rounded-xl border border-gray-800/50 bg-gray-900/40 hover:bg-gray-900/60 hover:border-gray-700/60 transition-all group">
      {/* Left: Doctor info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <UserCircle size={20} className="text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-100 truncate">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            {specLabel && (
              <span className="text-xs text-blue-400 font-medium">
                {specLabel}
              </span>
            )}
            {specLabel && doctor.qualification && (
              <span className="text-gray-700">·</span>
            )}
            {doctor.qualification && (
              <span className="text-xs text-gray-500">
                {doctor.qualification}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={10} className="text-gray-600" />
            <span className="text-xs text-gray-600">Applied {joinedAt}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
        {/* View docs */}
        <button
          onClick={() => onViewDocs(doctor)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-gray-400 text-xs font-medium rounded-lg hover:border-gray-600 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
        >
          <FileText size={12} />
          Docs
          {doctor.documents.length > 0 && (
            <span className="w-4 h-4 bg-blue-600/30 text-blue-400 text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {doctor.documents.length}
            </span>
          )}
        </button>

        {/* Reject */}
        <button
          onClick={() => onReject(doctor)}
          disabled={isActing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-40 transition-colors"
        >
          <XCircle size={12} />
          Reject
        </button>

        {/* Approve */}
        <button
          onClick={() => onApprove(doctor.id)}
          disabled={isActing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg hover:bg-emerald-600/30 hover:border-emerald-500/50 disabled:opacity-40 transition-colors"
        >
          {isActing ? <Spinner size="sm" /> : <CheckCircle2 size={12} />}
          Approve
        </button>
      </div>
    </div>
  );
};

// Main component

const PendingDoctorTable: React.FC = () => {
  const { data, isLoading, refetch, isFetching } = usePendingDoctors();
  const { mutate: verifyDoctor, isPending: isVerifying } = useVerifyDoctor();
  const { mutate: rejectDoctor, isPending: isRejecting } = useRejectDoctor();

  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<PendingDoctorResponse | null>(null);
  const [docsTarget, setDocsTarget] = useState<PendingDoctorResponse | null>(
    null,
  );

  const doctors = data?.data ?? [];

  const handleApprove = (doctorId: string) => {
    setActingId(doctorId);
    verifyDoctor(doctorId, {
      onSuccess: () => {
        toast.success("Doctor approved and account activated.");
        setActingId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingId(null);
      },
    });
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) return;
    setActingId(rejectTarget.id);
    rejectDoctor(
      { doctorId: rejectTarget.id, reason },
      {
        onSuccess: () => {
          toast.success("Doctor verification rejected.");
          setRejectTarget(null);
          setActingId(null);
        },
        onError: (err: AppError) => {
          toast.error(err.message);
          setActingId(null);
        },
      },
    );
  };

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Pending Verifications
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Review and verify doctor credentials
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-700 text-gray-400 text-xs font-medium rounded-lg hover:border-gray-600 hover:text-gray-200 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-500 text-sm">
          <Spinner size="md" />
          Loading pending verifications...
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-xl border border-gray-800/40 bg-gray-900/20">
          <div className="w-14 h-14 rounded-2xl bg-gray-800/60 flex items-center justify-center">
            <Stethoscope size={24} className="text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-400">
            No pending verifications
          </p>
          <p className="text-xs text-gray-600">
            All doctor applications have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {doctors.map((doctor) => (
            <DoctorRow
              key={doctor.id}
              doctor={doctor}
              onViewDocs={setDocsTarget}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              isActing={(isVerifying || isRejecting) && actingId === doctor.id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {rejectTarget && (
        <RejectModal
          doctorName={`${rejectTarget.firstName} ${rejectTarget.lastName}`}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
          isPending={isRejecting}
        />
      )}

      {docsTarget && (
        <DoctorDocumentModal
          doctor={docsTarget}
          onClose={() => setDocsTarget(null)}
        />
      )}
    </>
  );
};

export default PendingDoctorTable;
