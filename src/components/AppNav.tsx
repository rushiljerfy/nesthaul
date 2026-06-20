"use client";

import { Compass, LayoutDashboard, UserRound } from "lucide-react";
import type { AppPage } from "@/lib/types";

interface AppNavProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onLogout?: () => void;
  userEmail?: string | null;
}

const navItems: { page: AppPage; icon: React.ReactNode }[] = [
  { page: "Dashboard", icon: <LayoutDashboard aria-hidden="true" size={18} /> },
  { page: "Explore", icon: <Compass aria-hidden="true" size={18} /> },
  { page: "Profile", icon: <UserRound aria-hidden="true" size={18} /> }
];

export function AppNav({ activePage, onNavigate, onLogout, userEmail }: AppNavProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">NestHaul</p>
        <strong>Move-in planner</strong>
      </div>
      <nav className="app-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            aria-current={activePage === item.page ? "page" : undefined}
            key={item.page}
            type="button"
            onClick={() => onNavigate(item.page)}
          >
            {item.icon}
            {item.page}
          </button>
        ))}
      </nav>
      <div className="account-actions" aria-label="Account">
        {userEmail ? (
          <>
            <span>{userEmail}</span>
            <button type="button" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <a href="/login">Log in</a>
            <a href="/signup">Sign up</a>
          </>
        )}
      </div>
    </header>
  );
}
