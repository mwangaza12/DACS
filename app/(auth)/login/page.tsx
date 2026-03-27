"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight,
} from "lucide-react";
import { loginSchema, LoginFormData } from "@/lib/schemas";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        try {
            const res = await authApi.login(data);
            const { user, profile, accessToken, refreshToken } = res.data.data;
            setAuth({ user, profile, accessToken, refreshToken });
            router.push("/dashboard");
        } catch (err: unknown) {
        const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Login failed. Please check your credentials.";
        setServerError(message);
        }
    };

    return (
        <div className="animate-fade-up">
        <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-3xl text-text-primary mb-2 tracking-tight">
            Welcome back
            </h1>
            <p className="text-text-secondary text-sm">
            Sign in to your DACS account
            </p>
        </div>

        {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-danger/30 flex items-start gap-3 animate-fade-in">
            <div className="w-4 h-4 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-danger" />
            </div>
            <p className="text-sm text-danger/90 font-body">{serverError}</p>
            </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
            label="Email address"
            type="email"
            placeholder="you@clinic.com"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register("email")}
            />

            <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            leftIcon={<Lock size={15} />}
            error={errors.password?.message}
            rightElement={
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                tabIndex={-1}
                >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            }
            {...register("password")}
            />

            <div className="flex justify-end">
            <Link
                href="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
                Forgot password?
            </Link>
            </div>

            <Button
            type="submit"
            loading={isSubmitting}
            className="w-full font-display font-bold"
            >
            Sign in <ArrowRight size={15} />
            </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-7">
            Don&apos;t have an account?{" "}
            <Link
            href="/register"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
            Create account
            </Link>
        </p>
        </div>
    );
}