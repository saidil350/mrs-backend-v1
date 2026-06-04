import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
};

export function CmsSeoFields({ defaultMetaTitle, defaultMetaDescription }: Props) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">SEO</h3>
      <div className="space-y-2">
        <Label htmlFor="seoMetaTitle">Meta Title</Label>
        <Input id="seoMetaTitle" name="seoMetaTitle" defaultValue={defaultMetaTitle ?? ""} placeholder="SEO title..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seoMetaDescription">Meta Description</Label>
        <Textarea id="seoMetaDescription" name="seoMetaDescription" defaultValue={defaultMetaDescription ?? ""} placeholder="SEO description..." rows={2} />
      </div>
    </div>
  );
}
