// client/src/components/auth/LoginForm.tsx
import React from "react";
import PasswordlessAuthCard from "./PasswordlessAuthCard";

export interface LoginFormProps {
  onSuccess?: (user: any) => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo = "/" }: LoginFormProps) {
  return (
    <PasswordlessAuthCard
      mode="login"
      onSuccess={onSuccess}
      redirectTo={redirectTo}
    />
  );
}
