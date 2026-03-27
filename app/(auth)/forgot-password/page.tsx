"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/schemas";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await authApi.forgotPassword(data.email);
    setSubmittedEmail(data.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-up text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <CheckCircle size={28} className="text-primary-400" />
          </div>
        </div>
        <h1 className="font-display font-bold text-2xl text-text-primary mb-3 tracking-tight">
          Check your inbox
        </h1>
        <p className="text-text-secondary text-sm mb-2 leading-relaxed">
          If an account exists for <span className="text-text-primary font-medium">{submittedEmail}</span>,
          we&apos;ve sent a password reset link.
        </p>
        <p className="text-text-tertiary text-xs mb-8 font-body">
          Didn&apos;t receive it? Check your spam folder.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors font-body"
          >
            <ArrowLeft size={13} /> Back to sign in
          </Link>
        </div>

        <h1 className="font-display font-bold text-3xl text-text-primary mb-2 tracking-tight">
          Reset password
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed">
          Enter the email address associated with your account and we&apos;ll send a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@clinic.com"
          autoComplete="email"
          autoFocus
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          loading={isSubmitting}
          fullWidth
          size="lg"
          className="font-display font-bold tracking-wide"
        >
          Send reset link
          <ArrowRight size={16} />
        </Button>
      </form>
    </div>
  );
}
