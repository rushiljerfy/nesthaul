"use client";

import type { AppPage } from "@/lib/types";

interface AppNavProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onLogout?: () => void;
  userEmail?: string | null;
}

const navItems: AppPage[] = ["Explore", "Dashboard", "Profile"];

export function AppNav({ activePage, onNavigate, onLogout, userEmail }: AppNavProps) {
  return (
    <header className="app-header">
      <button className="wordmark wordmark-button" type="button" onClick={() => onNavigate("Dashboard")}>
        NestHaul
      </button>
      <nav className="app-nav" aria-label="Main navigation">
        {navItems.map((page) => (
          <button
            aria-current={activePage === page ? "page" : undefined}
            key={page}
            type="button"
            onClick={() => onNavigate(page)}
          >
            {page}
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
