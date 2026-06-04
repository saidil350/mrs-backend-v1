import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getTestimonialById } from "@/lib/cms/testimonials";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditTestimonialForm } from "./edit-form";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const testimonial = await getTestimonialById(id);
  if (!testimonial) notFound();

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/cms/testimonials" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Testimonial</h1>
          <p className="text-muted-foreground">{testimonial.name}</p>
        </div>
      </div>

      <EditTestimonialForm testimonial={testimonial} />
    </div>
  );
}
