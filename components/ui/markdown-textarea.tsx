"use client"

import * as React from "react"
import { RichTextEditor, RichTextEditorProps } from "./rich-text-editor"

export interface MarkdownTextareaProps extends Omit<RichTextEditorProps, 'ref'> {}

const MarkdownTextarea = React.forwardRef<HTMLDivElement, MarkdownTextareaProps>(
  ({ className, value = "", onValueChange, placeholder, rows, ...props }, ref) => {
    return (
      <RichTextEditor
        ref={ref}
        className={className}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        rows={rows}
        {...props}
      />
    )
  }
)
MarkdownTextarea.displayName = "MarkdownTextarea"

export { MarkdownTextarea }
