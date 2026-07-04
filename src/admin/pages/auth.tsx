import * as React from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { useAuth } from "../lib/auth";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle,
  KeyRound, ArrowLeft, CheckCircle2, Send, Check,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import loginHero from "@/imports/PublicProfile/d50e3c3a12c1539e74b66c8e2404deede40d323c.png";

// ── Shared full-screen split layout ───────────────────────────────────────────
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-root grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12 bg-[var(--adm-canvas)]">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--adm-elevated)",
            border: "1px solid var(--adm-line-strong)",
            color: "var(--adm-text)",
          },
        }}
      />
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden lg:block overflow-hidden bg-[var(--adm-canvas)]">
      {/* full-bleed hero */}
      <img src={loginHero} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "38% 30%" }} />
      {/* legibility gradient (top + bottom) with a faint neon wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.10) 26%, rgba(5,5,5,0.35) 66%, rgba(5,5,5,0.92) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(90% 70% at 100% 0%, rgba(200,240,0,0.14), transparent 42%)" }}
      />

      <div className="relative h-full flex flex-col justify-between p-12">
        {/* eyebrow - top left */}
        <div>
          <p className="text-white text-sm font-semibold uppercase tracking-[0.1em] leading-relaxed">
            Built for coaches.
            <br />
            Driven by <span className="text-[var(--adm-neon)]">performance.</span>
          </p>
          <span className="block h-0.5 w-8 rounded-full bg-[var(--adm-neon)] mt-4" />
        </div>

        {/* value proposition - bottom left */}
        <div className="max-w-md">
          <h2 className="text-white text-[44px] font-semibold leading-[1.05] tracking-tight">
            One Platform.
            <br />
            Every Decision.
            <br />
            <span className="text-[var(--adm-neon)]">Stronger Teams.</span>
          </h2>
          <p className="text-white/60 text-base mt-4 leading-relaxed">
            Manage your club. Empower your coaches.
            <br />
            Elevate every player.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable labelled input
function TextField({
  label, icon: Icon, trailing, ...props
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--adm-text-3)] pointer-events-none" />
        <input
          {...props}
          className="adm-focus h-11 w-full rounded-lg bg-[var(--adm-card)] border border-[var(--adm-line)] pl-10 pr-10 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] transition-colors"
        />
        {trailing && <span className="absolute right-2.5 top-1/2 -translate-y-1/2">{trailing}</span>}
      </span>
    </label>
  );
}

function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}

// ── AD·01 Login ───────────────────────────────────────────────────────────────
export function Login() {
  const nav = useNavigate();
  const { authed, login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [error, setError] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(email);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailValid || password.length < 1) {
      setError("Email or password not recognised.");
      return;
    }
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error || "Email or password not recognised.");
      return;
    }
    setError("");
    nav("/admin/2fa");
  }

  // already signed in → skip the form
  if (authed) return <Navigate to="/admin" replace />;

  return (
    <AuthShell>
      <form onSubmit={submit} noValidate>
        <div className="mb-8">
          <span className="adm-wordmark text-2xl text-[var(--adm-text)]">VALUR</span>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--adm-text)] tracking-tight">Sign in</h1>
        <p className="text-sm text-[var(--adm-text-3)] mt-1.5 mb-7">Access the Valur Operations Console.</p>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-[var(--st-danger)]/30 bg-[var(--st-danger-soft)] px-3 py-2.5 text-sm text-[var(--adm-text)]">
            <AlertCircle className="size-4 text-[var(--st-danger)] shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <TextField
            label="Email address"
            icon={Mail}
            type="email"
            autoComplete="username"
            placeholder="name@valur.is"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
          />
          {touched && !emailValid && (
            <p className="-mt-2 text-[11px] text-[var(--st-danger)]">Enter a valid work email address.</p>
          )}

          <TextField
            label="Password"
            icon={Lock}
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            trailing={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />
        </div>

        <div className="flex justify-end mt-3 mb-6">
          <Link to="/admin/reset" className="text-xs text-[var(--adm-text-2)] hover:text-[var(--adm-neon)] transition-colors">
            Forgot password?
          </Link>
        </div>

        <PrimaryButton type="submit">
          Sign in <ArrowRight className="size-4" />
        </PrimaryButton>

        <p className="text-[11px] text-[var(--adm-text-3)] mt-7 text-center leading-relaxed">
          By signing in, you agree to our{" "}
          <button type="button" onClick={() => toast("Terms of Service", { description: "Not wired up in this demo." })} className="text-[11px] font-normal text-[var(--adm-neon)] hover:underline">Terms of Service</button>
          {" "}and{" "}
          <button type="button" onClick={() => toast("Privacy Policy", { description: "Not wired up in this demo." })} className="text-[11px] font-normal text-[var(--adm-neon)] hover:underline">Privacy Policy</button>.
        </p>
        <p className="text-[11px] text-[var(--adm-text-3)] mt-3 text-center opacity-70">
          Demo · sign in as <span className="text-[var(--adm-neon)]">sigrun@valur.is</span> (any password), then any 6-digit code.
        </p>
      </form>
    </AuthShell>
  );
}

// ── AD·02 Two-Factor ──────────────────────────────────────────────────────────
const CODE_LEN = 6;

export function TwoFactor() {
  const nav = useNavigate();
  const { authed, awaiting, verify: doVerify } = useAuth();
  const [digits, setDigits] = React.useState<string[]>(Array(CODE_LEN).fill(""));
  const [trust, setTrust] = React.useState(false);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const complete = code.length === CODE_LEN;

  function setAt(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    setDigits((prev) => {
      const next = [...prev];
      if (clean.length > 1) {
        // paste - distribute across boxes from i
        for (let k = 0; k < clean.length && i + k < CODE_LEN; k++) next[i + k] = clean[k];
        const last = Math.min(i + clean.length, CODE_LEN - 1);
        refs.current[last]?.focus();
      } else {
        next[i] = clean;
        if (clean && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
      }
      return next;
    });
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setDigits((prev) => { const n = [...prev]; n[i - 1] = ""; return n; });
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < CODE_LEN - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (complete && doVerify(code)) nav("/admin");
  }

  // must come through the login step first
  if (authed) return <Navigate to="/admin" replace />;
  if (!awaiting) return <Navigate to="/admin/login" replace />;

  return (
    <AuthShell>
      <form onSubmit={verify}>
        <div className="mb-8">
          <span className="adm-wordmark text-2xl text-[var(--adm-text)]">VALUR</span>
        </div>

        <div className="mb-7">
          <span className="grid place-items-center size-11 rounded-xl bg-[var(--adm-neon-soft)] text-[var(--adm-neon)] mb-5">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold text-[var(--adm-text)] tracking-tight">Two-factor verification</h1>
          <p className="text-sm text-[var(--adm-text-3)] mt-1.5">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <div className="flex gap-2 justify-between mb-6" onPaste={(e) => { e.preventDefault(); setAt(0, e.clipboardData.getData("text")); }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              maxLength={1}
              autoFocus={i === 0}
              aria-label={`Digit ${i + 1}`}
              className="adm-focus h-14 w-full rounded-lg bg-[var(--adm-card)] border border-[var(--adm-line)] text-center text-xl font-semibold adm-num text-[var(--adm-text)] focus:border-[var(--adm-neon-line)] transition-colors"
            />
          ))}
        </div>

        <label className="flex items-center gap-2.5 mb-7 cursor-pointer select-none">
          <button
            type="button"
            role="checkbox"
            aria-checked={trust}
            onClick={() => setTrust((v) => !v)}
            className={`size-4 rounded grid place-items-center border transition-colors shrink-0 ${
              trust ? "bg-[var(--adm-neon)] border-[var(--adm-neon)]" : "border-[var(--adm-line-strong)] hover:border-[var(--adm-text-3)]"
            }`}
          >
            {trust && <Check className="size-3 text-[var(--adm-neon-ink)]" strokeWidth={3} />}
          </button>
          <span className="text-sm text-[var(--adm-text-2)]">Trust this device for 30 days</span>
        </label>

        <PrimaryButton type="submit" disabled={!complete}>
          Verify <ArrowRight className="size-4" />
        </PrimaryButton>

        <div className="flex items-center justify-between mt-6 text-xs">
          <button type="button" className="text-[var(--adm-text-2)] hover:text-[var(--adm-neon)] transition-colors">
            Use a backup code instead
          </button>
          <button type="button" className="text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors">
            Resend code
          </button>
        </div>

        <p className="text-[11px] text-[var(--adm-text-3)] mt-7 text-center leading-relaxed">
          Two-factor is mandatory for all roles (KAD-09).
        </p>
      </form>
    </AuthShell>
  );
}

// ── AD·03 Forgot / Reset ──────────────────────────────────────────────────────
const PW_RULES = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "An uppercase and a lowercase letter", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
  { label: "A symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function ForgotReset() {
  const [stage, setStage] = React.useState<"request" | "sent" | "reset">("request");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const allRulesPass = PW_RULES.every((r) => r.test(pw));
  const resetReady = allRulesPass && pw === pw2 && pw2.length > 0;

  function requestLink(e: React.FormEvent) {
    e.preventDefault();
    if (emailValid) setStage("sent");
  }

  return (
    <AuthShell>
      <div>
        <div className="mb-8">
          <span className="adm-wordmark text-2xl text-[var(--adm-text)]">VALUR</span>
        </div>

        {stage === "request" && (
          <form onSubmit={requestLink} noValidate>
            <span className="grid place-items-center size-11 rounded-xl bg-[var(--adm-neon-soft)] text-[var(--adm-neon)] mb-5">
              <KeyRound className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold text-[var(--adm-text)] tracking-tight">Reset your password</h1>
            <p className="text-sm text-[var(--adm-text-3)] mt-1.5 mb-7">
              Enter your work email and we&apos;ll send a reset link.
            </p>

            <TextField
              label="Work email"
              icon={Mail}
              type="email"
              autoComplete="username"
              placeholder="name@valur.is"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="mt-6">
              <PrimaryButton type="submit" disabled={!emailValid}>
                <Send className="size-4" /> Send reset link
              </PrimaryButton>
            </div>

            <p className="text-[11px] text-[var(--adm-text-3)] mt-5 leading-relaxed">
              For security, the same confirmation appears whether or not an account exists for that address.
            </p>

            <BackToLogin />
          </form>
        )}

        {stage === "sent" && (
          <div>
            <span className="grid place-items-center size-11 rounded-xl bg-[var(--st-success-soft)] text-[var(--st-success)] mb-5">
              <CheckCircle2 className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold text-[var(--adm-text)] tracking-tight">Check your inbox</h1>
            <p className="text-sm text-[var(--adm-text-3)] mt-1.5 mb-6 leading-relaxed">
              If an account exists for <span className="text-[var(--adm-text-2)]">{email || "that address"}</span>, a
              reset link is on its way. The link expires in 30 minutes.
            </p>

            <div className="rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card)] p-4 text-xs text-[var(--adm-text-3)] leading-relaxed">
              Didn&apos;t get it? Check spam, confirm the address, or{" "}
              <button onClick={() => setStage("request")} className="text-[var(--adm-neon)] hover:underline">try again</button>.
              For a working demo of the next step, you can{" "}
              <button onClick={() => setStage("reset")} className="text-[var(--adm-neon)] hover:underline">set a new password</button>.
            </div>

            <BackToLogin />
          </div>
        )}

        {stage === "reset" && (
          <form onSubmit={(e) => { e.preventDefault(); if (resetReady) setStage("sent"); }}>
            <span className="grid place-items-center size-11 rounded-xl bg-[var(--adm-neon-soft)] text-[var(--adm-neon)] mb-5">
              <Lock className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold text-[var(--adm-text)] tracking-tight">Set a new password</h1>
            <p className="text-sm text-[var(--adm-text-3)] mt-1.5 mb-7">Choose a strong password you don&apos;t use elsewhere.</p>

            <div className="space-y-4">
              <TextField
                label="New password"
                icon={Lock}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                trailing={
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-[var(--adm-text-3)] hover:text-[var(--adm-text)]" aria-label="Toggle password visibility">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />
              <TextField
                label="Confirm new password"
                icon={Lock}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </div>

            <ul className="mt-4 space-y-1.5">
              {PW_RULES.map((r) => {
                const ok = r.test(pw);
                return (
                  <li key={r.label} className="flex items-center gap-2 text-xs">
                    <span className={`grid place-items-center size-4 rounded-full shrink-0 ${ok ? "bg-[var(--st-success-soft)] text-[var(--st-success)]" : "bg-[var(--adm-card-2)] text-[var(--adm-text-3)]"}`}>
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                    <span className={ok ? "text-[var(--adm-text-2)]" : "text-[var(--adm-text-3)]"}>{r.label}</span>
                  </li>
                );
              })}
              {pw2.length > 0 && pw !== pw2 && (
                <li className="flex items-center gap-2 text-xs text-[var(--st-danger)]">
                  <AlertCircle className="size-3.5 shrink-0" /> Passwords don&apos;t match.
                </li>
              )}
            </ul>

            <div className="mt-6">
              <PrimaryButton type="submit" disabled={!resetReady}>
                Update password <ArrowRight className="size-4" />
              </PrimaryButton>
            </div>

            <BackToLogin />
          </form>
        )}
      </div>
    </AuthShell>
  );
}

function BackToLogin() {
  return (
    <Link
      to="/admin/login"
      className="mt-7 inline-flex items-center gap-1.5 text-xs text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)] transition-colors"
    >
      <ArrowLeft className="size-3.5" /> Back to login
    </Link>
  );
}
