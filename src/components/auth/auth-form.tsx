"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          // Surface the first field-level validation issue if present.
          const issues = data.issues as Record<string, string[]> | undefined;
          const firstIssue = issues
            ? Object.values(issues).flat().find(Boolean)
            : null;
          throw new Error(
            firstIssue ||
              data.error ||
              "Could not create account. Use a valid email and a password of at least 8 characters."
          );
        }
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        throw new Error("Invalid email or password.");
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-luxe flex min-h-[80vh] items-center justify-center py-16">
      <div className="glass-dark w-full max-w-md rounded-[var(--radius-luxe)] p-8 md:p-10">
        <div className="text-center">
          <p className="eyebrow mb-3">{isRegister ? "Join BottleExpress" : "Welcome back"}</p>
          <h1 className="font-display text-3xl text-cream">
            {isRegister ? "Create your account" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isRegister
              ? "Begin your private cellar experience."
              : "Access your cellar, orders and membership."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {isRegister && (
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Alexandra Vance"
              autoComplete="name"
              required
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />

          {error && (
            <p className="rounded-lg border border-burgundy/40 bg-burgundy/15 px-4 py-2.5 text-xs text-[#e58aa0]">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isRegister ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isRegister ? (
            <>
              Already a member?{" "}
              <Link href="/login" className="text-gold hover:text-gold-bright">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to BottleExpress?{" "}
              <Link href="/register" className="text-gold hover:text-gold-bright">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-xl border border-hairline bg-night/60 px-4 text-sm text-cream placeholder:text-muted-2 focus:border-gold focus:outline-none"
      />
    </label>
  );
}
