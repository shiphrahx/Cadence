"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Check } from "lucide-react"

export default function SettingsPage() {
  const [preferredName, setPreferredName] = useState("User")
  const [email] = useState("user@example.com") // Read-only from OAuth
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    // TODO: Implement actual save logic when backend is ready
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-100 font-bold">Settings</h1>
          <p className="text-gray-400 mt-1">
            Manage your account preferences and application settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="Enter your preferred name"
              />
              <p className="text-gray-400">
                This is how you'll be addressed throughout the application
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-[#1c1c1c] cursor-not-allowed"
              />
              <p className="text-gray-400">
                Email is managed through your OAuth provider and cannot be changed here
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Changes will be saved to your account
          </p>
          <Button onClick={handleSave} className="min-w-[120px]">
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
