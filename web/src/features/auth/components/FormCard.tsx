import type { ReactNode } from "react";
import { FormError } from "../../../shared/components/ui/FormError";

interface FormCardProps {
  title: string;
  subtitle: string;
  formError?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function FormCard({
  title,
  subtitle,
  formError,
  children,
  footer,
}: FormCardProps) {
  return (
    <div className="bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
      </div>

      <FormError error={formError} />

      {children}

      {footer && footer}
    </div>
  );
}
