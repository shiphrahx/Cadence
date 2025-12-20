"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Link2
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value = "", onValueChange, placeholder = "", className, rows = 10 }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary-600 hover:underline cursor-pointer",
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          class: cn(
            "focus:outline-none px-3 py-2 text-sm text-gray-900",
            className
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML()
        if (onValueChange) {
          onValueChange(html)
        }
      },
      immediatelyRender: false,
    })

    // Update editor content when value prop changes
    React.useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value)
      }
    }, [value, editor])

    if (!editor) {
      return null
    }

    const ToolbarButton = ({
      onClick,
      isActive,
      children,
      title
    }: {
      onClick: () => void
      isActive?: boolean
      children: React.ReactNode
      title: string
    }) => (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          "p-2 rounded hover:bg-gray-100 transition-colors",
          isActive && "bg-primary-100 text-primary-700"
        )}
      >
        {children}
      </button>
    )

    const setLink = () => {
      const previousUrl = editor.getAttributes("link").href
      const url = window.prompt("URL", previousUrl)

      if (url === null) {
        return
      }

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
        return
      }

      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }

    return (
      <div ref={ref} className="border border-gray-300 rounded-md bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            title="Link"
          >
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor */}
        <div
          className={cn("overflow-y-auto tiptap-editor", className)}
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          <EditorContent editor={editor} />
        </div>
        <style jsx global>{`
          .tiptap-editor .ProseMirror {
            min-height: inherit;
          }

          .tiptap-editor .ProseMirror p {
            margin: 0.5rem 0;
          }

          .tiptap-editor .ProseMirror h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 1rem 0 0.5rem 0;
            line-height: 1.2;
          }

          .tiptap-editor .ProseMirror h2 {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0.75rem 0 0.5rem 0;
            line-height: 1.3;
          }

          .tiptap-editor .ProseMirror h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0.5rem 0 0.25rem 0;
            line-height: 1.4;
          }

          .tiptap-editor .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }

          .tiptap-editor .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }

          .tiptap-editor .ProseMirror li {
            margin: 0.25rem 0;
          }

          .tiptap-editor .ProseMirror code {
            background-color: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
            font-family: monospace;
          }

          .tiptap-editor .ProseMirror pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 0.75rem;
            border-radius: 0.375rem;
            overflow-x: auto;
            margin: 0.5rem 0;
          }

          .tiptap-editor .ProseMirror pre code {
            background-color: transparent;
            padding: 0;
            color: inherit;
          }

          .tiptap-editor .ProseMirror blockquote {
            border-left: 4px solid #d1d5db;
            padding-left: 1rem;
            margin: 0.5rem 0;
            font-style: italic;
            color: #6b7280;
          }

          .tiptap-editor .ProseMirror strong {
            font-weight: 700;
          }

          .tiptap-editor .ProseMirror em {
            font-style: italic;
          }

          .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
            color: #9ca3af;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor"

export { RichTextEditor }
