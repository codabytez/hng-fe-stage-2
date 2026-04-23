"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInValues) {
    const { error } = await authClient.signIn.email(values);
    if (error) {
      setError("root", {
        message: error.message ?? "Sign in failed. Please try again.",
      });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 flex flex-col items-center gap-4">
        <LogoMark />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ink dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to manage your invoices
          </p>
        </div>
      </div>

      <div className="rounded-[8px] bg-white px-8 py-10 shadow-sm dark:bg-dark-surface">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
          noValidate
        >
          <Field label="Email address" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              className={inputClass(!!errors.email)}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className={cn(inputClass(!!errors.password), "pr-12")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {errors.root && (
            <p role="alert" className="text-xs text-danger">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-4 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          className={cn(
            "text-xs",
            error ? "text-danger" : "text-muted dark:text-muted-light"
          )}
        >
          {label}
        </label>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-sm border px-5 py-4 text-sm font-bold",
    "text-ink dark:text-white bg-white dark:bg-dark-element",
    "transition-colors focus:outline-none focus:border-primary",
    hasError ? "border-danger" : "border-lavender dark:border-dark-element"
  );
}
