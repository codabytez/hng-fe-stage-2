"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";

export function SignUpForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpValues) {
    const { error } = await authClient.signUp.email(values);

    if (error) {
      setError("root", {
        message: error.message ?? "Sign up failed. Please try again.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started managing your invoices
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register("name")}
              aria-invalid={!!errors.name}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent aria-invalid:border-red-500 aria-invalid:focus:ring-red-400 transition"
              placeholder="Jane Doe"
            />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent aria-invalid:border-red-500 aria-invalid:focus:ring-red-400 transition"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              aria-invalid={!!errors.password}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent aria-invalid:border-red-500 aria-invalid:focus:ring-red-400 transition"
              placeholder="Min. 8 characters"
            />
            {errors.password && (
              <p role="alert" className="mt-1.5 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p role="alert" className="text-sm text-red-500">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
