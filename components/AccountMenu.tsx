"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserInfo = {
  email: string | null;
  name: string | null;
};

interface AccountMenuProps {
  mobile?: boolean;
}

export default function AccountMenu({ mobile = false }: AccountMenuProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const metadata = user.user_metadata as {
        full_name?: string;
      };

      setUser({
        email: user.email ?? null,
        name: metadata?.full_name || user.email?.split("@")[0] || "Account",
      });

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setOpen(false);
        return;
      }

      const metadata = session.user.user_metadata as {
        full_name?: string;
      };

      setUser({
        email: session.user.email ?? null,
        name:
          metadata?.full_name || session.user.email?.split("@")[0] || "Account",
      });

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();

    setOpen(false);

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  if (loading) {
    if (mobile) {
      return (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        </div>
      );
    }

    return <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-100" />;
  }

  /*
   * =========================================================
   * MOBILE VERSION
   * =========================================================
   */

  if (mobile) {
    if (!user) {
      return (
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="
            flex
            items-center
            justify-between
            rounded-xl
            bg-slate-50
            px-4
            py-3
            text-sm
            font-semibold
            text-slate-800
            transition
            hover:bg-emerald-50
            hover:text-emerald-700
          "
        >
          <span className="flex items-center gap-3">
            <span className="text-base">👤</span>
            <span>Sign In</span>
          </span>

          <span className="text-slate-400">→</span>
        </Link>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        {/* USER HEADER */}

        <div className="flex items-center gap-3 px-4 py-3">
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-emerald-500
              text-xs
              font-extrabold
              text-white
            "
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </span>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-slate-900">
              {user.name}
            </div>

            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
        </div>

        {/* MOBILE ACCOUNT LINKS */}

        <div className="border-t border-slate-100 p-2">
          <Link
            href="/account"
            className="
              flex
              items-center
              gap-3
              rounded-lg
              px-3
              py-2.5
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              hover:text-emerald-600
            "
          >
            <span>👤</span>
            <span>My Account</span>
          </Link>

          <Link
            href="/saved"
            className="
              flex
              items-center
              gap-3
              rounded-lg
              px-3
              py-2.5
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              hover:text-emerald-600
            "
          >
            <span>♡</span>
            <span>Saved Coupons</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-lg
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            <span>↪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * DESKTOP VERSION
   * =========================================================
   */

  if (!user) {
    return (
      <Link
        href="/login"
        className="
          whitespace-nowrap
          rounded-lg
          px-2
          py-2
          text-sm
          font-semibold
          text-slate-700
          transition-colors
          hover:text-emerald-600
        "
      >
        Sign In
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      {/* ACCOUNT BUTTON */}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="
          flex
          items-center
          gap-2
          rounded-xl
          px-2
          py-1.5
          text-sm
          font-medium
          text-slate-700
          transition
          hover:bg-slate-50
        "
      >
        {/* AVATAR */}

        <span
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-emerald-500
            text-xs
            font-extrabold
            text-white
          "
        >
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </span>

        {/* NAME */}

        <span className="hidden max-w-[110px] truncate lg:inline">
          {user.name}
        </span>

        {/* ARROW */}

        <span
          className={`text-[10px] text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* DROPDOWN */}

      {open && (
        <div
          role="menu"
          className="
            absolute
            right-0
            top-full
            z-[100]
            mt-2
            w-64
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-xl
            shadow-slate-900/10
          "
        >
          {/* USER INFO */}

          <div className="border-b border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <span
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-500
                  text-sm
                  font-extrabold
                  text-white
                "
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>

              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {user.name}
                </div>

                <div className="mt-0.5 truncate text-xs text-slate-500">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* LINKS */}

          <div className="p-2">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
                hover:text-emerald-600
              "
            >
              <span className="text-base">👤</span>
              <span>My Account</span>
            </Link>

            <Link
              href="/saved"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-50
                hover:text-emerald-600
              "
            >
              <span className="text-base">♡</span>
              <span>Saved Coupons</span>
            </Link>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-left
                text-sm
                font-medium
                text-red-600
                transition
                hover:bg-red-50
              "
            >
              <span className="text-base">↪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
