"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MessageSquare, Calendar, Download, Play, Loader2 } from "lucide-react"
import { USState } from "@prisma/client"

interface AgentData {
  id: string
  firstName: string
  lastName: string
  email: string
  profile: {
    photo: string | null
    bio: string | null
    title: string | null
    phone: string | null
    email: string | null
    website: string | null
    socialLinks: any
    primaryColor: string | null
    secondaryColor: string | null
    accentColor: string | null
    theme: string | null
    layoutTemplate: string | null
    testimonials: any
    badges: any
    credentials: any
    calendlyUrl: string | null
    googleCalendarUrl: string | null
    customCalendarUrl: string | null
    introVideoUrl: string | null
    brochurePdfUrl: string | null
    thankYouMessage: string | null
  } | null
  licenses: Array<{
    state: USState
    licenseNumber: string | null
    expirationDate: Date | null
  }>
}

interface AgentLandingPageProps {
  agentSlug: string
}

export default function AgentLandingPage({ agentSlug }: AgentLandingPageProps) {
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    async function fetchAgent() {
      try {
        const response = await fetch(`/api/agent/${agentSlug}`)
        if (!response.ok) {
          throw new Error("Failed to fetch agent data")
        }
        const data = await response.json()
        setAgent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agent page")
      } finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [agentSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Agent Not Found</CardTitle>
            <CardDescription>
              {error || "The agent you're looking for doesn't exist or is no longer active."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const profile = agent.profile
  const primaryColor = profile?.primaryColor || "#1e40af"
  const secondaryColor = profile?.secondaryColor || "#3b82f6"
  const accentColor = profile?.accentColor || "#60a5fa"

  // Get initials for avatar fallback
  const initials = `${agent.firstName[0]}${agent.lastName[0]}`

  // Format phone number for links
  const phoneNumber = profile?.phone?.replace(/\D/g, "") || ""
  const email = profile?.email || agent.email

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative py-12 sm:py-16 lg:py-20"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%)`,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Agent Photo */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-background shadow-lg">
                <AvatarImage
                  src={profile?.photo || ""}
                  alt={`${agent.firstName} ${agent.lastName}`}
                />
                <AvatarFallback className="text-2xl sm:text-3xl font-semibold" style={{ backgroundColor: primaryColor, color: "white" }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Agent Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                {agent.firstName} {agent.lastName}
              </h1>
              {profile?.title && (
                <p className="text-lg sm:text-xl text-muted-foreground mb-4">
                  {profile.title}
                </p>
              )}
              {profile?.bio && (
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* License Badges */}
              {agent.licenses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
                  {agent.licenses.map((license, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                      style={{ backgroundColor: `${accentColor}20`, color: primaryColor }}
                    >
                      {license.state} Licensed
                      {license.licenseNumber && ` • ${license.licenseNumber}`}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Credentials/Badges */}
              {profile?.badges && Array.isArray(profile.badges) && profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {profile.badges.map((badge: any, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-2 py-1"
                    >
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Thank You Message */}
            {profile?.thankYouMessage && (
              <Card>
                <CardHeader>
                  <CardTitle>Thank You!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.thankYouMessage}</p>
                </CardContent>
              </Card>
            )}

            {/* Intro Video */}
            {profile?.introVideoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Introduction Video</CardTitle>
                </CardHeader>
                <CardContent>
                  {showVideo ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={profile.introVideoUrl}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative group cursor-pointer"
                      onClick={() => setShowVideo(true)}
                    >
                      <div className="absolute inset-0 bg-black/40 rounded-lg" />
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                        <p className="text-white font-medium">Watch Introduction</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Testimonials */}
            {profile?.testimonials && Array.isArray(profile.testimonials) && profile.testimonials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What Clients Say</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {profile.testimonials.map((testimonial: any, index: number) => (
                      <div key={index} className="border-l-4 pl-4" style={{ borderColor: primaryColor }}>
                        <p className="text-muted-foreground mb-2 italic">"{testimonial.text}"</p>
                        <p className="font-semibold text-sm">— {testimonial.name}</p>
                        {testimonial.rating && (
                          <div className="flex gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={i < testimonial.rating ? "text-yellow-400" : "text-muted-foreground"}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Credentials */}
            {profile?.credentials && Array.isArray(profile.credentials) && profile.credentials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Credentials & Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.credentials.map((cred: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: primaryColor }} />
                        <div>
                          <p className="font-medium">{cred.name}</p>
                          {cred.issuer && (
                            <p className="text-sm text-muted-foreground">{cred.issuer}</p>
                          )}
                          {cred.year && (
                            <p className="text-xs text-muted-foreground">Since {cred.year}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Get In Touch</CardTitle>
                <CardDescription>Choose your preferred method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {phoneNumber && (
                  <>
                    <Button
                      className="w-full"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => window.location.href = `tel:${phoneNumber}`}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `sms:${phoneNumber}`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send SMS
                    </Button>
                  </>
                )}
                {email && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = `mailto:${email}`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                )}
                {profile?.website && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(profile.website || "", "_blank")}
                  >
                    Visit Website
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Booking Card */}
            {(profile?.calendlyUrl || profile?.googleCalendarUrl || profile?.customCalendarUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Meeting</CardTitle>
                  <CardDescription>Book a time that works for you</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.calendlyUrl && (
                    <div className="w-full" style={{ minHeight: "650px" }}>
                      <iframe
                        src={profile.calendlyUrl.includes("?") 
                          ? `${profile.calendlyUrl}&embed_domain=${typeof window !== "undefined" ? window.location.hostname : ""}&embed_type=Inline`
                          : `${profile.calendlyUrl}?embed_domain=${typeof window !== "undefined" ? window.location.hostname : ""}&embed_type=Inline`
                        }
                        className="w-full h-full rounded-lg"
                        style={{ minHeight: "650px" }}
                        frameBorder="0"
                      />
                    </div>
                  )}
                  {profile.googleCalendarUrl && !profile.calendlyUrl && (
                    <Button
                      className="w-full"
                      style={{ backgroundColor: secondaryColor }}
                      onClick={() => window.open(profile.googleCalendarUrl || "", "_blank")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book with Google Calendar
                    </Button>
                  )}
                  {profile.customCalendarUrl && !profile.calendlyUrl && !profile.googleCalendarUrl && (
                    <Button
                      className="w-full"
                      style={{ backgroundColor: secondaryColor }}
                      onClick={() => window.open(profile.customCalendarUrl || "", "_blank")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Download Brochure */}
            {profile?.brochurePdfUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(profile.brochurePdfUrl || "", "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Brochure
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {profile?.socialLinks && typeof profile.socialLinks === "object" && (
              <Card>
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.socialLinks.linkedin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.socialLinks.linkedin, "_blank")}
                      >
                        LinkedIn
                      </Button>
                    )}
                    {profile.socialLinks.facebook && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.socialLinks.facebook, "_blank")}
                      >
                        Facebook
                      </Button>
                    )}
                    {profile.socialLinks.twitter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.socialLinks.twitter, "_blank")}
                      >
                        Twitter
                      </Button>
                    )}
                    {profile.socialLinks.instagram && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.socialLinks.instagram, "_blank")}
                      >
                        Instagram
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

