"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LeafIcon } from "@/components/Icons";
import { useAnnounce } from "@/components/A11yProvider";

const labelCls = "mb-1 block text-xs font-extrabold uppercase tracking-wider text-[#6B5A1E]";
const inputCls =
  "w-full rounded-xl border-2 border-[#1a1408]/30 bg-white px-4 py-3 text-sm font-semibold transition focus:border-[#c9a227]";

export default function AdminLoginPage() {
  const router = useRouter();
  const announce = useAnnounce();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(""); // "email" | "password" | ""
  const [loading, setLoading] = useState(false);

  function fail(msg, field = "") {
    setError(msg);
    setInvalid(field);
    announce(msg, "assertive");
    if (field === "email") emailRef.current?.focus();
    if (field === "password") passwordRef.current?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInvalid("");

    // Manual checks so the message is announced and focus goes to the right field
    if (!email.trim()) return fail("Enter your email address.", "email");
    if (!password) return fail("Enter your password.", "password");

    setLoading(true);
    announce("Signing in…");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      announce("Signed in. Opening the admin dashboard.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      fail(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#FBF6E6,#ffffff_60%)] px-5 py-10"
    >
      <div className="gc-rise gc-summary w-full max-w-md rounded-3xl border-2 border-[#1a1408] bg-white p-8 md:p-10">
        <div className="flex flex-col items-center text-center">
          <span
            aria-hidden="true"
            className="gc-float flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1a1408] bg-[#c9a227] text-[#1a1408]"
          >
            <LeafIcon className="h-7 w-7" />
          </span>
          <h1 className="gc-rise mt-6 text-3xl font-extrabold leading-tight text-[#1a1408]" style={{ "--d": "120ms" }}>
            Sipology Spot Admin
          </h1>
          <p className="gc-rise mt-2 text-sm font-semibold text-[#6B5A1E]" style={{ "--d": "220ms" }}>
            Sign in to manage your store
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-busy={loading}
          className="gc-rise mt-8 space-y-5"
          style={{ "--d": "300ms" }}
        >
          <div>
            <label htmlFor="admin-email" className={labelCls}>
              Email
            </label>
            <input
              ref={emailRef}
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              aria-required="true"
              aria-invalid={invalid === "email" ? "true" : undefined}
              aria-describedby={invalid === "email" ? "login-error" : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="admin-password" className={labelCls}>
              Password
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                aria-required="true"
                aria-invalid={invalid === "password" ? "true" : undefined}
                aria-describedby={invalid === "password" ? "login-error" : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label="Show password"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-extrabold text-[#1a1408] transition hover:bg-[#c9a227] active:scale-95"
              >
                <span aria-hidden="true">{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
          </div>

          {error && (
            <p
              id="login-error"
              role="alert"
              className="rounded-xl border-2 border-[#1a1408] bg-[#FBF6E6] px-4 py-2.5 text-sm font-bold text-[#1a1408]"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}