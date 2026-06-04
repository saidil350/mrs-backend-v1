"use client";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  isPublished: boolean;
  action: (formData: FormData) => Promise<void>;
};

export function CmsPublishToggle({ id, isPublished, action }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isPublished" value={isPublished ? "false" : "true"} />
      <Button
        type="submit"
        variant={isPublished ? "default" : "outline"}
        size="sm"
      >
        {isPublished ? <Check className="mr-1 size-3" /> : <X className="mr-1 size-3" />}
        {isPublished ? "Published" : "Draft"}
      </Button>
    </form>
  );
}
