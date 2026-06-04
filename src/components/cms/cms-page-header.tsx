import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
};

export function CmsPageHeader({ title, description, createHref, createLabel = "Buat Baru" }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {createHref && (
        <Button render={<Link href={createHref} />}>
            <Plus className="mr-2 size-4" />
            {createLabel}
        </Button>
      )}
    </div>
  );
}
