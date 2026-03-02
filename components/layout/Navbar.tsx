"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface NavbarProps {
  user: { name: string; phone: string };
  onMenuToggle: () => void;
}

export default function Navbar({ user, onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [showUser, setShowUser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowUser(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-6"
      style={{
        background: "rgba(10,0,16,0.9)",
        borderBottom: "1px solid rgba(139,92,246,0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-purple-900/30"
        >
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Flower Shop Logo"
              fill
              className="object-contain drop-shadow-[0_0_6px_rgba(216,180,254,0.4)]"
              priority
            />
          </div>
          <span className="font-bold text-white text-lg hidden sm:block">
            Flower Shop
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-900/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold text-white ring-2 ring-purple-500/40">
              {user.name[0].toUpperCase()}
            </div>
            <span className="text-white text-sm hidden sm:block max-w-[120px] truncate">
              {user.name}
            </span>
            {/* Chevron indicator */}
            <svg
              className={`w-3.5 h-3.5 text-purple-400 transition-transform duration-200 hidden sm:block ${showUser ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showUser && (
            <div
              className="absolute right-0 mt-2 w-52 z-[999] rounded-xl overflow-hidden"
              style={{
                background: "rgb(18, 6, 30)",
                border: "1px solid rgba(139,92,246,0.5)",
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.15), 0 4px 16px rgba(139,92,246,0.2)",
              }}
            >
              {/* Header */}
              <div
                className="px-4 py-3"
                style={{
                  borderBottom: "1px solid rgba(139,92,246,0.25)",
                  background: "rgba(139,92,246,0.08)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {user.name}
                    </p>
                    <p className="text-purple-400 text-xs truncate">
                      {user.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1.5">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
