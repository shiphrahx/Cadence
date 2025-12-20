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
            "prose prose-sm max-w-none focus:outline-none px-3 py-2 text-sm",
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
          className={cn("overflow-y-auto", className)}
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor"

export { RichTextEditor }
