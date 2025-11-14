// Notification service for email and SMS
// Ready for Telnyx integration

interface NotificationOptions {
  to: string
  subject?: string
  message: string
  leadData?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    state: string
  }
}

/**
 * Send email notification
 * TODO: Integrate with email service (SendGrid, Resend, etc.)
 */
export async function sendEmailNotification(options: NotificationOptions): Promise<boolean> {
  try {
    // Placeholder for email service integration
    console.log("📧 Email notification:", {
      to: options.to,
      subject: options.subject || "New Lead Assigned",
      message: options.message,
    })

    // In production, integrate with email service:
    // await emailService.send({
    //   to: options.to,
    //   subject: options.subject || "New Lead Assigned",
    //   html: options.message,
    // })

    return true
  } catch (error) {
    console.error("Error sending email notification:", error)
    return false
  }
}

/**
 * Send SMS notification via Telnyx
 * TODO: Integrate with Telnyx API
 */
export async function sendSMSNotification(options: NotificationOptions): Promise<boolean> {
  try {
    // Placeholder for Telnyx integration
    console.log("📱 SMS notification:", {
      to: options.to,
      message: options.message,
    })

    // In production, integrate with Telnyx:
    // const telnyx = new Telnyx(process.env.TELNYX_API_KEY)
    // await telnyx.messages.create({
    //   from: process.env.TELNYX_PHONE_NUMBER,
    //   to: options.to,
    //   text: options.message,
    // })

    return true
  } catch (error) {
    console.error("Error sending SMS notification:", error)
    return false
  }
}

/**
 * Notify agent about new lead assignment
 */
export async function notifyAgentAboutLead(
  agentEmail: string,
  agentPhone: string | null,
  leadData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    state: string
    leadId: string
  }
): Promise<{ emailSent: boolean; smsSent: boolean }> {
  const emailMessage = `
    <h2>New Lead Assigned</h2>
    <p>You have been assigned a new lead:</p>
    <ul>
      <li><strong>Name:</strong> ${leadData.firstName} ${leadData.lastName}</li>
      <li><strong>Email:</strong> ${leadData.email}</li>
      <li><strong>Phone:</strong> ${leadData.phone}</li>
      <li><strong>State:</strong> ${leadData.state}</li>
      <li><strong>Lead ID:</strong> ${leadData.leadId}</li>
    </ul>
    <p>Please contact them as soon as possible.</p>
  `

  const smsMessage = `New lead: ${leadData.firstName} ${leadData.lastName} (${leadData.phone}) - ${leadData.state}. Lead ID: ${leadData.leadId}`

  const [emailSent, smsSent] = await Promise.all([
    sendEmailNotification({
      to: agentEmail,
      subject: "New Lead Assigned - Action Required",
      message: emailMessage,
      leadData,
    }),
    agentPhone
      ? sendSMSNotification({
          to: agentPhone,
          message: smsMessage,
          leadData,
        })
      : Promise.resolve(false),
  ])

  return { emailSent, smsSent }
}

