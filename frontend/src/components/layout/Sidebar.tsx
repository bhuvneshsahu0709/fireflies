"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home, Mic2, Activity, Upload, Zap, BarChart2,
  Headphones, Sparkles, Users, TrendingUp, Settings,
  MoreHorizontal, Lock, X, Plus, Bot, Moon, Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Bot, label: "AskFred", href: "/askfred", soon: true },
  { icon: Mic2, label: "Meetings", href: "/meetings" },
  { icon: Activity, label: "Meeting Status", href: "/meeting-status", soon: true },
  { icon: Upload, label: "Uploads", href: "/uploads", soon: true },
  { icon: Zap, label: "Integrations", href: "/integrations", soon: true },
  { icon: BarChart2, label: "Analytics", href: "/analytics", soon: true },
  { icon: Headphones, label: "Voice Agents", href: "/voice-agents", soon: true, badge: "NEW" },
  { icon: Sparkles, label: "AI Skills", href: "/ai-skills", soon: true },
  { icon: Users, label: "Team", href: "/team", soon: true },
  { icon: TrendingUp, label: "Upgrade", href: "/upgrade", soon: true },
];

const BOTTOM_ITEMS = [
  { icon: Settings, label: "Settings", href: "/settings", soon: true },
  { icon: MoreHorizontal, label: "More", href: "/more", soon: true },
  { icon: Lock, label: "Your Privacy Choices", href: "/privacy", soon: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [inviteDismissed, setInviteDismissed] = useState(false);

  // Initialize from localStorage and apply class
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/meetings") return pathname === "/meetings" || (pathname.startsWith("/meetings/") && !pathname.startsWith("/meetings/new"));
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex flex-col h-full w-[220px] shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#e74c8b,#f97316)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 1C8.5 1 6 3.5 6 7c0 2.5 1.5 4.5 3.5 5.5C7 13.5 5 15.5 5 18c0 3 2.5 5 5.5 5h3c3 0 5.5-2 5.5-5 0-2.5-2-4.5-4.5-5.5C16.5 11.5 18 9.5 18 7c0-3.5-2.5-6-6-6z"/>
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">fireflies.ai</span>
        </div>
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, href, soon, badge }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={soon && href !== "/meetings" && href !== "/" ? "#" : href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                    active
                      ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <Icon
                    size={17}
                    className={cn(active ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-500")}
                  />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

        <ul className="space-y-0.5">
          {BOTTOM_ITEMS.map(({ icon: Icon, label, href }) => (
            <li key={href}>
              <Link
                href="#"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Icon size={17} className="text-gray-400 dark:text-gray-600" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Invite banner */}
      {!inviteDismissed && (
        <div className="mx-3 mb-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 p-3 relative">
          <button
            onClick={() => setInviteDismissed(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </button>
          <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-tight mb-2.5">
            Invite coworkers to your Fireflies team
          </p>
          <button className="flex items-center justify-center gap-1.5 w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors">
            <Plus size={13} />
            Create Team
          </button>
        </div>
      )}
    </aside>
  );
}
