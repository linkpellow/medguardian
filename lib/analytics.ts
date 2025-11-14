// Analytics service for tracking events
// Can be integrated with Google Analytics, Mixpanel, etc.

export type AnalyticsEvent = 
  | { type: "page_view"; path: string; title?: string }
  | { type: "form_submit"; agentId: string; leadId: string }
  | { type: "form_start"; agentId: string }
  | { type: "form_step"; agentId: string; step: number }
  | { type: "lead_assigned"; agentId: string; leadId: string }

/**
 * Track analytics event
 */
export function trackEvent(event: AnalyticsEvent) {
  // In production, send to analytics service
  if (typeof window !== "undefined") {
    // Google Analytics example:
    // if (window.gtag) {
    //   window.gtag("event", event.type, {
    //     ...event,
    //   })
    // }

    // Log for development
    console.log("📊 Analytics:", event)
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  trackEvent({ type: "page_view", path, title })
}

/**
 * Track form submission
 */
export function trackFormSubmit(agentId: string, leadId: string) {
  trackEvent({ type: "form_submit", agentId, leadId })
}

/**
 * Track form start
 */
export function trackFormStart(agentId: string) {
  trackEvent({ type: "form_start", agentId })
}

/**
 * Track form step
 */
export function trackFormStep(agentId: string, step: number) {
  trackEvent({ type: "form_step", agentId, step })
}

/**
 * Track lead assignment
 */
export function trackLeadAssigned(agentId: string, leadId: string) {
  trackEvent({ type: "lead_assigned", agentId, leadId })
}

