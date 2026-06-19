"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoldDivider } from "@/components/site/gold-divider";

type PageState = "loading" | "ready" | "submitting" | "success" | "invalid";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    // The Supabase browser client automatically exchanges the invite hash tokens
    // (#access_token=...&refresh_token=...) into a live session on init.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(session ? "ready" : "invalid");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setState("submitting");
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setState("ready");
      return;
    }

    setState("success");

    // Route admins to the admin dashboard, everyone else to the barber portal.
    const { data: { user } } = await supabase.auth.getUser();
    let destination = "/barber/dashboard";
    if (user) {
      const { data: staffRow } = await supabase
        .from("staff")
        .select("role")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (staffRow?.role === "admin") destination = "/admin/dashboard";
    }

    setTimeout(() => router.push(destination), 1500);
  }

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <p className="text-sm text-[#888888]">Verifying your invite link…</p>
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl text-[#F5F5F5]">Invite Link Expired</h1>
          <p className="mt-2 text-sm text-[#888888]">
            This link has expired or already been used. Ask your administrator to send a new invite.
          </p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-[#C9A96E]" />
          <h1 className="mt-4 font-display text-2xl text-[#F5F5F5]">You&apos;re all set!</h1>
          <p className="mt-2 text-sm text-[#888888]">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="font-display text-3xl text-[#F5F5F5]">
            <span className="italic text-[#C9A96E]">2Gether</span> Hair Studio
          </h1>
          <p className="mt-1 text-sm text-[#888888]">Create a password to access your portal.</p>
        </div>

        <GoldDivider className="my-6" />

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/5 bg-[#1A1A1A] p-6">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[#F5F5F5]">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="border-white/10 bg-[#0D0D0D] text-[#F5F5F5]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-[#F5F5F5]">
              Confirm Password
            </Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="border-white/10 bg-[#0D0D0D] text-[#F5F5F5]"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={state === "submitting"}
            className="w-full bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#C9A96E]/90 disabled:opacity-60"
          >
            {state === "submitting" ? "Setting up your account…" : "Set Password & Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
