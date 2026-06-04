"use client";
import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Heading2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  defaultValue?: string;
};

export function CmsRichEditor({ name, defaultValue = "" }: Props) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({ openOnClick: false }),
      TiptapImage,
      Placeholder.configure({ placeholder: "Tulis konten..." }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div>
      <div className="border rounded-lg overflow-hidden">
        <div className="flex gap-0.5 p-2 border-b bg-muted/50 flex-wrap">
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "bg-muted" : ""}>
            <Bold className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "bg-muted" : ""}>
            <Italic className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}>
            <Heading2 className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "bg-muted" : ""}>
            <List className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "bg-muted" : ""}>
            <ListOrdered className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { const url = window.prompt("URL:"); if (url) editor.chain().focus().setLink({ href: url }).run(); }}>
            <LinkIcon className="size-4" />
          </Button>
        </div>
        <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none" />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
