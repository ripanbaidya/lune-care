import React, { useRef, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Upload,
  FileText,
  Stethoscope,
  Clock,
  X,
} from "lucide-react";
import {
  useCompleteOnboarding,
  useUploadDocument,
} from "../hooks/useDoctorProfile";
import { FormError } from "../../../shared/components/ui/FormError";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../shared/components/ui/Spinner";
import {
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  DOCUMENT_TYPE_LABELS,
  type DoctorGender,
  type Specialization,
  type DocumentType,
  type OnboardingRequest,
} from "../types/doctor.types";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";
import { ACCOUNT_STATUS } from "../../auth/auth.types";
import { ROUTES } from "../../../routes/routePaths";
import { useAccountStatusPoller } from "../../../shared/hooks/useAccountStatus";

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, label: "Professional Info" },
  { num: 2, label: "Upload Document" },
  { num: 3, label: "Under Review" },
];

interface Step1Form {
  email: string;
  gender: DoctorGender | "";
  dateOfBirth: string;
  specialization: Specialization | "";
  qualification: string;
  yearsOfExperience: string;
  bio: string;
  languagesSpoken: string;
}

const EMPTY_STEP1: Step1Form = {
  email: "",
  gender: "",
  dateOfBirth: "",
  specialization: "",
  qualification: "",
  yearsOfExperience: "",
  bio: "",
  languagesSpoken: "",
};

const DoctorOnboardingPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  // Derive initial step from persisted status so page refresh lands correctly:
  //   PENDING_VERIFICATION → step 3 (waiting for approval)
  //   ONBOARDING / anything else → step 1
  const [step, setStep] = useState<Step>(() =>
    user?.status === ACCOUNT_STATUS.PENDING_VERIFICATION ? 3 : 1,
  );

  // Step 1 — Professional Info
  const { mutate: completeOnboarding, isPending: isOnboarding } =
    useCompleteOnboarding();
  const [form, setForm] = useState<Step1Form>(EMPTY_STEP1);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 2 — Document Upload
  const { mutate: uploadDocument, isPending: isUploading } =
    useUploadDocument();
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>("MEDICAL_LICENSE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 — Status polling.
  // The hook internally guards: it only polls when user.status === PENDING_VERIFICATION.
  // However we have a secondary guard here: we only want it active on step 3.
  // We achieve this by NOT updating user.status to PENDING_VERIFICATION until
  // the doctor reaches step 3 (see handleStep1Submit and handleStep2Submit below).
  // This means the poller stays dormant on steps 1 and 2.
  useAccountStatusPoller();

  // Handle Admin Rejection
  // If the admin rejects the application, the backend status reverts to ONBOARDING.
  // The poller will pick this up and update the store. When the store updates,
  // this effect runs, resets the step, and notifies the user.
  useEffect(() => {
    if (step === 3 && user?.status === ACCOUNT_STATUS.ONBOARDING) {
      setStep(1);
      toast.error(
        "Your application was rejected by the admin. Please review your details and submit again.",
        { duration: 8000 }
      );
    }
  }, [user?.status, step]);

  // Conditional redirect AFTER all hooks
  // If admin approves while the doctor is on this page, the poller calls
  // updateUser({ status: ACTIVE }) which triggers a re-render and hits this guard.
  if (user?.status === ACCOUNT_STATUS.ACTIVE) {
    return <Navigate to={ROUTES.doctorDashboard} replace />;
  }

  // Handlers

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.gender) errors.gender = "Gender is required";
    if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!form.specialization)
      errors.specialization = "Specialization is required";
    if (!form.qualification.trim())
      errors.qualification = "Qualification is required";
    if (!form.yearsOfExperience) {
      errors.yearsOfExperience = "Years of experience is required";
    } else if (
      Number(form.yearsOfExperience) < 0 ||
      Number(form.yearsOfExperience) > 60
    ) {
      errors.yearsOfExperience = "Must be between 0 and 60";
    }
    if (form.bio && form.bio.length > 250)
      errors.bio = "Bio cannot exceed 250 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = () => {
    setFormError(null);
    if (!validateStep1()) return;

    const payload: OnboardingRequest = {
      gender: form.gender as DoctorGender,
      dateOfBirth: form.dateOfBirth,
      specialization: form.specialization as Specialization,
      qualification: form.qualification.trim(),
      yearsOfExperience: Number(form.yearsOfExperience),
    };
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.bio.trim()) payload.bio = form.bio.trim();
    if (form.languagesSpoken.trim()) {
      payload.languagesSpoken = form.languagesSpoken
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
    }

    completeOnboarding(payload, {
      onSuccess: () => {
        toast.success("Professional details saved!");
        // Do NOT update user.status here — we move to step 2 (document upload).
        // Status is updated to PENDING_VERIFICATION only after the doctor
        // reaches step 3, so the poller does not fire prematurely on step 2.
        setStep(2);
      },
      onError: (err: AppError) => {
        if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
        else setFormError(err.message);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleStep2Submit = () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }
    setUploadError(null);
    uploadDocument(
      { documentType: selectedDocType, file: selectedFile },
      {
        onSuccess: () => {
          toast.success("Document uploaded successfully!");
          // Now persist PENDING_VERIFICATION — activates the poller on step 3
          updateUser({ status: ACCOUNT_STATUS.PENDING_VERIFICATION });
          setStep(3);
        },
        onError: (err: AppError) => setUploadError(err.message),
      },
    );
  };

  // Doctor can skip document upload — status still moves to PENDING_VERIFICATION
  const handleSkipDocument = () => {
    updateUser({ status: ACCOUNT_STATUS.PENDING_VERIFICATION });
    setStep(3);
  };

  // Render

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
          <Stethoscope size={18} className="text-white" />
        </div>
        <div>
          <span className="text-xl font-bold text-gray-900">LuneCare</span>
          <p className="text-xs text-teal-600 font-medium leading-none">
            Doctor Portal
          </p>
        </div>
      </div>

      <div className="w-full max-w-xl">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step > s.num
                      ? "bg-teal-600 text-white"
                      : step === s.num
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    step === s.num ? "text-teal-700" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 sm:w-12 ${
                    step > s.num ? "bg-teal-400" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1 — Professional Info ── */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Professional Details
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Fill in your professional information to complete onboarding.
            </p>

            <FormError error={formError} className="mb-4" />

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Professional Email{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="dr.name@hospital.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <FieldErrorMessage message={fieldErrors.email} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select gender</option>
                    {(Object.keys(GENDER_LABELS) as DoctorGender[]).map((g) => (
                      <option key={g} value={g}>
                        {GENDER_LABELS[g]}
                      </option>
                    ))}
                  </select>
                  <FieldErrorMessage message={fieldErrors.gender} />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <FieldErrorMessage message={fieldErrors.dateOfBirth} />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Specialization <span className="text-red-400">*</span>
                </label>
                <select
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Select specialization</option>
                  {(Object.keys(SPECIALIZATION_LABELS) as Specialization[]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {SPECIALIZATION_LABELS[s]}
                      </option>
                    ),
                  )}
                </select>
                <FieldErrorMessage message={fieldErrors.specialization} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Qualification */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Qualification <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. MBBS, MD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <FieldErrorMessage message={fieldErrors.qualification} />
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Years of Experience <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="yearsOfExperience"
                    type="number"
                    min={0}
                    max={60}
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <FieldErrorMessage message={fieldErrors.yearsOfExperience} />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Bio{" "}
                  <span className="text-gray-400">
                    (optional, max 250 chars)
                  </span>
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  maxLength={250}
                  placeholder="Brief professional summary..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between">
                  <FieldErrorMessage message={fieldErrors.bio} />
                  <p className="text-xs text-gray-400 mt-0.5 ml-auto">
                    {form.bio.length}/250
                  </p>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Languages Spoken{" "}
                  <span className="text-gray-400">(comma-separated)</span>
                </label>
                <input
                  name="languagesSpoken"
                  value={form.languagesSpoken}
                  onChange={handleChange}
                  placeholder="e.g. English, Hindi, Bengali"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleStep1Submit}
              disabled={isOnboarding}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
            >
              {isOnboarding ? <Spinner size="sm" /> : null}
              Continue
              {!isOnboarding && <ChevronRight size={16} />}
            </button>
          </div>
        )}

        {/* ── Step 2 — Upload Document ── */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Upload Verification Document
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Upload at least one document for verification. This helps us
              verify your credentials.
            </p>

            {uploadError && <FormError error={uploadError} className="mb-4" />}

            {/* Document Type */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) =>
                  setSelectedDocType(e.target.value as DocumentType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(
                  (dt) => (
                    <option key={dt} value={dt}>
                      {DOCUMENT_TYPE_LABELS[dt]}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* File Upload Zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-teal-400 hover:bg-teal-50/40 transition-colors"
            >
              {selectedFile ? (
                <>
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <FileText size={22} className="text-teal-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <X size={12} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload size={22} className="text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload file
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      PDF, JPG, PNG supported
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSkipDocument}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleStep2Submit}
                disabled={isUploading || !selectedFile}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
              >
                {isUploading ? <Spinner size="sm" /> : <Upload size={14} />}
                Upload & Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Under Review ── */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            {/*
                          user.status === ACTIVE branch: poller will have called navigate()
                          before this re-renders, so the Navigate guard at the top of the
                          component fires first. This branch is a safety net only.
                        */}
            {(user?.status as any) === ACCOUNT_STATUS.ACTIVE ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Account Approved!
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Your account has been approved. Redirecting to dashboard...
                </p>
                <Spinner size="md" />
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={28} className="text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Application Under Review
                </h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Your onboarding details have been submitted successfully. Our
                  admin team will review your application and credentials.
                  You'll be notified once your account is activated.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-left mb-4">
                  <p className="text-xs font-medium text-amber-800 mb-1">
                    What happens next?
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>
                      • Admin reviews your submitted documents and credentials
                    </li>
                    <li>
                      • You'll receive a notification on approval or rejection
                    </li>
                    <li>• Once approved, you can access all doctor features</li>
                  </ul>
                </div>

                {/* Live polling indicator */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
                  <Spinner size="sm" />
                  <span>Checking approval status automatically...</span>
                </div>

                <p className="text-xs text-gray-400">
                  Typical review time: 24–48 hours
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorOnboardingPage;
