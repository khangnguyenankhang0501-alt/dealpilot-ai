"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  id: string;
  status: string;
};

export default function TogglePostStatusButton({ id, status }: Props) {
  const router = useRouter();

  async function handleToggle() {
    const nextStatus = status === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("posts")
      .update({
        status: nextStatus,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      className="rounded bg-amber-600 px-3 py-2 text-white"
    >
      {status === "published" ? "Unpublish" : "Publish"}
    </button>
  );
}
