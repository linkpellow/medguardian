import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Update or create profile
    const profile = await prisma.agentProfile.upsert({
      where: { agentId: user.id },
      update: {
        photo: body.photo || null,
        bio: body.bio || null,
        title: body.title || null,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        socialLinks: body.socialLinks || null,
        primaryColor: body.primaryColor || null,
        secondaryColor: body.secondaryColor || null,
        accentColor: body.accentColor || null,
        calendlyUrl: body.calendlyUrl || null,
        googleCalendarUrl: body.googleCalendarUrl || null,
        customCalendarUrl: body.customCalendarUrl || null,
        thankYouMessage: body.thankYouMessage || null,
      },
      create: {
        agentId: user.id,
        photo: body.photo || null,
        bio: body.bio || null,
        title: body.title || null,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        socialLinks: body.socialLinks || null,
        primaryColor: body.primaryColor || null,
        secondaryColor: body.secondaryColor || null,
        accentColor: body.accentColor || null,
        calendlyUrl: body.calendlyUrl || null,
        googleCalendarUrl: body.googleCalendarUrl || null,
        customCalendarUrl: body.customCalendarUrl || null,
        thankYouMessage: body.thankYouMessage || null,
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

