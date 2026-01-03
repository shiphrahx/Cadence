"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemName: string
  itemType: string
  description?: string
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType,
  description = "This action cannot be undone. This will permanently delete this item and remove all associated data.",
}: DeleteConfirmDialogProps) {
  const [confirmationText, setConfirmationText] = useState("")

  // Reset confirmation text when dialog closes
  useEffect(() => {
    if (!open) {
      setConfirmationText("")
    }
  }, [open])

  const handleConfirm = () => {
    if (confirmationText === itemName) {
      onConfirm()
      setConfirmationText("")
    }
  }

  const handleCancel = () => {
    setConfirmationText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemType}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="confirmDelete">
              Type <strong>{itemName}</strong> to confirm
            </Label>
            <Input
              id="confirmDelete"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type ${itemType.toLowerCase()} name to confirm`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && confirmationText === itemName) {
                  handleConfirm()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmationText !== itemName}
          >
            Delete {itemType}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
