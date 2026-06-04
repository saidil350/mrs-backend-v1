import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPostById } from "@/lib/cms/posts";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostEditForm } from "./edit-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/posts" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">{post.title}</p>
        </div>
      </div>
      <PostEditForm post={post} />
    </div>
  );
}
