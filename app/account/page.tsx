"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

export default function AccountPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [name, setName] = useState("");
  const [memberSince, setMemberSince] = useState("");

  const [savedCount, setSavedCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email ?? "");
      setEmailVerified(Boolean(user.email_confirmed_at));

      setMemberSince(
        new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const typedProfile = profile as Profile | null;

      setName(
        typedProfile?.full_name ||
          (user.user_metadata?.full_name as string | undefined) ||
          user.email?.split("@")[0] ||
          "",
      );

      const sessionId = localStorage.getItem("dealpilot_session_id");

      if (sessionId) {
        const response = await fetch(
          `/api/favorites?sessionId=${encodeURIComponent(sessionId)}`,
          {
            cache: "no-store",
          },
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && Array.isArray(result.coupons)) {
            setSavedCount(result.coupons.length);
          }
        }
      }

      setLoading(false);
    }

    loadAccount();
  }, [supabase]);

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Your session has expired. Please sign in again.");

      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: name.trim(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

    if (profileError) {
      setErrorMessage(profileError.message);
      setSaving(false);
      return;
    }

    // Đồng bộ metadata của Supabase Auth
    const { error: userError } = await supabase.auth.updateUser({
      data: {
        full_name: name.trim(),
      },
    });

    if (userError) {
      setErrorMessage(userError.message);
      setSaving(false);
      return;
    }

    setMessage("Profile updated successfully.");

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl border bg-white p-8">
          Loading account...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-black">
          ← Back to Home
        </Link>

        <h1 className="mt-3 text-4xl font-bold text-gray-900">My Account</h1>

        <p className="mt-2 text-gray-500">
          Manage your profile and DealPilot account.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* PROFILE SUMMARY */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-gray-900">
                {name || "Account"}
              </h2>

              <p className="truncate text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Member since
            </p>

            <p className="mt-1 font-medium text-gray-800">{memberSince}</p>
          </div>
        </section>

        {/* ACCOUNT STATS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Account Overview</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Saved Coupons</p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {savedCount}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Account Status</p>

              <p className="mt-2 text-lg font-bold text-green-600">Active</p>
            </div>
          </div>
        </section>

        {/* PROFILE */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="full_name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <div className="flex items-center gap-3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                />

                <span
                  className={
                    emailVerified
                      ? "whitespace-nowrap rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                      : "whitespace-nowrap rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700"
                  }
                >
                  {emailVerified ? "✓ Verified" : "⚠ Unverified"}
                </span>
              </div>
            </div>

            {message && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* QUICK LINKS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Quick Links</h2>

          <div className="mt-5 space-y-2">
            <Link
              href="/saved"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ♥ Saved Coupons
            </Link>

            <Link
              href="/"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Browse Coupons
            </Link>

            <Link
              href="/update-password"
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Change Password
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
