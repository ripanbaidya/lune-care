import { useState } from "react";
import { useAppMutation } from "../../../shared/hooks/useAppMutation";
import { authService } from "../services/authService";
import type { ForgotPasswordRequest, PasswordResetResponse } from "../types/auth.types";
import { AppError } from "../../../shared/utils/errorParser";
import type { ResponseWrapper } from "../../../types/api.types";

export function useForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [resetResponse, setResetResponse] =
    useState<PasswordResetResponse | null>(null);

  const { mutate, isPending } = useAppMutation<
    ResponseWrapper<PasswordResetResponse>,
    ForgotPasswordRequest
  >({
    mutationFn: (data) => authService.forgotPassword(data),
    onSuccess: (res) => {
      setResetResponse(res.data);
    },
    onError: (error: AppError) => {
      setFieldErrors({});
      setFormError(error.message);
      if (error.isValidation) {
        setFieldErrors(error.toFieldErrorMap());
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    mutate({ phoneNumber });
  };

  return {
    phoneNumber,
    setPhoneNumber,
    fieldErrors,
    formError,
    isPending,
    resetResponse,
    handleSubmit,
  };
}
