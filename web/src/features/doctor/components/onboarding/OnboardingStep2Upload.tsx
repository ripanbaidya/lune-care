import React, { useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { FormError } from "../../../../shared/components/ui/FormError";
import Spinner from "../../../../shared/components/ui/Spinner";
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
} from "../../types/doctor.types";

interface OnboardingStep2UploadProps {
  selectedDocType: DocumentType;
  selectedFile: File | null;
  uploadError: string | null;
  isUploading: boolean;
  onDocTypeChange: (docType: DocumentType) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  onSubmit: () => void;
  onSkip: () => void;
}

/**
 * Pure presenter for step 2 — document upload.
 * fileRef is owned here since it's purely a UI concern (triggering the hidden input).
 * All data flow goes through props/callbacks.
 */
const OnboardingStep2Upload: React.FC<OnboardingStep2UploadProps> = ({
  selectedDocType,
  selectedFile,
  uploadError,
  isUploading,
  onDocTypeChange,
  onFileChange,
  onFileRemove,
  onSubmit,
  onSkip,
}) => {
  // fileRef lives here — it's a UI ref, not state. The parent doesn't need it.
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-1">
        Upload Verification Document
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        Upload at least one document for verification. This helps us verify your
        credentials.
      </p>

      <FormError error={uploadError} className="mb-4" />

      {/* Document Type */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Document Type
        </label>
        <select
          value={selectedDocType}
          onChange={(e) => onDocTypeChange(e.target.value as DocumentType)}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        >
          {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((dt) => (
            <option key={dt} value={dt} className="bg-gray-800 text-white">
              {DOCUMENT_TYPE_LABELS[dt]}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
          selectedFile
            ? "border-blue-500/50 bg-blue-500/5"
            : "border-white/10 bg-white/5 hover:border-blue-500/40 hover:bg-blue-500/5"
        }`}
      >
        {selectedFile ? (
          <>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <FileText size={22} className="text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-100">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent re-opening file picker
                onFileRemove();
              }}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <X size={12} /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
              <Upload size={22} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">
                Click to upload file
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                PDF, JPG, PNG supported
              </p>
            </div>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={onSkip}
          className="flex-1 px-4 py-2.5 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-800/50"
        >
          Skip for now
        </button>
        <button
          onClick={onSubmit}
          disabled={isUploading || !selectedFile}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isUploading ? <Spinner size="sm" /> : <Upload size={14} />}
          Upload & Continue
        </button>
      </div>
    </div>
  );
};

export default OnboardingStep2Upload;
