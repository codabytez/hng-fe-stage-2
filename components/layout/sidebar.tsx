"use client";

import { useTheme } from "@/providers/theme-provider";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Moon, Sun, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function Sidebar() {
  const { theme, toggle } = useTheme();
  const user = useQuery(api.auth.getCurrentUser);
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <>
      {logoutOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div
            aria-hidden="true"
            onClick={() => setLogoutOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-120 rounded-[8px] bg-white p-12 dark:bg-dark-element"
          >
            <h2 className="mb-3 text-2xl font-bold text-ink dark:text-white">
              Log Out
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-muted">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLogoutOpen(false)}
                disabled={loggingOut}
                className="rounded-full bg-light-bg px-6 py-4 text-sm font-bold text-muted-light transition-colors hover:bg-lavender disabled:opacity-60 dark:bg-dark-surface dark:hover:bg-dark-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full bg-danger px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-danger-hover disabled:opacity-60"
              >
                {loggingOut ? "Logging out…" : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-25.75 bg-dark-surface rounded-r-[20px] flex-col items-center z-50 overflow-hidden">
        {/* Logo */}
        <div className="w-full aspect-square bg-primary rounded-br-[20px] flex items-center justify-center shrink-0">
          <LogoIcon />
        </div>

        {/* Bottom controls */}
        <div className="mt-auto w-full flex flex-col items-center">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-4 text-muted hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setLogoutOpen(true)}
            aria-label="Log out"
            className="p-4 text-muted hover:text-danger transition-colors"
          >
            <LogOut size={20} />
          </button>

          <div className="w-full h-px bg-[#494E6E] my-2" />

          <div className="p-4">
            <div className="w-10 h-10 rounded-full bg-dark-element overflow-hidden">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary to-primary-hover" />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-18 bg-dark-surface z-40 flex items-center justify-between">
        {/* Logo */}
        <div className="h-full aspect-square bg-primary rounded-br-[20px] flex items-center justify-center">
          <LogoIcon />
        </div>

        <div className="flex items-center gap-4 pr-4">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="text-muted hover:text-white transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setLogoutOpen(true)}
            aria-label="Log out"
            className="text-muted hover:text-danger transition-colors"
          >
            <LogOut size={20} />
          </button>

          <div className="w-px h-8 bg-[#494E6E]" />

          <div className="w-8 h-8 rounded-full bg-dark-element overflow-hidden">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Avatar"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary to-primary-hover" />
            )}
          </div>
        </div>
      </header>
    </>
  );
}

function LogoIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 103 103"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H83C94.0457 0 103 8.9543 103 20V83C103 94.0457 94.0457 103 83 103H0V0Z"
        fill="#7C5DFA"
      />
      <mask
        id="mask0_1_34"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="103"
        height="103"
      >
        <path
          d="M0 0H83C94.0457 0 103 8.9543 103 20V83C103 94.0457 94.0457 103 83 103H0V0Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_1_34)">
        <path
          d="M103 52H20C8.95431 52 0 60.9543 0 72V135C0 146.046 8.95431 155 20 155H103V52Z"
          fill="#9277FF"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M42.6942 33.2922L52 51.9999L61.3058 33.2922C67.6645 36.6407 72 43.314 72 50.9999C72 62.0456 63.0457 70.9999 52 70.9999C40.9543 70.9999 32 62.0456 32 50.9999C32 43.314 36.3355 36.6407 42.6942 33.2922Z"
        fill="white"
      />
    </svg>
  );
}
