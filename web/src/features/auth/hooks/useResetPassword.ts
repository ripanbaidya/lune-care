import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppMutation } from "../../../shared/hooks/useAppMutation";
import { ROUTES } from "../../../routes/routePaths";
import { authService } from "../services/authService";
import type { ResetPasswordRequest } from "../types/auth.types";
import { AppError } from "../../../shared/utils/errorParser";
import type { ResponseWrapper } from "../../../types/api.types";

export function useResetPassword(initialToken = "") {
  const navigate = useNavigate();
  const [resetToken, setResetToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending } = useAppMutation<ResponseWrapper<void>, ResetPasswordRequest>({
    mutationFn: (data) => authService.resetPassword(data),
    onSuccess: () => {
      navigate(ROUTES.login, {
        replace: true,
        state: { passwordResetSuccess: true },
      });
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

    if (newPassword !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Passwords do not match",
      });
      return;
    }

    mutate({ resetToken, newPassword });
  };

  return {
    resetToken,
    setResetToken,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    fieldErrors,
    formError,
    isPending,
    handleSubmit,
  };
}
