"use client";

import { supabase } from "@/lib/supabaseClient";

export default function DeletePostButton({ id }: { id: number }) {
  async function handleDelete() {
    const confirmed = confirm("Delete this post permanently?");

    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      alert("Delete failed");
      return;
    }

    window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded bg-red-600 px-3 py-2 text-white"
    >
      Delete
    </button>
  );
}
