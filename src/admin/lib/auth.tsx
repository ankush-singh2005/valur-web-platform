import * as React from "react";
import { Navigate } from "react-router";
import { adminUsers } from "../data/mock";
import { CURRENT_ADMIN } from "./constants";

// Lightweight MOCK auth for the console demo.
// - Step 1 (login): validates the work email against the known admin accounts
//   (any non-empty password). Suspended accounts are refused.
// - Step 2 (2FA): any 6-digit code completes sign-in.
// - The signed-in flag persists in localStorage so reloads stay authenticated.
// This is a front-end gate for the prototype, not real authentication.

const KEY = "valur.admin.authed";

type SessionUser = { name: string; email: string; roleLabel: string };

type AuthValue = {
  authed: boolean;
  awaiting: { email: string } | null;
  user: SessionUser;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  verify: (code: string) => boolean;
  logout: () => void;
};

const AuthCtx = React.createContext<AuthValue | null>(null);

const DEFAULT_USER: SessionUser = {
  name: CURRENT_ADMIN.name,
  email: CURRENT_ADMIN.email,
  roleLabel: CURRENT_ADMIN.roleLabel,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = React.useState<boolean>(() => {
    try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
  });
  const [awaiting, setAwaiting] = React.useState<{ email: string } | null>(null);
  const [user, setUser] = React.useState<SessionUser>(DEFAULT_USER);

  const login: AuthValue["login"] = (email, password) => {
    const e = email.trim().toLowerCase();
    const match = adminUsers.find((u) => u.email.toLowerCase() === e);
    if (!match || password.trim().length < 1) {
      return { ok: false, error: "Email or password not recognised." };
    }
    if (match.status === "Suspended") {
      return { ok: false, error: "This account has been suspended. Contact a Super Admin." };
    }
    setUser({ name: match.name, email: match.email, roleLabel: match.role });
    setAwaiting({ email: match.email });
    return { ok: true };
  };

  const verify: AuthValue["verify"] = (code) => {
    if (!awaiting || !/^\d{6}$/.test(code)) return false;
    setAuthed(true);
    setAwaiting(null);
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    return true;
  };

  const logout = () => {
    setAuthed(false);
    setAwaiting(null);
    setUser(DEFAULT_USER);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  };

  return (
    <AuthCtx.Provider value={{ authed, awaiting, user, login, verify, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthValue {
  const v = React.useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
}

/** Gate for the console shell - bounces unauthenticated visitors to login. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authed } = useAuth();
  if (!authed) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
