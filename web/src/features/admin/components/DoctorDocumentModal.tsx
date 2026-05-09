import React from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import type {
  DoctorDocumentResponse,
  PendingDoctorResponse,
} from "../types/admin.types";
import { DOCUMENT_TYPE_LABELS } from "../types/admin.types";

interface Props {
  doctor: PendingDoctorResponse;
  onClose: () => void;
}

const DocumentRow: React.FC<{ doc: DoctorDocumentResponse }> = ({ doc }) => {
  const label = DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType;
  const uploadedAt = new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800/50 group hover:border-gray-700/70 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FileText size={14} className="text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">{label}</p>
          <p className="text-xs text-gray-500">Uploaded {uploadedAt}</p>
        </div>
      </div>
      <a
        href={doc.documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-600/30 transition-colors flex-shrink-0 ml-3"
      >
        View <ExternalLink size={11} />
      </a>
    </div>
  );
};

const DoctorDocumentModal: React.FC<Props> = ({ doctor, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="w-full max-w-lg rounded-2xl border border-gray-800/60 bg-gradient-to-b from-gray-900 to-black shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800/50">
        <div>
          <p className="text-sm font-semibold text-white">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{doctor.phoneNumber}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
        {doctor.documents.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2">
            <FileText size={28} className="text-gray-700" />
            <p className="text-sm text-gray-500">No documents uploaded yet</p>
          </div>
        ) : (
          doctor.documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={onClose}
          className="w-full py-2.5 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-800/50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default DoctorDocumentModal;
