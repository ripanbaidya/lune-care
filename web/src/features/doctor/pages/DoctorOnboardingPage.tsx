import { Stethoscope } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "../../../routes/routePaths";
import { useAccountStatusPoller } from "../../../shared/hooks/useAccountStatus";
import { AppError } from "../../../shared/utils/errorParser";
import { useAuthStore } from "../../../store/authStore";
import { ACCOUNT_STATUS } from "../../auth/types/auth.types";
import {
  useCompleteOnboarding,
  useUploadDocument,
} from "../hooks/useDoctorProfile";
import {
  type DoctorGender,
  type DocumentType,
  type OnboardingRequest,
  type Specialization,
} from "../types/doctor.types";

import OnboardingStep1Form, {
  type Step1Form,
} from "../components/onboarding/OnboardingStep1Form";
import OnboardingStep2Upload from "../components/onboarding/OnboardingStep2Upload";
import OnboardingStep3Review from "../components/onboarding/OnboardingStep3Review";
import OnboardingStepIndicator from "../components/onboarding/OnboardingStepIndicator";

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, label: "Professional Info" },
  { num: 2, label: "Upload Document" },
  { num: 3, label: "Under Review" },
];

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

  // Step 1: Professional Info
  const { mutate: completeOnboarding, isPending: isOnboarding } =
    useCompleteOnboarding();
  const [form, setForm] = useState<Step1Form>(EMPTY_STEP1);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 2: Document Upload
  const { mutate: uploadDocument, isPending: isUploading } =
    useUploadDocument();
  const [selectedDocType, setSelectedDocType] =
    useState<DocumentType>("MEDICAL_LICENSE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 3: Status polling
  // Guard: hook only polls when user.status === PENDING_VERIFICATION.
  // We don't set PENDING_VERIFICATION until the doctor reaches step 3,
  // so the poller stays dormant on steps 1 and 2.
  useAccountStatusPoller();

  const navigate = useNavigate();

  // Handlers: Step 1

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
        // Do NOT set PENDING_VERIFICATION here — poller must not fire on step 2.
        setStep(2);
      },
      onError: (err: AppError) => {
        if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
        else setFormError(err.message);
      },
    });
  };

  // Handlers: Step 2

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    // Reset so same file can be re-selected after removal
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
          updateUser({ status: ACCOUNT_STATUS.PENDING_VERIFICATION });
          setTimeout(() => setStep(3), 1200);
        },
        onError: (err: AppError) => setUploadError(err.message),
      },
    );
  };

  const handleSkipDocument = () => {
    updateUser({ status: ACCOUNT_STATUS.PENDING_VERIFICATION });
    setTimeout(() => setStep(3), 1200);
  };

  // Step 3
  const step3Status =
    user?.status === ACCOUNT_STATUS.ACTIVE
      ? "approved"
      : user?.status === ACCOUNT_STATUS.ONBOARDING
        ? "rejected"
        : "pending";

  // Render

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">LuneCare</span>
            <p className="text-xs text-blue-400 font-medium leading-none">
              Doctor Portal
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <OnboardingStepIndicator steps={STEPS} currentStep={step} />

        {/* Step Panels */}
        {step === 1 && (
          <OnboardingStep1Form
            form={form}
            formError={formError}
            fieldErrors={fieldErrors}
            isPending={isOnboarding}
            onChange={handleChange}
            onSubmit={handleStep1Submit}
          />
        )}

        {step === 2 && (
          <OnboardingStep2Upload
            selectedDocType={selectedDocType}
            selectedFile={selectedFile}
            uploadError={uploadError}
            isUploading={isUploading}
            onDocTypeChange={setSelectedDocType}
            onFileChange={handleFileChange}
            onFileRemove={() => setSelectedFile(null)}
            onSubmit={handleStep2Submit}
            onSkip={handleSkipDocument}
          />
        )}

        {step === 3 && (
          <OnboardingStep3Review
            status={step3Status}
            onGoToDashboard={() =>
              navigate(ROUTES.doctorDashboard, { replace: true })
            }
            onResubmit={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorOnboardingPage;
