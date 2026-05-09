import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FieldErrorMessage } from "../../../shared/components/ui/FieldErrorMessage";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showStrength?: boolean;
}

export default function PasswordInput({
  label,
  name,
  value,
  placeholder,
  error,
  onChange,
  showStrength,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && <PasswordStrengthIndicator password={value} />}
      <FieldErrorMessage message={error} />
    </div>
  );
}
