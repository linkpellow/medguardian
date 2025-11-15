/**
 * Shared Landing Page Renderer Component
 * 
 * Single source of truth for rendering landing pages.
 * Used by both builder preview and public live page to ensure 100% consistency.
 * 
 * Industry Standard Pattern: One component, multiple modes
 */

"use client"

import React from "react"
import { LayoutRenderer } from "./LayoutRenderer"
import { BackgroundRenderer } from "./BackgroundRenderer"
import { FontLoader } from "@/components/FontLoader"
import ParticleBackground from "@/components/ParticleBackground"
import { LandingPageConfig, EnhancedSectionConfig } from "@/types/layouts"
import { buildSectionConfig, getEnabledSections, extractSectionColors } from "@/lib/layouts/section-config"

interface AgentData {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  profile?: {
    photo: string | null
    bio: string | null
    title: string | null
    phone: string | null
  } | null
  licenses?: Array<{ state: string }>
}

interface LandingPageRendererProps {
  config: LandingPageConfig
  agentData?: AgentData
  mode?: "preview" | "live"
  primaryColor?: string
  secondaryColor?: string
  onSectionClick?: (sectionId: string) => void
  selectedSection?: string | null
  isEditable?: boolean
  onTextEdit?: (sectionId: string, field: string, value: string) => void
  className?: string
  containerClassName?: string
  previewMode?: "desktop" | "tablet" | "mobile"
}

export function LandingPageRenderer({
  config,
  agentData,
  mode = "live",
  primaryColor: fallbackPrimary = "#00d9ff",
  secondaryColor: fallbackSecondary = "#00a8cc",
  onSectionClick,
  selectedSection,
  isEditable = false,
  onTextEdit,
  className = "",
  containerClassName = "",
  previewMode,
}: LandingPageRendererProps) {
  // Parse config if it's a string (for live page)
  let parsedConfig: LandingPageConfig = config
  if (typeof config === "string") {
    try {
      parsedConfig = JSON.parse(config)
    } catch (error) {
      console.error("Failed to parse landing page config:", error)
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/60">Error loading landing page configuration.</p>
        </div>
      )
    }
  }

  // Color priority: prop (from config theme) > config theme > agent profile > fallback
  // This ensures builder edits (saved to config.theme) are reflected in renderer
  // Use nullish coalescing to handle empty strings correctly
  const primaryColor = 
    fallbackPrimary ?? 
    parsedConfig?.theme?.primaryColor ?? 
    agentData?.profile?.primaryColor ?? 
    "#00d9ff"
  
  const secondaryColor = 
    fallbackSecondary ?? 
    parsedConfig?.theme?.secondaryColor ?? 
    agentData?.profile?.secondaryColor ?? 
    "#00a8cc"

  // Get enabled sections in order
  const enabledSections = getEnabledSections(parsedConfig)

  // Render wrapper based on mode
  const renderWrapper = (content: React.ReactNode) => {
    if (mode === "preview") {
      // Preview mode: Simple container, no particles
      return (
        <div className={`h-full w-full overflow-hidden ${className}`}>
          <BackgroundRenderer background={parsedConfig.globalBackground} className="h-full w-full">
            <div
              className="h-full w-full overflow-hidden"
              style={
                !parsedConfig.globalBackground
                  ? {
                      background: `linear-gradient(to bottom right, ${parsedConfig.theme.pageBackground}, ${parsedConfig.theme.sectionBackground})`,
                    }
                  : {}
              }
            >
              {content}
            </div>
          </BackgroundRenderer>
        </div>
      )
    } else {
      // Live mode: Full experience with particles
      return (
        <div className={`min-h-screen w-full relative overflow-x-hidden ${className}`}>
          {/* Particle Background - Only in live mode */}
          <ParticleBackground color={primaryColor} particleCount={60} speed={0.5} />

          {/* Dark gradient overlay - Semi-transparent to show particles but maintain readability */}
          <div
            className="fixed inset-0 z-[1]"
            style={{
              background: parsedConfig.globalBackground
                ? "transparent"
                : `linear-gradient(to bottom right, ${parsedConfig.theme.pageBackground}cc, ${parsedConfig.theme.sectionBackground}cc)`,
            }}
          />

          {/* Custom background renderer if specified */}
          {parsedConfig.globalBackground && (
            <div className="fixed inset-0 z-[1]">
              <BackgroundRenderer background={parsedConfig.globalBackground} className="w-full h-full">
                <div className="w-full h-full" />
              </BackgroundRenderer>
            </div>
          )}

          {/* Content Layer - Above particles and overlays */}
          <div className="relative z-10">{content}</div>
        </div>
      )
    }
  }

  return renderWrapper(
    <>
      <FontLoader fonts={parsedConfig.branding.fonts} />
      <div
        className={`container mx-auto w-full max-w-7xl ${
          previewMode === "mobile" 
            ? "px-2 pt-2 sm:pt-3 pb-0 mobile-preview" 
            : "px-3 sm:px-4 md:px-6 pt-6 sm:pt-8 md:pt-12 lg:pt-16 pb-0"
        } ${containerClassName}`}
        style={{
          ...(parsedConfig.branding.fonts &&
          parsedConfig.branding.fonts.length > 0 &&
          parsedConfig.branding.fonts[0]?.family
            ? {
                fontFamily: `"${parsedConfig.branding.fonts[0].family}", sans-serif`,
              }
            : {}),
          textAlign: parsedConfig.textAlignment || "left",
        }}
      >
        {previewMode === "mobile" && (
          <style dangerouslySetInnerHTML={{
            __html: `
              .mobile-preview h1,
              .mobile-preview [class*="text-4xl"],
              .mobile-preview [class*="text-5xl"],
              .mobile-preview [class*="text-6xl"],
              .mobile-preview [class*="text-7xl"] {
                font-size: clamp(1.25rem, 4vw, 1.75rem) !important;
                line-height: 1.3 !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .mobile-preview h2,
              .mobile-preview [class*="text-3xl"] {
                font-size: clamp(1.1rem, 3.5vw, 1.5rem) !important;
                line-height: 1.3 !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .mobile-preview h3,
              .mobile-preview [class*="text-2xl"] {
                font-size: clamp(1rem, 3vw, 1.25rem) !important;
                line-height: 1.3 !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .mobile-preview [class*="text-xl"] {
                font-size: clamp(0.9rem, 2.5vw, 1.1rem) !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .mobile-preview [class*="text-lg"] {
                font-size: clamp(0.85rem, 2.2vw, 1rem) !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .mobile-preview p,
              .mobile-preview [class*="text-base"],
              .mobile-preview [class*="text-sm"],
              .mobile-preview span,
              .mobile-preview div {
                font-size: clamp(0.7rem, 2vw, 0.85rem) !important;
                line-height: 1.4 !important;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .mobile-preview [class*="mb-4"],
              .mobile-preview [class*="mb-6"],
              .mobile-preview [class*="mb-8"],
              .mobile-preview [class*="mb-10"],
              .mobile-preview [class*="mb-12"] {
                margin-bottom: 0.5rem !important;
              }
              .mobile-preview [class*="mt-4"],
              .mobile-preview [class*="mt-6"],
              .mobile-preview [class*="mt-8"],
              .mobile-preview [class*="mt-10"],
              .mobile-preview [class*="mt-12"] {
                margin-top: 0.5rem !important;
              }
              .mobile-preview [class*="py-6"],
              .mobile-preview [class*="py-8"],
              .mobile-preview [class*="py-12"],
              .mobile-preview [class*="py-16"] {
                padding-top: 0.5rem !important;
                padding-bottom: 0.5rem !important;
              }
              .mobile-preview [class*="gap-4"],
              .mobile-preview [class*="gap-6"],
              .mobile-preview [class*="gap-8"] {
                gap: 0.5rem !important;
              }
              .mobile-preview [class*="space-y-4"] > * + *,
              .mobile-preview [class*="space-y-6"] > * + *,
              .mobile-preview [class*="space-y-8"] > * + * {
                margin-top: 0.5rem !important;
              }
            `
          }} />
        )}
        {enabledSections.map((section) => {
          const sectionConfig = parsedConfig.sections.find((s) => s.id === section.id) as EnhancedSectionConfig

          // Use shared utility to build section config - ensures consistency
          const finalSectionConfig = buildSectionConfig(
            section.id,
            sectionConfig,
            parsedConfig,
            primaryColor,
            secondaryColor
          )

          // Extract colors using shared utility for consistency
          const {
            primaryColor: sectionPrimaryColor,
            secondaryColor: sectionSecondaryColor,
            accentColor: sectionAccentColor,
          } = extractSectionColors(sectionConfig, parsedConfig.theme, primaryColor, secondaryColor)

          // Handler for text editing (preview mode only)
          const handleTextEdit = onTextEdit
            ? (field: string, value: string) => {
                onTextEdit(section.id, field, value)
              }
            : undefined

          // Footer sections should have no bottom margin
          const isFooter = section.id === "footer"
          
          return (
            <div
              key={section.id}
              className={`${
                isFooter 
                  ? "mb-0" 
                  : previewMode === "mobile" 
                    ? "mb-2 sm:mb-3" 
                    : "mb-8 sm:mb-10 md:mb-12"
              } ${mode === "preview" && onSectionClick ? "cursor-pointer group relative" : ""}`}
              onClick={mode === "preview" && onSectionClick ? () => onSectionClick(section.id) : undefined}
            >
              {/* Selection indicator for preview mode */}
              {mode === "preview" && selectedSection === section.id && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-lg z-10"
                  style={{
                    boxShadow: `inset 0 0 0 2px ${primaryColor}`,
                  }}
                />
              )}

              <LayoutRenderer
                sectionId={section.id}
                config={finalSectionConfig}
                agentData={
                  agentData
                    ? {
                        id: agentData.id,
                        firstName: agentData.firstName,
                        lastName: agentData.lastName,
                        email: agentData.email,
                        profile: agentData.profile,
                        licenses: agentData.licenses,
                      }
                    : undefined
                }
                primaryColor={sectionPrimaryColor}
                secondaryColor={sectionSecondaryColor}
                accentColor={sectionAccentColor}
                theme={parsedConfig.theme}
                onTextEdit={handleTextEdit}
                isEditable={isEditable}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

