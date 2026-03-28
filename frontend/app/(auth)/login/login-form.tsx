"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { loginSchema, LoginFormData } from "@/lib/schemas";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { setAuth }  = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(data);
      const { user, profile, accessToken, refreshToken } = res.data.data;
      setAuth({ user, profile, accessToken, refreshToken });
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/") ? from : "/dashboard");
    } catch (err: unknown) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Invalid email or password."
      );
    }
  };

  return (
    <div className="animate-fade-up max-w-md mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="font-display font-bold text-3xl text-foreground mb-2 tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your DACS account to continue
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 animate-fade-in">
          <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-muted-foreground">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@clinic.com"
              autoComplete="email"
              className={cn(
                "pl-9",
                errors.email && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className={cn(
                "pl-9 pr-9",
                errors.password && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-end -mt-1">
          <Link 
            href="/forgot-password" 
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full mt-2 font-display font-bold"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New to DACS?{" "}
        <Link 
          href="/register" 
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}