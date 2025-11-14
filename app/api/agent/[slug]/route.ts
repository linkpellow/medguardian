import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { error: "Agent slug is required" },
        { status: 400 }
      )
    }

    // Parse slug (format: "firstname-lastname" or agent ID)
    // Try to find by slug first, then by ID
    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          {
            AND: [
              {
                firstName: {
                  equals: slug.split("-")[0],
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  equals: slug.split("-").slice(1).join("-"),
                  mode: "insensitive",
                },
              },
            ],
          },
          {
            id: slug,
          },
        ],
        status: "ACTIVE",
      },
      include: {
        profile: true,
        licenses: {
          where: {
            verified: true,
          },
          orderBy: {
            state: "asc",
          },
        },
      },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      )
    }

    // Format response
    const response = {
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      profile: agent.profile
        ? {
            photo: agent.profile.photo,
            bio: agent.profile.bio,
            title: agent.profile.title,
            phone: agent.profile.phone,
            email: agent.profile.email,
            website: agent.profile.website,
            socialLinks: agent.profile.socialLinks,
            primaryColor: agent.profile.primaryColor,
            secondaryColor: agent.profile.secondaryColor,
            accentColor: agent.profile.accentColor,
            theme: agent.profile.theme,
            layoutTemplate: agent.profile.layoutTemplate,
            testimonials: agent.profile.testimonials,
            badges: agent.profile.badges,
            credentials: agent.profile.credentials,
            calendlyUrl: agent.profile.calendlyUrl,
            googleCalendarUrl: agent.profile.googleCalendarUrl,
            customCalendarUrl: agent.profile.customCalendarUrl,
            introVideoUrl: agent.profile.introVideoUrl,
            brochurePdfUrl: agent.profile.brochurePdfUrl,
            thankYouMessage: agent.profile.thankYouMessage,
          }
        : null,
      licenses: agent.licenses.map((license) => ({
        state: license.state,
        licenseNumber: license.licenseNumber,
        expirationDate: license.expirationDate,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching agent:", error)
    return NextResponse.json(
      { error: "Failed to fetch agent data" },
      { status: 500 }
    )
  }
}

