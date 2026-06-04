import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAllPosts } from "@/lib/cms/posts";
import { POST_CATEGORY_LABELS } from "@/types";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsDeleteButton } from "@/components/cms/cms-delete-button";
import { CmsPublishToggle } from "@/components/cms/cms-publish-toggle";
import { deletePostAction, togglePostPublishAction } from "@/app/actions/cms/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default async function PostsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await getAllPosts();

  return (
    <div className="p-6 space-y-6">
      <CmsPageHeader
        title="Posts"
        description={`${posts.length} artikel`}
        createHref="/cms/posts/new"
        createLabel="Buat Post"
      />

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Belum ada post.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {POST_CATEGORY_LABELS[post.category] ?? post.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.author}</TableCell>
                  <TableCell>
                    <CmsPublishToggle
                      id={post.id}
                      isPublished={post.isPublished}
                      action={togglePostPublishAction}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(post.updatedAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" render={<Link href={`/cms/posts/${post.id}/edit`} />}>
                          <Pencil className="size-3" />
                      </Button>
                      <CmsDeleteButton
                        id={post.id}
                        action={deletePostAction}
                        itemName={post.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
