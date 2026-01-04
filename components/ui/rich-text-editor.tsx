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
            class: "text-primary-600 dark:text-primary-dark-400 hover:underline cursor-pointer",
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
            "focus:outline-none px-3 py-2 text-sm text-gray-900 dark:text-gray-100",
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
          "p-2 rounded-md transition-all duration-200 cursor-pointer",
          "hover:bg-primary-50 dark:bg-primary-dark-900/30 dark:hover:bg-primary-dark-900/30 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:text-primary-dark-400 dark:hover:text-primary-dark-400 dark:hover:text-primary-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800",
          isActive
            ? "bg-primary-100 dark:bg-primary-dark-900 dark:bg-primary-dark-900/30 text-primary-700 dark:text-primary-dark-400 dark:text-primary-dark-400 shadow-sm"
            : "text-gray-600 dark:text-gray-300 hover:shadow-sm"
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

    const ToolbarDivider = () => (
      <div className="w-px h-6 bg-gray-300 dark:bg-[#383838] mx-1.5" />
    )

    return (
      <div ref={ref} className={cn("border border-gray-300 dark:border-[#383838] rounded-lg bg-white dark:bg-[#262626] shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md", className?.includes('h-full') ? 'h-full flex flex-col' : '')}>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-3 border-b border-gray-200 dark:border-[#383838] bg-gradient-to-b from-gray-50 to-white dark:from-[#2e2e2e] dark:to-[#262626]">
          {/* Text Formatting Group */}
          <div className="flex gap-0.5 p-0.5 bg-white dark:bg-[#1c1c1c] rounded-md border border-gray-200 dark:border-[#383838]">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Headings Group */}
          <div className="flex gap-0.5 p-0.5 bg-white dark:bg-[#1c1c1c] rounded-md border border-gray-200 dark:border-[#383838]">
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
          </div>

          <ToolbarDivider />

          {/* Lists Group */}
          <div className="flex gap-0.5 p-0.5 bg-white dark:bg-[#1c1c1c] rounded-md border border-gray-200 dark:border-[#383838]">
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
          </div>

          <ToolbarDivider />

          {/* Special Formatting Group */}
          <div className="flex gap-0.5 p-0.5 bg-white dark:bg-[#1c1c1c] rounded-md border border-gray-200 dark:border-[#383838]">
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
              title="Insert Link"
            >
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <div
          className={cn(
            "overflow-y-auto tiptap-editor bg-white dark:bg-[#262626]",
            "focus-within:bg-gray-50/30 dark:focus-within:bg-[#2a2a2a] transition-colors duration-200",
            className?.includes('h-full') ? 'flex-1' : ''
          )}
          style={className?.includes('h-full') ? undefined : { minHeight: `${rows * 1.5}rem` }}
        >
          <EditorContent editor={editor} />
        </div>
        <style jsx global>{`
          .tiptap-editor .ProseMirror {
            min-height: inherit;
            padding: 1rem 1.25rem;
            line-height: 1.7;
            color: #1f2937;
            font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          .dark .tiptap-editor .ProseMirror {
            color: #ebebeb;
          }

          .tiptap-editor .ProseMirror:focus {
            outline: none;
          }

          .tiptap-editor .ProseMirror p {
            margin: 0.75rem 0;
            line-height: 1.7;
          }

          .tiptap-editor .ProseMirror p:first-child {
            margin-top: 0;
          }

          .tiptap-editor .ProseMirror p:last-child {
            margin-bottom: 0;
          }

          .tiptap-editor .ProseMirror h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin: 1.5rem 0 0.75rem 0;
            line-height: 1.25;
            color: #111827;
            letter-spacing: -0.025em;
          }

          .dark .tiptap-editor .ProseMirror h1 {
            color: #ebebeb;
          }

          .tiptap-editor .ProseMirror h1:first-child {
            margin-top: 0;
          }

          .tiptap-editor .ProseMirror h2 {
            font-size: 1.4rem;
            font-weight: 700;
            margin: 1.25rem 0 0.6rem 0;
            line-height: 1.3;
            color: #111827;
            letter-spacing: -0.02em;
          }

          .dark .tiptap-editor .ProseMirror h2 {
            color: #ebebeb;
          }

          .tiptap-editor .ProseMirror h2:first-child {
            margin-top: 0;
          }

          .tiptap-editor .ProseMirror h3 {
            font-size: 1.15rem;
            font-weight: 600;
            margin: 1rem 0 0.5rem 0;
            line-height: 1.4;
            color: #1f2937;
            letter-spacing: -0.01em;
          }

          .dark .tiptap-editor .ProseMirror h3 {
            color: #ebebeb;
          }

          .tiptap-editor .ProseMirror h3:first-child {
            margin-top: 0;
          }

          .tiptap-editor .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.75rem;
            margin: 0.75rem 0;
          }

          .tiptap-editor .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.75rem;
            margin: 0.75rem 0;
          }

          .tiptap-editor .ProseMirror li {
            margin: 0.375rem 0;
            line-height: 1.7;
            padding-left: 0.25rem;
          }

          .tiptap-editor .ProseMirror li p {
            margin: 0.25rem 0;
          }

          .tiptap-editor .ProseMirror ul ul,
          .tiptap-editor .ProseMirror ol ol,
          .tiptap-editor .ProseMirror ul ol,
          .tiptap-editor .ProseMirror ol ul {
            margin: 0.25rem 0;
          }

          .tiptap-editor .ProseMirror code {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            color: #be123c;
            padding: 0.2rem 0.4rem;
            border-radius: 0.375rem;
            font-size: 0.9em;
            font-family: 'Courier New', Courier, monospace;
            font-weight: 500;
            border: 1px solid #e5e7eb;
          }

          .dark .tiptap-editor .ProseMirror code {
            background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
            color: #fda4af;
            border-color: #4b5563;
          }

          .tiptap-editor .ProseMirror pre {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #f9fafb;
            padding: 1rem 1.25rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
            border: 1px solid #374151;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .tiptap-editor .ProseMirror pre code {
            background: transparent;
            padding: 0;
            color: #e5e7eb;
            border: none;
            font-size: 0.875rem;
            line-height: 1.6;
          }

          .tiptap-editor .ProseMirror blockquote {
            border-left: 4px solid #AEA6FD;
            background: linear-gradient(to right, rgba(174, 166, 253, 0.05), transparent);
            padding: 0.75rem 1rem 0.75rem 1.25rem;
            margin: 1rem 0;
            font-style: italic;
            color: #4b5563;
            border-radius: 0 0.375rem 0.375rem 0;
          }

          .dark .tiptap-editor .ProseMirror blockquote {
            background: linear-gradient(to right, rgba(174, 166, 253, 0.1), transparent);
            color: #9ca3af;
          }

          .tiptap-editor .ProseMirror blockquote p {
            margin: 0.5rem 0;
          }

          .tiptap-editor .ProseMirror blockquote p:first-child {
            margin-top: 0;
          }

          .tiptap-editor .ProseMirror blockquote p:last-child {
            margin-bottom: 0;
          }

          .tiptap-editor .ProseMirror strong {
            font-weight: 700;
            color: #111827;
          }

          .dark .tiptap-editor .ProseMirror strong {
            color: #f3f4f6;
          }

          .tiptap-editor .ProseMirror em {
            font-style: italic;
            color: #374151;
          }

          .dark .tiptap-editor .ProseMirror em {
            color: #d1d5db;
          }

          .tiptap-editor .ProseMirror a {
            color: #AEA6FD;
            text-decoration: underline;
            text-decoration-color: rgba(174, 166, 253, 0.4);
            text-underline-offset: 2px;
            transition: all 0.2s ease;
          }

          .tiptap-editor .ProseMirror a:hover {
            color: #9990E8;
            text-decoration-color: #9990E8;
          }

          .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
            color: #9ca3af;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
            font-style: normal;
            font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-weight: 400;
          }

          .dark .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
            color: #6b7280;
          }

          /* Selection styling */
          .tiptap-editor .ProseMirror ::selection {
            background: rgba(174, 166, 253, 0.2);
          }

          /* Focus state for better UX */
          .tiptap-editor .ProseMirror-focused {
            outline: none;
          }
        `}</style>
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor"

export { RichTextEditor }
