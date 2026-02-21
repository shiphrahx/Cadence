import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (textarea && autoResize) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [textareaRef, autoResize])

    React.useEffect(() => {
      adjustHeight()
    }, [props.value, adjustHeight])

    return (
      <div className="has-[:focus-visible]:[background:linear-gradient(90deg,rgb(0,255,229)_0%,rgb(0,240,88)_100%)] has-[:disabled]:opacity-50 bg-[#383838] rounded-md p-[1.5px] w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-[5px] bg-[#262626] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed",
            autoResize && "resize-none overflow-hidden",
            className
          )}
          ref={textareaRef}
          onInput={adjustHeight}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
