import { Agent, RoutingMethod } from "@prisma/client"

export interface RoutingConfig {
  method: RoutingMethod
  weightedAgents?: Array<{ agentId: string; weight: number }>
}

export interface EligibleAgent extends Agent {
  leads: Array<{ id: string }>
  pendingLeadsCount: number
}

/**
 * Routes a lead to an agent based on the specified routing method
 */
export function routeLead(
  eligibleAgents: EligibleAgent[],
  config: RoutingConfig
): EligibleAgent | null {
  if (eligibleAgents.length === 0) {
    return null
  }

  if (eligibleAgents.length === 1) {
    return eligibleAgents[0]
  }

  switch (config.method) {
    case RoutingMethod.ROUND_ROBIN:
      return routeRoundRobin(eligibleAgents)

    case RoutingMethod.WEIGHTED:
      return routeWeighted(eligibleAgents, config.weightedAgents || [])

    case RoutingMethod.PRIORITY:
      return routePriority(eligibleAgents)

    default:
      // Default to round-robin
      return routeRoundRobin(eligibleAgents)
  }
}

/**
 * Round-robin routing: Selects agent with fewest pending leads
 * If tied, selects the first agent alphabetically by last name
 */
function routeRoundRobin(agents: EligibleAgent[]): EligibleAgent {
  // Sort by pending leads count (ascending), then by last name
  const sorted = [...agents].sort((a, b) => {
    const leadDiff = a.pendingLeadsCount - b.pendingLeadsCount
    if (leadDiff !== 0) return leadDiff
    return a.lastName.localeCompare(b.lastName)
  })

  return sorted[0]
}

/**
 * Weighted routing: Selects agent based on assigned weights
 * Agents with higher weights are more likely to be selected
 */
function routeWeighted(
  agents: EligibleAgent[],
  weights: Array<{ agentId: string; weight: number }>
): EligibleAgent {
  // Create a map of agent weights
  const weightMap = new Map(
    weights.map((w) => [w.agentId, w.weight])
  )

  // Calculate total weight
  let totalWeight = 0
  const agentWeights = agents.map((agent) => {
    const weight = weightMap.get(agent.id) || 1 // Default weight of 1
    totalWeight += weight
    return { agent, weight, cumulativeWeight: 0 }
  })

  // Calculate cumulative weights
  let cumulative = 0
  agentWeights.forEach((aw) => {
    cumulative += aw.weight
    aw.cumulativeWeight = cumulative
  })

  // Select random number between 0 and totalWeight
  const random = Math.random() * totalWeight

  // Find agent based on cumulative weight
  for (const aw of agentWeights) {
    if (random <= aw.cumulativeWeight) {
      return aw.agent
    }
  }

  // Fallback to first agent
  return agents[0]
}

/**
 * Priority routing: Selects agent based on priority order
 * Agents are sorted by a priority score (could be based on performance, etc.)
 * For now, uses pending leads count as priority (fewer = higher priority)
 */
function routePriority(agents: EligibleAgent[]): EligibleAgent {
  // Sort by pending leads (ascending = higher priority)
  const sorted = [...agents].sort(
    (a, b) => a.pendingLeadsCount - b.pendingLeadsCount
  )

  return sorted[0]
}

/**
 * Gets the default routing configuration
 * In production, this could be stored in database or environment variables
 */
export function getDefaultRoutingConfig(): RoutingConfig {
  // Default to round-robin
  // Can be overridden by environment variable or database config
  const method = (process.env.ROUTING_METHOD as RoutingMethod) || RoutingMethod.ROUND_ROBIN

  return {
    method,
    // Weighted agents could be loaded from database
    weightedAgents: [],
  }
}

/**
 * Generates the agent landing page URL
 * Uses agent slug (firstname-lastname) or falls back to agentId
 */
export function getAgentLandingPageUrl(
  agentId: string,
  firstName?: string,
  lastName?: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const slug = firstName && lastName
    ? `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
    : agentId
  return `${base}/agent/${slug}`
}

