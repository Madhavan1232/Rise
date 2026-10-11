// client/src/components/auth/SignupForm.tsx
import React from "react";
import PasswordlessAuthCard from "./PasswordlessAuthCard";

export interface SignupFormProps {
  onSuccess?: (user: any) => void;
  redirectTo?: string;
}

export default function SignupForm({ onSuccess, redirectTo = "/" }: SignupFormProps) {
  return (
    <PasswordlessAuthCard
      mode="signup"
      onSuccess={onSuccess}
      redirectTo={redirectTo}
    />
  );
}
