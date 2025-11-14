"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"

interface ProfileEditorProps {
  agent: any
}

export default function ProfileEditor({ agent }: ProfileEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    agent?.profile?.photo || null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      photo: agent?.profile?.photo || "",
      bio: agent?.profile?.bio || "",
      title: agent?.profile?.title || "",
      phone: agent?.profile?.phone || "",
      email: agent?.profile?.email || agent?.email || "",
      website: agent?.profile?.website || "",
      linkedin: (agent?.profile?.socialLinks as any)?.linkedin || "",
      facebook: (agent?.profile?.socialLinks as any)?.facebook || "",
      twitter: (agent?.profile?.socialLinks as any)?.twitter || "",
      instagram: (agent?.profile?.socialLinks as any)?.instagram || "",
      primaryColor: agent?.profile?.primaryColor || "#1e40af",
      secondaryColor: agent?.profile?.secondaryColor || "#3b82f6",
      accentColor: agent?.profile?.accentColor || "#60a5fa",
      calendlyUrl: agent?.profile?.calendlyUrl || "",
      googleCalendarUrl: agent?.profile?.googleCalendarUrl || "",
      customCalendarUrl: agent?.profile?.customCalendarUrl || "",
      thankYouMessage: agent?.profile?.thankYouMessage || "",
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)

    try {
      const response = await fetch("/api/agent/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          socialLinks: {
            linkedin: data.linkedin || undefined,
            facebook: data.facebook || undefined,
            twitter: data.twitter || undefined,
            instagram: data.instagram || undefined,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      router.refresh()
      // Show success message (you can add a toast here)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const primaryColor = watch("primaryColor")
  const secondaryColor = watch("secondaryColor")
  const accentColor = watch("accentColor")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload your professional photo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={photoPreview || ""} />
              <AvatarFallback className="text-2xl">
                {agent?.firstName?.[0]}{agent?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                {...register("photo")}
                placeholder="https://example.com/photo.jpg"
                onChange={(e) => {
                  register("photo").onChange(e)
                  setPhotoPreview(e.target.value)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your professional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Senior Insurance Advisor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1-555-0101"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell prospects about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                {...register("linkedin")}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                {...register("facebook")}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                {...register("twitter")}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register("instagram")}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Branding Colors</CardTitle>
          <CardDescription>Customize your landing page colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  {...register("primaryColor")}
                  className="w-20 h-10"
                />
                <Input
                  {...register("primaryColor")}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
              <div
                className="h-12 rounded-md"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  {...register("secondaryColor")}
                  className="w-20 h-10"
                />
                <Input
                  {...register("secondaryColor")}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
              <div
                className="h-12 rounded-md"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  {...register("accentColor")}
                  className="w-20 h-10"
                />
                <Input
                  {...register("accentColor")}
                  placeholder="#60a5fa"
                  className="flex-1"
                />
              </div>
              <div
                className="h-12 rounded-md"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>Connect your booking calendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendlyUrl">Calendly URL</Label>
            <Input
              id="calendlyUrl"
              {...register("calendlyUrl")}
              placeholder="https://calendly.com/yourname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleCalendarUrl">Google Calendar URL</Label>
            <Input
              id="googleCalendarUrl"
              {...register("googleCalendarUrl")}
              placeholder="https://calendar.google.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customCalendarUrl">Custom Calendar URL</Label>
            <Input
              id="customCalendarUrl"
              {...register("customCalendarUrl")}
              placeholder="https://yourcalendar.com/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Thank You Message */}
      <Card>
        <CardHeader>
          <CardTitle>Thank You Message</CardTitle>
          <CardDescription>Message shown after form submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="thankYouMessage">Message</Label>
            <Textarea
              id="thankYouMessage"
              {...register("thankYouMessage")}
              placeholder="Thank you for your interest! I'll contact you within 24 hours..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}

