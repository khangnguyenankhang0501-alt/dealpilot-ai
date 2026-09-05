"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  id: string;
};

export default function DeletePostButton({ id }: Props) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("Delete this post?");

    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Deleted");

    router.refresh();
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
