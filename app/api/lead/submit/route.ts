import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { USState, LeadStatus, RoutingMethod } from "@prisma/client"
import { routeLead, getDefaultRoutingConfig, getAgentLandingPageUrl } from "@/lib/routing"
import type { EligibleAgent } from "@/lib/routing"
import { notifyAgentAboutLead } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "zip",
      "state",
      "dob",
      "tobaccoUse",
      "coverageStartPreference",
      "peopleNeedingCoverage",
    ]

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== false && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate state is a valid USState
    const state = body.state as USState
    if (!Object.values(USState).includes(state)) {
      return NextResponse.json(
        { error: "Invalid state" },
        { status: 400 }
      )
    }

    // Parse date of birth
    const dob = new Date(body.dob)
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      )
    }

    // Detect user's state (already validated above)
    // Filter agents licensed in that state
    const eligibleAgentsRaw = await prisma.agent.findMany({
      where: {
        status: "ACTIVE",
        licenses: {
          some: {
            state: state,
            verified: true,
          },
        },
      },
      include: {
        leads: {
          where: {
            status: {
              in: ["PENDING", "ASSIGNED"],
            },
          },
        },
      },
    })

    // Transform to EligibleAgent format with pending leads count
    const eligibleAgents: EligibleAgent[] = eligibleAgentsRaw.map((agent) => ({
      ...agent,
      pendingLeadsCount: agent.leads.length,
    }))

    // Get routing configuration
    const routingConfig = getDefaultRoutingConfig()

    // Apply routing rules
    const selectedAgent = routeLead(eligibleAgents, routingConfig)

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        email: body.email,
        zip: body.zip,
        state: state,
        dob: dob,
        tobaccoUse: body.tobaccoUse,
        coverageStartPreference: body.coverageStartPreference,
        peopleNeedingCoverage: parseInt(body.peopleNeedingCoverage) || 1,
        
        // Optional fields
        gender: body.gender || null,
        householdIncome: body.householdIncome || null,
        currentCoverage: body.currentCoverage || null,
        deductiblePreference: body.deductiblePreference || null,
        carrierPreference: body.carrierPreference || null,
        dentalVisionPreference: body.dentalVisionPreference || null,
        medications: body.medications || null,
        employmentStatus: body.employmentStatus || null,
        
        // Custom answers
        customAnswers: body.customAnswers || null,
        
        // Routing - assign lead to selected agent
        agentId: selectedAgent?.id || null,
        status: selectedAgent ? LeadStatus.ASSIGNED : LeadStatus.PENDING,
      },
    })

    // Calculate processing time
    const processingTimeMs = Date.now() - startTime

    // Create routing log with detailed routing information
    const routingLog = await prisma.routingLog.create({
      data: {
        leadId: lead.id,
        agentId: selectedAgent?.id || null,
        method: routingConfig.method,
        state: state,
        eligibleAgents: eligibleAgents.map((a) => a.id),
        selectedAgentId: selectedAgent?.id || null,
        processingTimeMs: processingTimeMs,
        routingRules: {
          method: routingConfig.method,
          criteria: routingConfig.method === RoutingMethod.ROUND_ROBIN 
            ? "least_pending_leads" 
            : routingConfig.method === RoutingMethod.WEIGHTED
            ? "weighted_distribution"
            : "priority_based",
          eligibleCount: eligibleAgents.length,
          selectedAgentPendingLeads: selectedAgent?.pendingLeadsCount || 0,
        },
      },
    })

    // Send notifications to agent if lead was assigned
    let notificationsSent = { emailSent: false, smsSent: false }
    if (selectedAgent) {
      try {
        const agentProfile = await prisma.agentProfile.findUnique({
          where: { agentId: selectedAgent.id },
          select: { email: true, phone: true },
        })

        const agentEmail = agentProfile?.email || selectedAgent.email
        const agentPhone = agentProfile?.phone || null

        notificationsSent = await notifyAgentAboutLead(agentEmail, agentPhone, {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          state: state,
          leadId: lead.id,
        })
      } catch (error) {
        // Log error but don't fail the request
        console.error("Error sending notifications:", error)
      }
    }

    // Generate agent landing page URL for redirect
    const redirectUrl = selectedAgent
      ? getAgentLandingPageUrl(
          selectedAgent.id,
          selectedAgent.firstName,
          selectedAgent.lastName,
          request.headers.get("origin") || undefined
        )
      : null

    // Return response with redirect URL
    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        agentId: lead.agentId,
        status: lead.status,
      },
      routing: {
        method: routingConfig.method,
        eligibleAgentsCount: eligibleAgents.length,
        selectedAgentId: selectedAgent?.id || null,
      },
      redirect: {
        url: redirectUrl,
        agentId: selectedAgent?.id || null,
      },
      notifications: notificationsSent,
    })
  } catch (error) {
    console.error("Error submitting lead:", error)
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    )
  }
}

