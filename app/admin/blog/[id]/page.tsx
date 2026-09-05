import EditBlogForm from "@/components/blog/EditBlogForm";
import { supabaseServer } from "@/lib/supabaseServer";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const { data: post, error } = await supabaseServer
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Post not found</h1>
      </div>
    );
  }

  return <EditBlogForm post={post} />;
}
