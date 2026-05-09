import React from "react";
import { CheckCircle2 } from "lucide-react";

interface StepMeta {
  num: number;
  label: string;
}

interface OnboardingStepIndicatorProps {
  steps: StepMeta[];
  currentStep: number;
}

/**
 * Pure presenter — renders step dots, labels, and connectors.
 * No state, no side effects.
 */
const OnboardingStepIndicator: React.FC<OnboardingStepIndicatorProps> = ({
  steps,
  currentStep,
}) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((s, idx) => (
      <React.Fragment key={s.num}>
        <div className="flex items-center gap-1.5">
          {/* Step circle */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep > s.num
                ? "bg-blue-600 text-white"
                : currentStep === s.num
                  ? "bg-blue-600 text-white ring-2 ring-blue-400/40"
                  : "bg-white/10 text-gray-500 border border-white/10"
            }`}
          >
            {currentStep > s.num ? <CheckCircle2 size={14} /> : s.num}
          </div>

          {/* Label — hidden on mobile */}
          <span
            className={`text-xs font-medium hidden sm:inline transition-colors ${
              currentStep === s.num
                ? "text-blue-300"
                : currentStep > s.num
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            {s.label}
          </span>
        </div>

        {/* Connector line */}
        {idx < steps.length - 1 && (
          <div
            className={`h-px w-8 sm:w-12 transition-colors ${
              currentStep > s.num ? "bg-blue-500" : "bg-white/10"
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default OnboardingStepIndicator;
