"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, Layout, Save, Loader2, Upload, X, 
  Smartphone, Monitor, Tablet, Edit2, Settings, Eye, EyeOff, 
  ChevronRight, ChevronLeft, Award, MapPin, Phone, Mail, MessageSquare,
  Undo2, Redo2, Copy, RotateCcw, Zap, FileText, Layers, Sparkles, 
  CheckCircle2, Circle, ZoomIn, ZoomOut, RefreshCw, ExternalLink
} from "lucide-react"
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { LayoutRenderer } from "@/components/layouts/LayoutRenderer"
import { LandingPageRenderer } from "@/components/layouts/LandingPageRenderer"
import { EnhancedSectionConfig, LandingPageConfig, ColorTheme, BackgroundConfig } from "@/types/layouts"
import { getLayoutsByCategory, getDefaultLayoutId } from "@/lib/layouts/registry"
import { getEnabledSections } from "@/lib/layouts/section-config"
import { useUndoRedo } from "@/lib/undo-redo/UndoRedoProvider"
import { ColorInput } from "@/components/ui/color-input"
import { IconPicker, renderIcon } from "@/components/ui/icon-picker"
import { BackgroundRenderer } from "@/components/layouts/BackgroundRenderer"
import { FontLoader } from "@/components/FontLoader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

// Import existing interfaces and constants
interface SectionConfig {
  id: string
  component: string
  label: string
  enabled: boolean
  order: number
  config?: Record<string, any>
  layout?: string
}

interface LandingPageBuilderProps {
  agentId: string
  currentConfig?: LandingPageConfig
  agentData?: {
    firstName: string
    lastName: string
    email: string
    profile?: {
      photo: string | null
      bio: string | null
      title: string | null
      phone: string | null
    } | null
    licenses?: Array<{ state: string }>
  }
}

const AVAILABLE_SECTIONS: Omit<SectionConfig, "order">[] = [
  { id: "header", component: "header", label: "Header", enabled: true },
  { id: "hero", component: "hero", label: "Hero Section", enabled: true },
  { id: "stats", component: "stats", label: "Stats Cards", enabled: true },
  { id: "testimonials", component: "testimonials", label: "Testimonials", enabled: false },
  { id: "contact", component: "contact", label: "Contact Form", enabled: true },
  { id: "maps", component: "maps", label: "Maps", enabled: false },
  { id: "custom-html", component: "custom-html", label: "Custom HTML", enabled: false },
  { id: "footer", component: "footer", label: "Footer", enabled: true },
]

function getDefaultLayoutForSection(sectionId: string): string {
  return getDefaultLayoutId(sectionId as any) || ""
}

const DEFAULT_COLOR_THEME: ColorTheme = {
  primaryColor: "#00d9ff",
  secondaryColor: "#00a8cc",
  accentColor: "#00ffaa",
  pageBackground: "#0a0e27",
  sectionBackground: "#0f1629",
  cardBackground: "#0f1629",
  overlayBackground: "rgba(0, 0, 0, 0.4)",
  headingColor: "#ffffff",
  bodyColor: "rgba(255, 255, 255, 0.7)",
  mutedColor: "rgba(255, 255, 255, 0.5)",
  linkColor: "#00d9ff",
  borderColor: "rgba(0, 217, 255, 0.2)",
  shadowColor: "rgba(0, 0, 0, 0.3)",
  successColor: "#00ffaa",
  errorColor: "#ff4444",
  warningColor: "#ffaa00",
  infoColor: "#00d9ff",
  spacing: "normal",
}

const TEMPLATES = {
  medical: {
    name: "Medical",
    description: "Clinical, professional, trust-focused",
    sections: ["header", "hero", "stats", "testimonials", "contact", "maps", "custom-html", "footer"],
    theme: {
      ...DEFAULT_COLOR_THEME,
      primaryColor: "#00d9ff",
      secondaryColor: "#00a8cc",
      accentColor: "#00ffaa",
      spacing: "normal",
    },
  },
  corporate: {
    name: "Corporate",
    description: "Professional, business-focused",
    sections: ["header", "hero", "stats", "contact", "maps", "custom-html", "footer"],
    theme: {
      ...DEFAULT_COLOR_THEME,
      primaryColor: "#0B294B",
      secondaryColor: "#7AB8FF",
      accentColor: "#F5C242",
      spacing: "spacious",
    },
  },
  modern: {
    name: "Modern",
    description: "Clean, minimalist, contemporary",
    sections: ["header", "hero", "testimonials", "contact", "maps", "custom-html", "footer"],
    theme: {
      ...DEFAULT_COLOR_THEME,
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      accentColor: "#ec4899",
      spacing: "compact",
    },
  },
}

const MEDICAL_COLOR_PRESETS = {
  blue: { name: "Medical Blue", primary: "#00d9ff", secondary: "#00a8cc", accent: "#00ffaa" },
  cyan: { name: "Cyan", primary: "#00ffff", secondary: "#00b8d4", accent: "#00e5ff" },
  jade: { name: "Jade", primary: "#00ffaa", secondary: "#00cc88", accent: "#00d9ff" },
  white: { name: "Clinical White", primary: "#ffffff", secondary: "#f0f0f0", accent: "#00d9ff" },
}

type PreviewMode = "desktop" | "tablet" | "mobile"
type TabType = "templates" | "branding" | "colors" | "layout"
type ZoomLevel = 100 | 125 | 150

// Legacy useHistory hook - kept for backward compatibility if needed
// Now using global useUndoRedo instead

// Enhanced Color Picker Component
function EnhancedColorPicker({
  label,
  value,
  onChange,
  onReset,
  presets,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  onReset?: () => void
  presets?: Array<{ name: string; value: string }>
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <Label className="text-[#00d9ff]/70 mb-2 block text-xs font-light">{label}</Label>
      
      {/* Large Color Swatch */}
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 rounded-lg border-2 border-[#00d9ff]/30 cursor-pointer hover:border-[#00d9ff]/60 transition-all"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-picker-${label}`)?.click()}
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              id={`color-picker-${label}`}
              type="color"
              value={value.startsWith("#") ? value : "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 cursor-pointer"
            />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white font-mono text-xs h-8"
              placeholder="#000000"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              title="Copy color"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 w-8 p-0"
                title="Reset to default"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange(preset.value)}
              className="px-2 py-1 text-xs rounded border border-[#00d9ff]/20 hover:border-[#00d9ff]/40 transition-colors"
              style={{ color: preset.value }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LandingPageBuilderRefactored({ agentId, currentConfig, agentData }: LandingPageBuilderProps) {
  // Helper to merge missing sections into config
  const mergeMissingSections = (configToMerge: LandingPageConfig): LandingPageConfig => {
    const existingSectionIds = new Set(configToMerge.sections?.map((s) => s.id) || [])
    const missingSections = AVAILABLE_SECTIONS
      .filter(s => !existingSectionIds.has(s.id))
      .map((s, i) => ({
        ...s,
        order: (configToMerge.sections?.length || 0) + i,
        layout: getDefaultLayoutForSection(s.id)
      }))
    
    if (missingSections.length > 0) {
      return {
        ...configToMerge,
        sections: [...(configToMerge.sections || []), ...missingSections]
      }
    }
    return configToMerge
  }

  // State
  const [config, setConfig] = useState<LandingPageConfig>(
    currentConfig ? mergeMissingSections(currentConfig) : {
      template: "medical",
      sections: AVAILABLE_SECTIONS.map((s, i) => ({ 
        ...s, 
        order: i,
        layout: getDefaultLayoutForSection(s.id)
      })),
      branding: {
        logo: null,
        logoUrl: null,
        companyName: agentData ? `${agentData.firstName} ${agentData.lastName}` : "MedGuardian",
        tagline: "Your trusted insurance partner",
      },
      theme: { ...DEFAULT_COLOR_THEME, ...TEMPLATES.medical.theme, spacing: (TEMPLATES.medical.theme.spacing || "normal") as "normal" | "compact" | "spacious" },
      content: {
        hero: {
          headline: agentData ? `${agentData.firstName} ${agentData.lastName}` : "Agent Name",
          subheadline: agentData?.profile?.bio || "Your trusted insurance partner",
          ctaText: "Get Started",
        },
          stats: [
            { label: "Years Experience", value: "10+", icon: "Award" },
            { label: "States Licensed", value: agentData?.licenses?.length?.toString() || "5", icon: "MapPin" },
            { label: "Happy Clients", value: "500+", icon: "Award" },
          ],
        testimonials: [
          { name: "Client 1", text: "Excellent service and attention to detail. Highly recommend!" },
          { name: "Client 2", text: "Professional, responsive, and truly cares about clients." },
        ],
      },
    }
  )

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!currentConfig) // Load config if not provided
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" })
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile")
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(100)
  const [activeTab, setActiveTab] = useState<TabType>("templates")
  const [isPublished, setIsPublished] = useState(false)
  const [editingElement, setEditingElement] = useState<string | null>(null)
  

  // Load saved config on mount if not provided
  useEffect(() => {
    if (!currentConfig && agentId) {
      async function loadConfig() {
        try {
          setLoading(true)
          const response = await fetch(`/api/agent/landing-config?agentId=${agentId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.config) {
              // Merge in any missing sections from AVAILABLE_SECTIONS
              const mergedConfig = mergeMissingSections(data.config)
              setConfig(mergedConfig)
              setIsPublished(data.published || false)
            }
          }
        } catch (error) {
          console.error("Error loading config:", error)
        } finally {
          setLoading(false)
        }
      }
      loadConfig()
    } else if (currentConfig) {
      // Config provided via props, check if it's published
      async function checkPublished() {
        try {
          const response = await fetch(`/api/agent/landing-config?agentId=${agentId}`)
          if (response.ok) {
            const data = await response.json()
            setIsPublished(data.published || false)
          }
        } catch (error) {
          console.error("Error checking published status:", error)
        }
      }
      checkPublished()
      setLoading(false)
    }
  }, [agentId, currentConfig])


  // Global Undo/Redo
  const undoRedo = useUndoRedo("landing-page-builder", config, {
    maxHistorySize: 50,
    debounceMs: 300,
  })
  const isUpdatingFromHistory = useRef(false)
  
  // Push state changes to history (debounced automatically)
  useEffect(() => {
    if (!isUpdatingFromHistory.current) {
      undoRedo.pushState(config)
    }
  }, [config, undoRedo])

  // Listen for global undo/redo keyboard shortcuts
  useEffect(() => {
    const handleUndo = (event: CustomEvent) => {
      if (event.detail.contextId === "landing-page-builder") {
        const prevState = undoRedo.undo()
        if (prevState) {
          isUpdatingFromHistory.current = true
          setConfig(prevState)
          setTimeout(() => {
            isUpdatingFromHistory.current = false
          }, 100)
        }
      }
    }

    const handleRedo = (event: CustomEvent) => {
      if (event.detail.contextId === "landing-page-builder") {
        const nextState = undoRedo.redo()
        if (nextState) {
          isUpdatingFromHistory.current = true
          setConfig(nextState)
          setTimeout(() => {
            isUpdatingFromHistory.current = false
          }, 100)
        }
      }
    }

    window.addEventListener("undo-redo:undo", handleUndo as EventListener)
    window.addEventListener("undo-redo:redo", handleRedo as EventListener)

    return () => {
      window.removeEventListener("undo-redo:undo", handleUndo as EventListener)
      window.removeEventListener("undo-redo:redo", handleRedo as EventListener)
    }
  }, [undoRedo])

  const handleUndo = () => {
    const prevState = undoRedo.undo()
    if (prevState) {
      isUpdatingFromHistory.current = true
      setConfig(prevState)
      setTimeout(() => {
        isUpdatingFromHistory.current = false
      }, 100)
    }
  }

  const handleRedo = () => {
    const nextState = undoRedo.redo()
    if (nextState) {
      isUpdatingFromHistory.current = true
      setConfig(nextState)
      setTimeout(() => {
        isUpdatingFromHistory.current = false
      }, 100)
    }
  }

  // Handlers
  const handleConfigChange = (updates: Partial<LandingPageConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  // Section-specific config handler - only updates the selected section
  // Deep merges config objects to preserve existing properties
  const handleSectionConfigChange = useCallback((sectionId: string, sectionUpdates: Partial<EnhancedSectionConfig>) => {
    setConfig((prev) => {
      // Create a new config object to ensure React detects the change
      const newConfig = {
        ...prev,
        sections: prev.sections.map((s) => {
          // Only update the matching section, leave others unchanged
          if (s.id !== sectionId) {
            return s // Return unchanged section - CRITICAL: must return same reference
          }
          
          // Handle config updates separately from other section updates
          if (sectionUpdates.config) {
            // Extract non-config properties from sectionUpdates
            const { config: _, ...otherUpdates } = sectionUpdates
            
            // Merge config properly
            const mergedConfig = s.config 
              ? { ...s.config, ...sectionUpdates.config }  // Deep merge if config exists
              : sectionUpdates.config  // Use new config if none exists
            
            const updated = {
              ...s,
              ...otherUpdates,  // Apply non-config updates
              config: mergedConfig,
            }
            
            return updated
          }
          
          // Otherwise, just merge normally (for non-config updates like layout, background, etc.)
          return { ...s, ...sectionUpdates }
        }),
      }
      
      return newConfig
    })
  }, [])

  const handleTemplateSelect = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey]
    setConfig({
      ...config,
      template: templateKey,
      sections: AVAILABLE_SECTIONS.map((s, i) => ({
        ...s,
        enabled: template.sections.includes(s.id),
        order: i,
        layout: getDefaultLayoutForSection(s.id)
      })),
      theme: { ...template.theme, spacing: (template.theme.spacing || "normal") as "normal" | "compact" | "spacious" },
    })
  }

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId)
    // Scroll to section editor in left panel
    setTimeout(() => {
      const editorElement = document.getElementById('section-editor')
      if (editorElement) {
        editorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
  }


  const handleSave = async (publish: boolean = false) => {
    setSaving(true)
    setSaveStatus({ type: null, message: "" })
    try {
      const response = await fetch("/api/agent/landing-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, config, published: publish }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save" }))
        throw new Error(errorData.details || errorData.error || "Failed to save configuration")
      }
      
      const data = await response.json()
      if (publish) {
        setIsPublished(true)
        setSaveStatus({ type: "success", message: "Landing page published successfully!" })
      } else {
        setSaveStatus({ type: "success", message: "Draft saved successfully!" })
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000)
    } catch (error) {
      console.error("Error saving config:", error)
      setSaveStatus({ 
        type: "error", 
        message: error instanceof Error ? error.message : "Failed to save configuration. Please try again." 
      })
      // Clear error after 5 seconds
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000)
    } finally {
      setSaving(false)
    }
  }

  // Generate agent slug for live page URL
  const getAgentSlug = () => {
    if (!agentData) return null
    const firstName = agentData.firstName?.toLowerCase().replace(/\s+/g, '-') || ''
    const lastName = agentData.lastName?.toLowerCase().replace(/\s+/g, '-') || ''
    return `${firstName}-${lastName}`
  }

  // Open live landing page in new tab
  const handleViewLivePage = () => {
    const slug = getAgentSlug()
    if (!slug) {
      setSaveStatus({ 
        type: "error", 
        message: "Unable to generate landing page URL. Please ensure your profile has a first and last name." 
      })
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000)
      return
    }
    const livePageUrl = `/agent/${slug}`
    window.open(livePageUrl, '_blank', 'noopener,noreferrer')
  }

  const primaryColor = config.theme.primaryColor
  const secondaryColor = config.theme.secondaryColor
  const enabledSections = getEnabledSections(config)

  // Show loading state while fetching config
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e27] via-[#0f1629] to-[#0a1a2e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00d9ff]/20 border-t-[#00d9ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading landing page configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen min-h-0 flex flex-col lg:flex-row gap-4 bg-gradient-to-br from-[#0a0e27] via-[#0f1629] to-[#0a1a2e] w-full overflow-hidden p-4">
      {/* Left Panel - Vertical Tab Navigation */}
      <div className="flex-shrink-0 w-80 flex flex-col border-r border-[#00d9ff]/20">
        {/* Tab Navigation */}
        <div className="flex flex-col gap-1 p-2">
          {[
            { id: "templates" as TabType, label: "Templates", icon: Sparkles },
            { id: "branding" as TabType, label: "Branding", icon: FileText },
            { id: "colors" as TabType, label: "Colors", icon: Palette },
            { id: "layout" as TabType, label: "Layout", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light transition-all ${
                  activeTab === tab.id
                    ? "bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30"
                    : "text-white/60 hover:text-white hover:bg-[#0f1629]/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content - Accordion Modules */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="templates" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Templates
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-2">
                      {Object.entries(TEMPLATES).map(([key, template]) => (
                        <Card
                          key={key}
                          className={`cursor-pointer transition-all p-3 ${
                            config.template === key
                              ? "border-[#00d9ff] bg-[#00d9ff]/10"
                              : "border-[#00d9ff]/20 bg-[#0a0e27]/40"
                          }`}
                          onClick={() => handleTemplateSelect(key as keyof typeof TEMPLATES)}
                        >
                          <div className="text-white text-xs font-light">{template.name}</div>
                          <div className="text-[#00d9ff]/60 text-[10px] mt-1">{template.description}</div>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}

            {activeTab === "branding" && (
              <motion.div
                key="branding"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="branding" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Branding
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Logo</Label>
                        {config.branding.logoUrl ? (
                          <div className="relative">
                            <img src={config.branding.logoUrl} alt="Logo" className="h-20 object-contain bg-white/10 rounded-lg p-2" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConfigChange({ branding: { ...config.branding, logo: null, logoUrl: null } })}
                              className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-[#00d9ff]/30 rounded-lg cursor-pointer hover:border-[#00d9ff]/50 transition-colors">
                            <input type="file" accept="image/*" onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  handleConfigChange({
                                    branding: {
                                      ...config.branding,
                                      logo: reader.result as string,
                                      logoUrl: reader.result as string,
                                    }
                                  })
                                }
                                reader.readAsDataURL(file)
                              }
                            }} className="hidden" />
                            <Upload className="w-5 h-5 text-[#00d9ff]/50 mr-2" />
                            <span className="text-[#00d9ff]/50 text-xs">Upload Logo</span>
                          </label>
                        )}
                      </div>
                      <div>
                        <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Company Name</Label>
                        <Input
                          value={config.branding.companyName}
                          onChange={(e) => handleConfigChange({ branding: { ...config.branding, companyName: e.target.value } })}
                          className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Tagline</Label>
                        <Input
                          value={config.branding.tagline}
                          onChange={(e) => handleConfigChange({ branding: { ...config.branding, tagline: e.target.value } })}
                          className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fonts" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Custom Fonts
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <p className="text-[#00d9ff]/50 text-[10px] mb-3">Upload custom font files to use throughout your landing page</p>
                      
                      {(config.branding.fonts || []).map((font, index) => (
                        <div key={index} className="p-4 bg-[#0a0e27]/40 rounded-lg border border-[#00d9ff]/20 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-[#00d9ff]/70 text-xs">Font {index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFonts = [...(config.branding.fonts || [])]
                                newFonts.splice(index, 1)
                                handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                              }}
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div>
                            <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Font Family Name</Label>
                            <Input
                              value={font.family}
                              onChange={(e) => {
                                const newFonts = [...(config.branding.fonts || [])]
                                newFonts[index] = { ...font, family: e.target.value }
                                handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                              }}
                              className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                              placeholder="My Custom Font"
                            />
                          </div>

                          <div>
                            <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Font File</Label>
                            {font.file ? (
                              <div className="relative">
                                <div className="p-3 bg-[#0f1629]/60 rounded-lg border border-[#00d9ff]/20">
                                  <p className="text-white/70 text-xs truncate">{font.name || "Font file loaded"}</p>
                                  <p className="text-[#00d9ff]/50 text-[10px] mt-1">
                                    {font.weight} {font.style} • {font.format.toUpperCase()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFonts = [...(config.branding.fonts || [])]
                                    newFonts[index] = { ...font, file: "", name: "" }
                                    handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                                  }}
                                  className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-[#00d9ff]/30 rounded-lg cursor-pointer hover:border-[#00d9ff]/50 transition-colors">
                                <input
                                  type="file"
                                  accept=".woff,.woff2,.ttf,.otf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        const fileExtension = file.name.split('.').pop()?.toLowerCase() || "woff"
                                        const format = (fileExtension === "woff2" ? "woff2" : fileExtension === "ttf" ? "ttf" : fileExtension === "otf" ? "otf" : "woff") as "woff" | "woff2" | "ttf" | "otf"
                                        
                                        const newFonts = [...(config.branding.fonts || [])]
                                        newFonts[index] = {
                                          ...font,
                                          file: reader.result as string,
                                          name: file.name,
                                          format: format,
                                        }
                                        handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                  className="hidden"
                                />
                                <Upload className="w-5 h-5 text-[#00d9ff]/50 mr-2" />
                                <span className="text-[#00d9ff]/50 text-xs">Upload Font (.woff, .woff2, .ttf, .otf)</span>
                              </label>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Weight</Label>
                              <select
                                value={font.weight}
                                onChange={(e) => {
                                  const newFonts = [...(config.branding.fonts || [])]
                                  newFonts[index] = { ...font, weight: e.target.value }
                                  handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                                }}
                                className="w-full bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9 rounded px-3"
                              >
                                <option value="100">100 (Thin)</option>
                                <option value="200">200 (Extra Light)</option>
                                <option value="300">300 (Light)</option>
                                <option value="400">400 (Normal)</option>
                                <option value="500">500 (Medium)</option>
                                <option value="600">600 (Semi Bold)</option>
                                <option value="700">700 (Bold)</option>
                                <option value="800">800 (Extra Bold)</option>
                                <option value="900">900 (Black)</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Style</Label>
                              <select
                                value={font.style}
                                onChange={(e) => {
                                  const newFonts = [...(config.branding.fonts || [])]
                                  newFonts[index] = { ...font, style: e.target.value as "normal" | "italic" }
                                  handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                                }}
                                className="w-full bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9 rounded px-3"
                              >
                                <option value="normal">Normal</option>
                                <option value="italic">Italic</option>
                              </select>
                            </div>
                          </div>

                          {font.file && font.family && (
                            <div className="p-3 bg-[#0f1629]/60 rounded-lg border border-[#00d9ff]/20">
                              <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Preview</Label>
                              <p
                                className="text-white text-lg"
                                style={{
                                  fontFamily: `"${font.family}", sans-serif`,
                                  fontWeight: font.weight,
                                  fontStyle: font.style,
                                }}
                              >
                                The quick brown fox jumps over the lazy dog
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newFonts = [...(config.branding.fonts || []), {
                            name: "",
                            family: "",
                            file: "",
                            weight: "400",
                            style: "normal" as const,
                            format: "woff" as const,
                          }]
                          handleConfigChange({ branding: { ...config.branding, fonts: newFonts } })
                        }}
                        className="w-full border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10 text-xs"
                      >
                        + Add Font
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}

            {activeTab === "colors" && (
              <motion.div
                key="colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="primary" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Primary Colors
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <EnhancedColorPicker
                        label="Primary"
                        value={config.theme.primaryColor}
                        onChange={(value) => handleConfigChange({ theme: { ...config.theme, primaryColor: value } })}
                        presets={Object.values(MEDICAL_COLOR_PRESETS).map(p => ({ name: p.name, value: p.primary }))}
                      />
                      <EnhancedColorPicker
                        label="Secondary"
                        value={config.theme.secondaryColor}
                        onChange={(value) => handleConfigChange({ theme: { ...config.theme, secondaryColor: value } })}
                      />
                      <EnhancedColorPicker
                        label="Accent"
                        value={config.theme.accentColor}
                        onChange={(value) => handleConfigChange({ theme: { ...config.theme, accentColor: value } })}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="backgrounds" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Backgrounds
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {/* Global Theme Backgrounds */}
                      <div className="space-y-3">
                        <Label className="text-[#00d9ff]/70 mb-2 block text-xs font-light">Global Theme Backgrounds</Label>
                        {[
                          { key: "pageBackground", label: "Page" },
                          { key: "sectionBackground", label: "Section" },
                          { key: "cardBackground", label: "Card" },
                          { key: "overlayBackground", label: "Overlay" },
                        ].map(({ key, label }) => (
                          <ColorInput
                            key={key}
                            label={label}
                            value={config.theme[key as keyof typeof config.theme] as string}
                            onChange={(value) => handleConfigChange({
                              theme: { ...config.theme, [key]: value }
                            })}
                          />
                        ))}
                      </div>

                      {/* Global Page Background (Wallpaper) */}
                      <div className="space-y-3 pt-4 border-t border-[#00d9ff]/20">
                        <Label className="text-[#00d9ff]/70 mb-2 block text-xs font-light">Page Background (Wallpaper)</Label>
                        <p className="text-[#00d9ff]/50 text-[10px] mb-3">Set a global background image or video for the entire page</p>
                        
                        <div>
                          <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Background Type</Label>
                          <div className="flex gap-2 flex-wrap">
                            {(["solid", "gradient", "image", "video"] as const).map((type) => (
                              <Button
                                key={type}
                                variant={config.globalBackground?.type === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  handleConfigChange({
                                    globalBackground: {
                                      ...config.globalBackground,
                                      type,
                                    },
                                  })
                                }}
                                className="text-xs capitalize"
                              >
                                {type}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Image Background */}
                        {config.globalBackground?.type === "image" && (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Background Image</Label>
                              {config.globalBackground?.image?.url ? (
                                <div className="relative">
                                  <img
                                    src={config.globalBackground.image.url}
                                    alt="Background"
                                    className="w-full h-32 object-cover rounded-lg border border-[#00d9ff]/20"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      handleConfigChange({
                                        globalBackground: config.globalBackground?.type ? {
                                          ...config.globalBackground,
                                          image: undefined,
                                        } : undefined,
                                      })
                                    }}
                                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#00d9ff]/30 rounded-lg cursor-pointer hover:border-[#00d9ff]/50 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                          handleConfigChange({
                                            globalBackground: {
                                              ...config.globalBackground,
                                              type: "image",
                                              image: {
                                                url: reader.result as string,
                                                position: config.globalBackground?.image?.position || "center",
                                                size: config.globalBackground?.image?.size || "cover",
                                                overlay: config.globalBackground?.image?.overlay,
                                              },
                                            },
                                          })
                                        }
                                        reader.readAsDataURL(file)
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <Upload className="w-5 h-5 text-[#00d9ff]/50 mr-2" />
                                  <span className="text-[#00d9ff]/50 text-xs">Upload Image</span>
                                </label>
                              )}
                            </div>
                            {config.globalBackground?.image?.url && (
                              <>
                                <div>
                                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Image Position</Label>
                                  <select
                                    value={config.globalBackground.image.position || "center"}
                                    onChange={(e) => {
                                      if (!config.globalBackground?.image?.url) return
                                      handleConfigChange({
                                        globalBackground: {
                                          ...config.globalBackground,
                                          type: config.globalBackground.type || "image",
                                          image: {
                                            url: config.globalBackground.image.url,
                                            position: e.target.value as any,
                                            size: config.globalBackground.image.size || "cover",
                                            overlay: config.globalBackground.image.overlay,
                                          },
                                        },
                                      })
                                    }}
                                    className="w-full bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9 rounded px-3"
                                  >
                                    <option value="center">Center</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Image Size</Label>
                                  <select
                                    value={config.globalBackground.image.size || "cover"}
                                    onChange={(e) => {
                                      if (!config.globalBackground?.image?.url) return
                                      handleConfigChange({
                                        globalBackground: {
                                          ...config.globalBackground,
                                          type: config.globalBackground.type || "image",
                                          image: {
                                            url: config.globalBackground.image.url,
                                            position: config.globalBackground.image.position || "center",
                                            size: e.target.value as any,
                                            overlay: config.globalBackground.image.overlay,
                                          },
                                        },
                                      })
                                    }}
                                    className="w-full bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9 rounded px-3"
                                  >
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Overlay Color (Optional)</Label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={config.globalBackground.image?.overlay?.color || "#000000"}
                                      onChange={(e) => {
                                        if (!config.globalBackground?.image?.url) return
                                        handleConfigChange({
                                          globalBackground: {
                                            ...config.globalBackground,
                                            type: config.globalBackground.type || "image",
                                            image: {
                                              url: config.globalBackground.image.url,
                                              position: config.globalBackground.image.position || "center",
                                              size: config.globalBackground.image.size || "cover",
                                              overlay: {
                                                color: e.target.value,
                                                opacity: config.globalBackground.image.overlay?.opacity || 0.5,
                                              },
                                            },
                                          },
                                        })
                                      }}
                                      className="w-12 h-9 rounded border border-[#00d9ff]/30 cursor-pointer"
                                    />
                                    <Input
                                      type="number"
                                      min="0"
                                      max="1"
                                      step="0.1"
                                      value={config.globalBackground.image?.overlay?.opacity || 0.5}
                                      onChange={(e) => {
                                        if (!config.globalBackground?.image?.url) return
                                        handleConfigChange({
                                          globalBackground: {
                                            ...config.globalBackground,
                                            type: config.globalBackground.type || "image",
                                            image: {
                                              url: config.globalBackground.image.url,
                                              position: config.globalBackground.image.position || "center",
                                              size: config.globalBackground.image.size || "cover",
                                              overlay: {
                                                color: config.globalBackground.image.overlay?.color || "#000000",
                                                opacity: parseFloat(e.target.value),
                                              },
                                            },
                                          },
                                        })
                                      }}
                                      className="flex-1 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                                      placeholder="0.5"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (!config.globalBackground?.image?.url) return
                                        handleConfigChange({
                                          globalBackground: {
                                            ...config.globalBackground,
                                            type: config.globalBackground.type || "image",
                                            image: {
                                              url: config.globalBackground.image.url,
                                              position: config.globalBackground.image.position || "center",
                                              size: config.globalBackground.image.size || "cover",
                                            },
                                          },
                                        })
                                      }}
                                      className="h-9 px-2 text-xs"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Video Background */}
                        {config.globalBackground?.type === "video" && (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Video URL</Label>
                              <Input
                                value={config.globalBackground?.video?.url || ""}
                                onChange={(e) => {
                                  handleConfigChange({
                                    globalBackground: {
                                      ...config.globalBackground,
                                      type: "video",
                                      video: {
                                        url: e.target.value,
                                        autoplay: config.globalBackground?.video?.autoplay ?? true,
                                        loop: config.globalBackground?.video?.loop ?? true,
                                        muted: config.globalBackground?.video?.muted ?? true,
                                      },
                                    },
                                  })
                                }}
                                className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                                placeholder="https://example.com/video.mp4"
                              />
                            </div>
                            {config.globalBackground?.video?.url && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={config.globalBackground.video?.autoplay ?? true}
                                    onCheckedChange={(checked) => {
                                      if (!config.globalBackground?.video?.url) return
                                      handleConfigChange({
                                        globalBackground: {
                                          ...config.globalBackground,
                                          type: config.globalBackground.type || "video",
                                          video: {
                                            url: config.globalBackground.video.url,
                                            autoplay: checked,
                                            loop: config.globalBackground.video.loop ?? true,
                                            muted: config.globalBackground.video.muted ?? true,
                                          },
                                        },
                                      })
                                    }}
                                    className="data-[state=checked]:bg-[#00d9ff]"
                                  />
                                  <Label className="text-[#00d9ff]/70 text-xs">Autoplay</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={config.globalBackground.video?.loop ?? true}
                                    onCheckedChange={(checked) => {
                                      if (!config.globalBackground?.video?.url) return
                                      handleConfigChange({
                                        globalBackground: {
                                          ...config.globalBackground,
                                          type: config.globalBackground.type || "video",
                                          video: {
                                            url: config.globalBackground.video.url,
                                            autoplay: config.globalBackground.video.autoplay ?? true,
                                            loop: checked,
                                            muted: config.globalBackground.video.muted ?? true,
                                          },
                                        },
                                      })
                                    }}
                                    className="data-[state=checked]:bg-[#00d9ff]"
                                  />
                                  <Label className="text-[#00d9ff]/70 text-xs">Loop</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={config.globalBackground.video?.muted ?? true}
                                    onCheckedChange={(checked) => {
                                      if (!config.globalBackground?.video?.url) return
                                      handleConfigChange({
                                        globalBackground: {
                                          ...config.globalBackground,
                                          type: config.globalBackground.type || "video",
                                          video: {
                                            url: config.globalBackground.video.url,
                                            autoplay: config.globalBackground.video.autoplay ?? true,
                                            loop: config.globalBackground.video.loop ?? true,
                                            muted: checked,
                                          },
                                        },
                                      })
                                    }}
                                    className="data-[state=checked]:bg-[#00d9ff]"
                                  />
                                  <Label className="text-[#00d9ff]/70 text-xs">Muted</Label>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Solid/Gradient Background */}
                        {(config.globalBackground?.type === "solid" || config.globalBackground?.type === "gradient" || !config.globalBackground?.type) && (
                          <div>
                            <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Background Color</Label>
                            <ColorInput
                              label=""
                              value={config.globalBackground?.color || config.theme.pageBackground}
                              onChange={(value) => {
                                handleConfigChange({
                                  globalBackground: {
                                    ...config.globalBackground,
                                    type: "solid",
                                    color: value,
                                  },
                                })
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="text" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Text Colors
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {[
                        { key: "headingColor", label: "Heading" },
                        { key: "bodyColor", label: "Body" },
                        { key: "mutedColor", label: "Muted" },
                        { key: "linkColor", label: "Link" },
                      ].map(({ key, label }) => (
                        <ColorInput
                          key={key}
                          label={label}
                          value={config.theme[key as keyof typeof config.theme] as string}
                          onChange={(value) => handleConfigChange({
                            theme: { ...config.theme, [key]: value }
                          })}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="advanced" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Advanced Colors
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {[
                        { key: "borderColor", label: "Border" },
                        { key: "shadowColor", label: "Shadow" },
                        { key: "successColor", label: "Success" },
                        { key: "errorColor", label: "Error" },
                        { key: "warningColor", label: "Warning" },
                        { key: "infoColor", label: "Info" },
                      ].map(({ key, label }) => (
                        <ColorInput
                          key={key}
                          label={label}
                          value={config.theme[key as keyof typeof config.theme] as string}
                          onChange={(value) => handleConfigChange({
                            theme: { ...config.theme, [key]: value }
                          })}
                        />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}

            {activeTab === "layout" && (
              <motion.div
                key="layout"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Accordion type="single" collapsible className="space-y-4">
                  <AccordionItem value="text-alignment" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Text Alignment
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label className="text-[#00d9ff]/70 mb-3 block text-xs">Text Alignment</Label>
                        <p className="text-[#00d9ff]/50 text-[10px] mb-4">Control how text is aligned throughout your landing page</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant={config.textAlignment === "left" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleConfigChange({ textAlignment: "left" })}
                            className={`text-xs ${
                              config.textAlignment === "left"
                                ? "bg-[#00d9ff] text-white border-[#00d9ff]"
                                : "border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px]">Left</span>
                              <span className="text-[8px] opacity-70">LTR default</span>
                            </div>
                          </Button>
                          
                          <Button
                            variant={config.textAlignment === "right" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleConfigChange({ textAlignment: "right" })}
                            className={`text-xs ${
                              config.textAlignment === "right"
                                ? "bg-[#00d9ff] text-white border-[#00d9ff]"
                                : "border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px]">Right</span>
                              <span className="text-[8px] opacity-70">RTL common</span>
                            </div>
                          </Button>
                          
                          <Button
                            variant={config.textAlignment === "center" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleConfigChange({ textAlignment: "center" })}
                            className={`text-xs ${
                              config.textAlignment === "center"
                                ? "bg-[#00d9ff] text-white border-[#00d9ff]"
                                : "border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px]">Center</span>
                              <span className="text-[8px] opacity-70">Symmetrical</span>
                            </div>
                          </Button>
                          
                          <Button
                            variant={config.textAlignment === "justify" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleConfigChange({ textAlignment: "justify" })}
                            className={`text-xs ${
                              config.textAlignment === "justify"
                                ? "bg-[#00d9ff] text-white border-[#00d9ff]"
                                : "border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px]">Justify</span>
                              <span className="text-[8px] opacity-70">Both edges</span>
                            </div>
                          </Button>
                        </div>
                        
                        <div className="mt-4 p-3 bg-[#0f1629]/60 rounded-lg border border-[#00d9ff]/20">
                          <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Preview</Label>
                          <p 
                            className="text-white text-sm"
                            style={{ textAlign: config.textAlignment || "left" }}
                          >
                            This is a preview of how your text will be aligned. {config.textAlignment === "left" && "Left-aligned text is flush with the left edge, which is the most common alignment for left-to-right languages like English."}
                            {config.textAlignment === "right" && "Right-aligned text is flush with the right edge, commonly used for right-to-left languages or for specific design purposes."}
                            {config.textAlignment === "center" && "Center-aligned text is positioned in the middle, creating a symmetrical and balanced look that works well for headings and short paragraphs."}
                            {config.textAlignment === "justify" && "Justified text is stretched to align evenly with both the left and right margins, creating straight edges on both sides. This works best for longer paragraphs."}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="spacing" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Spacing
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label className="text-[#00d9ff]/70 mb-3 block text-xs">Global Spacing</Label>
                        <p className="text-[#00d9ff]/50 text-[10px] mb-4">Control the overall spacing between elements throughout your landing page</p>
                        <div className="flex gap-2">
                          {(["compact", "normal", "spacious"] as const).map((spacing) => (
                            <Button
                              key={spacing}
                              variant={config.theme.spacing === spacing ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleConfigChange({ theme: { ...config.theme, spacing } })}
                              className={`text-xs capitalize ${
                                config.theme.spacing === spacing
                                  ? "bg-[#00d9ff] text-white border-[#00d9ff]"
                                  : "border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10"
                              }`}
                            >
                              {spacing}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="sections" className="border-[#00d9ff]/20">
                    <AccordionTrigger className="text-white font-light text-sm py-4">
                      Sections
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <DndContext collisionDetection={closestCenter} onDragEnd={(event: DragEndEvent) => {
                        const { active, over } = event
                        if (!over || active.id === over.id) return
                        // Filter to only available sections for drag operations
                        const availableSections = config.sections.filter((s) => 
                          AVAILABLE_SECTIONS.some((as) => as.id === s.id)
                        )
                        const oldIndex = availableSections.findIndex((s) => s.id === active.id)
                        const newIndex = availableSections.findIndex((s) => s.id === over.id)
                        if (oldIndex === -1 || newIndex === -1) return
                        const newSections = [...availableSections]
                        const [moved] = newSections.splice(oldIndex, 1)
                        newSections.splice(newIndex, 0, moved)
                        // Keep non-available sections in their original positions
                        const nonAvailableSections = config.sections.filter((s) => 
                          !AVAILABLE_SECTIONS.some((as) => as.id === s.id)
                        )
                        setConfig({
                          ...config,
                          sections: [...newSections, ...nonAvailableSections].map((s, i) => ({ ...s, order: i })),
                        })
                      }}>
                        <SortableContext
                          items={config.sections
                            .filter((s) => AVAILABLE_SECTIONS.some((as) => as.id === s.id))
                            .map((s) => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {config.sections
                              .filter((section) => AVAILABLE_SECTIONS.some((as) => as.id === section.id))
                              .map((section) => (
                              <SortableSectionItem
                                key={section.id}
                                section={section}
                                onToggle={(id) => {
                                  setConfig({
                                    ...config,
                                    sections: config.sections.map((s) =>
                                      s.id === id ? { ...s, enabled: !s.enabled } : s
                                    ),
                                  })
                                }}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )}

            {/* Section Editor - Inline at bottom of left panel */}
            <div id="section-editor" className="mt-6 pt-6 border-t border-[#00d9ff]/20">
              <Accordion 
                type="single" 
                collapsible 
                value={selectedSection ? "section-editor" : undefined}
                onValueChange={(value) => {
                  if (!value) {
                    setSelectedSection(null)
                  }
                }}
                className="space-y-4"
              >
                <AccordionItem value="section-editor" className="border-[#00d9ff]/20">
                  <AccordionTrigger className="text-white font-light text-sm py-3">
                    <div className="flex items-center gap-2">
                      <span>Edit Section</span>
                      {selectedSection && (
                        <Badge className="bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30 text-[10px] px-2 py-0.5">
                          {config.sections.find(s => s.id === selectedSection)?.label || "Selected"}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    {selectedSection ? (
                <div className="space-y-4">
                        <SectionEditor
                          sectionId={selectedSection}
                          config={config}
                          onConfigChange={handleConfigChange}
                          onSectionConfigChange={handleSectionConfigChange}
                        />
                        <div className="pt-4 border-t border-[#00d9ff]/20">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSection(null)}
                            className="w-full border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10 text-xs"
                          >
                            Close Editor
                          </Button>
                </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/40 text-xs mb-2">No section selected</p>
                        <p className="text-white/30 text-[10px]">Click on a section in the preview to edit it</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

          </AnimatePresence>
        </div>
      </div>

      {/* Center Preview */}
      <div className="flex-1 min-w-0 relative flex flex-col">
        {/* Preview Controls */}
        <div className="flex items-center justify-between p-4 bg-[#0f1629]/60 border-b border-[#00d9ff]/20 mb-6 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Badge variant={isPublished ? "default" : "outline"} className={isPublished ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
              {isPublished ? "Published" : "Draft"}
            </Badge>
            {/* View Live Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewLivePage}
              disabled={!getAgentSlug()}
              className="h-8 px-3 border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10 text-xs gap-2"
              title="View your live landing page as prospects will see it"
            >
              <ExternalLink className="w-3 h-3" />
              View Live Page
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!undoRedo.canUndo}
              className="h-8 w-8 p-0"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!undoRedo.canRedo}
              className="h-8 w-8 p-0"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            {/* Device Toggle */}
            <div className="flex gap-1 bg-[#0a0e27]/60 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode("mobile")}
                className={`h-7 px-2 ${previewMode === "mobile" ? "bg-[#00d9ff]/20 text-[#00d9ff]" : ""}`}
              >
                <Smartphone className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode("tablet")}
                className={`h-7 px-2 ${previewMode === "tablet" ? "bg-[#00d9ff]/20 text-[#00d9ff]" : ""}`}
              >
                <Tablet className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewMode("desktop")}
                className={`h-7 px-2 ${previewMode === "desktop" ? "bg-[#00d9ff]/20 text-[#00d9ff]" : ""}`}
              >
                <Monitor className="w-3 h-3" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(Math.max(100, zoomLevel - 25) as ZoomLevel)}
                disabled={zoomLevel === 100}
                className="h-7 w-7 p-0"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-white/60 w-12 text-center">{zoomLevel}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(Math.min(150, zoomLevel + 25) as ZoomLevel)}
                disabled={zoomLevel === 150}
                className="h-7 w-7 p-0"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>

          </div>
        </div>

        {/* Preview Container with Card - Enhanced with Glow & Shadow */}
        <div 
          className="flex-1 min-h-0 relative rounded-xl border overflow-hidden"
          style={{ 
            backgroundColor: config.theme.cardBackground,
            borderColor: config.theme.borderColor,
            boxShadow: `0 0 60px ${config.theme.shadowColor}, 0 0 20px ${config.theme.primaryColor}20`,
            padding: "24px",
          }}
        >
          {/* Landing page preview - use shared renderer (handles BackgroundRenderer internally) */}
          <div 
            className={`overflow-hidden flex justify-center items-start ${
              previewMode === "desktop" ? "w-full" : "h-full"
            }`}
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              ...(previewMode === "desktop" ? {
                aspectRatio: "16/9",
                maxHeight: "100%",
              } : {
                height: "100%",
                minHeight: 0,
              }),
            }}
          >
            <div 
              className={`overflow-hidden ${
                previewMode === "desktop" ? "w-full h-full" : "h-full w-full"
              }`}
              style={{ 
                width: previewMode === "desktop" ? "100%" : previewMode === "tablet" ? "768px" : "375px",
                maxWidth: "100%",
                maxHeight: previewMode === "desktop" ? "100%" : "100%",
                transition: "width 0.3s ease",
              }}
            >
              <div className="h-full overflow-y-auto hide-scrollbar">
                <LandingPageRenderer
                  config={config}
                  agentData={agentData ? { ...agentData, id: agentId } : undefined}
                  mode="preview"
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  onSectionClick={handleSectionClick}
                  selectedSection={selectedSection}
                  isEditable={true}
                  onTextEdit={(sectionId, field, value) => {
                    const sectionConfig = config.sections.find((s) => s.id === sectionId)
                    const rawSectionConfig = sectionConfig?.config || {}
                    handleSectionConfigChange(sectionId, {
                        config: {
                          ...rawSectionConfig,
                          [field]: value,
                        },
                      })
                  }}
                  className="h-full"
                  containerClassName="h-full overflow-y-auto hide-scrollbar"
                  previewMode={previewMode}
                        />
                      </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 bg-[#0f1629]/60 border-t border-[#00d9ff]/20 mt-6 rounded-b-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving || loading}
              className="border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            {saveStatus.type && (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-light ${
                saveStatus.type === "success" 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {saveStatus.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View Live Page Button - Also in action bar */}
            <Button
              variant="outline"
              onClick={handleViewLivePage}
              disabled={!getAgentSlug()}
              className="border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/10 gap-2"
              title={!isPublished ? "View your landing page (will show draft until published)" : "View your live landing page as prospects will see it"}
            >
              <ExternalLink className="w-4 h-4" />
              {isPublished ? "View Live Page" : "Preview Page"}
            </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving || loading}
            className="bg-[#00d9ff] text-white hover:bg-[#00a8cc]"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Publish
          </Button>
        </div>
      </div>
                </div>


    </div>
  )
}

// Sortable Section Item Component
function SortableSectionItem({
  section,
  onToggle
}: {
  section: SectionConfig
  onToggle: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-[#0f1629]/60 border border-[#00d9ff]/20 rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-[#00d9ff]/50" />
      </div>
      <Switch
        checked={section.enabled}
        onCheckedChange={() => onToggle(section.id)}
        className="data-[state=checked]:bg-[#00d9ff]"
      />
      <span className="flex-1 text-white text-xs font-light">{section.label}</span>
    </div>
  )
}

// Section Editor Component
function SectionEditor({
  sectionId,
  config,
  onConfigChange,
  onSectionConfigChange
}: {
  sectionId: string
  config: LandingPageConfig
  onConfigChange: (updates: Partial<LandingPageConfig>) => void
  onSectionConfigChange: (sectionId: string, updates: Partial<EnhancedSectionConfig>) => void
}) {
  const section = config.sections.find((s) => s.id === sectionId)
  const currentLayout = section?.layout || ""
  const layouts = getLayoutsByCategory(sectionId as any)
  
  // Get section-specific config or fall back to global content
  const sectionConfig = section?.config || {}
  
  // Helper to get section-specific value with fallback to global
  const getSectionValue = <T,>(key: string, globalValue: T): T => {
    return (sectionConfig[key] as T) ?? globalValue
  }
  
  // Helper to get section-specific colors (stored in config.config)
  // Use nullish coalescing to properly handle empty strings vs undefined
  const getSectionColor = (colorKey: "primaryColor" | "secondaryColor" | "accentColor"): string => {
    const sectionColor = sectionConfig[colorKey] as string | undefined
    const globalColor = config.theme[colorKey]
    const finalColor = sectionColor ?? globalColor
    return finalColor
  }

  return (
    <div className="space-y-6">
      {/* Layout Selector */}
      {layouts.length > 0 && (
        <div>
          <Label className="text-[#00d9ff]/70 mb-3 block text-xs font-light">Layout Style</Label>
          <div className="space-y-2">
            {layouts.map((layout: any) => (
              <div
                key={layout.id}
                onClick={() => onSectionConfigChange(sectionId, {
                  layout: layout.id
                })}
                className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center gap-3 ${
                  currentLayout === layout.id
                    ? "border-[#00d9ff] bg-[#00d9ff]/10"
                    : "border-[#00d9ff]/20 hover:border-[#00d9ff]/40 hover:bg-[#0f1629]/40"
                }`}
              >
                {/* Radio button indicator */}
                <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  currentLayout === layout.id
                    ? "border-[#00d9ff] bg-[#00d9ff]"
                    : "border-[#00d9ff]/40"
                }`}>
                  {currentLayout === layout.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                {/* Layout info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-light">{layout.name}</div>
                  {layout.description && (
                    <div className="text-[#00d9ff]/60 text-xs font-light mt-0.5">{layout.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section-specific content editors with Progressive Disclosure */}
      <Accordion type="multiple" className="space-y-6">
        {/* Essential Fields - Always Visible */}
        {sectionId === "hero" && (
          <>
            <AccordionItem value="content" className="border-[#00d9ff]/20">
              <AccordionTrigger className="text-white font-light text-sm py-3">
                Content
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Headline</Label>
                  <Input
                    value={getSectionValue("headline", config.content.hero.headline)}
                    onChange={(e) => onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        headline: e.target.value
                      }
                    })}
                    className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  />
                  <p className="text-[#00d9ff]/40 text-[10px] mt-1">Section-specific headline (overrides global)</p>
                </div>
                <div>
                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Subheadline</Label>
                  <Textarea
                    value={getSectionValue("subheadline", config.content.hero.subheadline)}
                    onChange={(e) => onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        subheadline: e.target.value
                      }
                    })}
                    className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm"
                    rows={3}
                  />
                  <p className="text-[#00d9ff]/40 text-[10px] mt-1">Section-specific subheadline (overrides global)</p>
                </div>
                <div>
                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Button Text</Label>
                  <Input
                    value={getSectionValue("ctaText", config.content.hero.ctaText || "Get Started")}
                    onChange={(e) => onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        ctaText: e.target.value
                      }
                    })}
                    className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                    placeholder="Get Started"
                  />
                  <p className="text-[#00d9ff]/50 text-[10px] mt-1">This button will link to the form page</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Advanced Fields - Hidden by Default */}
            <AccordionItem value="advanced" className="border-[#00d9ff]/20">
              <AccordionTrigger className="text-white/60 font-light text-xs py-3">
                Advanced Settings
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="text-white/40 text-xs">
                  Advanced styling, animations, and spacing options
                </div>
              </AccordionContent>
            </AccordionItem>
          </>
        )}

        {sectionId === "stats" && (
          <AccordionItem value="stats" className="border-[#00d9ff]/20">
            <AccordionTrigger className="text-white font-light text-sm py-3">
              Stats Content
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {(getSectionValue("stats", config.content.stats) as typeof config.content.stats).map((stat, index) => {
                const sectionStats = getSectionValue("stats", config.content.stats) as typeof config.content.stats
                return (
                  <div key={index} className="space-y-3 p-4 bg-[#0f1629]/40 rounded-lg border border-[#00d9ff]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs font-light">Stat #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newStats = sectionStats.filter((_, i) => i !== index)
                          onSectionConfigChange(sectionId, {
                            config: {
                              ...sectionConfig,
                              stats: newStats
                            }
                          })
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <IconPicker
                      label="Icon"
                      value={stat.icon || ""}
                      onChange={(iconName) => {
                        const newStats = [...sectionStats]
                        newStats[index] = { ...newStats[index], icon: iconName }
                        onSectionConfigChange(sectionId, {
                          config: {
                            ...sectionConfig,
                            stats: newStats
                          }
                        })
                      }}
                    />
                    
                    <div>
                      <Label className="text-[#00d9ff]/70 mb-1 block text-xs">Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...sectionStats]
                          newStats[index] = { ...newStats[index], label: e.target.value }
                          onSectionConfigChange(sectionId, {
                            config: {
                              ...sectionConfig,
                              stats: newStats
                            }
                          })
                        }}
                        className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                        placeholder="e.g., Years Experience"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-[#00d9ff]/70 mb-1 block text-xs">Value</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...sectionStats]
                          newStats[index] = { ...newStats[index], value: e.target.value }
                          onSectionConfigChange(sectionId, {
                            config: {
                              ...sectionConfig,
                              stats: newStats
                            }
                          })
                        }}
                        className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                        placeholder="e.g., 10+"
                      />
                    </div>
                  </div>
                )
              })}
              
              <Button
                onClick={() => {
                  const currentStats = getSectionValue("stats", config.content.stats) as typeof config.content.stats
                  onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      stats: [...currentStats, { label: "New Stat", value: "0", icon: "Award" }]
                    }
                  })
                }}
                className="w-full bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/20 text-sm h-9"
              >
                + Add New Stat
              </Button>
              <p className="text-[#00d9ff]/40 text-[10px] mt-2">Section-specific stats (overrides global stats)</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {sectionId === "testimonials" && (
          <AccordionItem value="testimonials" className="border-[#00d9ff]/20">
            <AccordionTrigger className="text-white font-light text-sm py-3">
              Testimonials
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {(getSectionValue("testimonials", config.content.testimonials) as typeof config.content.testimonials).map((testimonial, index) => {
                const sectionTestimonials = getSectionValue("testimonials", config.content.testimonials) as typeof config.content.testimonials
                return (
                  <div key={index} className="space-y-2 p-3 bg-[#0f1629]/40 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs font-light">Testimonial #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTestimonials = sectionTestimonials.filter((_, i) => i !== index)
                          onSectionConfigChange(sectionId, {
                            config: {
                              ...sectionConfig,
                              testimonials: newTestimonials
                            }
                          })
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-[#00d9ff]/70 mb-1 block text-xs">Name</Label>
                      <Input
                        value={testimonial.name}
                        onChange={(e) => {
                          const newTestimonials = [...sectionTestimonials]
                          newTestimonials[index] = { ...newTestimonials[index], name: e.target.value }
                          onSectionConfigChange(sectionId, {
                            config: {
                              ...sectionConfig,
                              testimonials: newTestimonials
                            }
                          })
                        }}
                        className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-[#00d9ff]/70 mb-1 block text-xs">Text</Label>
                      <Textarea
                        value={testimonial.text}
                        onChange={(e) => {
                          const newTestimonials = [...sectionTestimonials]
                          newTestimonials[index] = { ...newTestimonials[index], text: e.target.value }
                          onSectionConfigChange(sectionId, {
                            config: {
                              ...sectionConfig,
                              testimonials: newTestimonials
                            }
                          })
                        }}
                        className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                )
              })}
              
              <Button
                onClick={() => {
                  const currentTestimonials = getSectionValue("testimonials", config.content.testimonials) as typeof config.content.testimonials
                  onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      testimonials: [...currentTestimonials, { name: "New Client", text: "Great service!" }]
                    }
                  })
                }}
                className="w-full bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/20 text-sm h-9"
              >
                + Add New Testimonial
              </Button>
              <p className="text-[#00d9ff]/40 text-[10px] mt-2">Section-specific testimonials (overrides global testimonials)</p>
            </AccordionContent>
          </AccordionItem>
        )}

        {sectionId === "custom-html" && (
          <AccordionItem value="custom-html" className="border-[#00d9ff]/20">
          <AccordionTrigger className="text-white font-light text-sm py-3">
              Custom HTML Content
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">HTML Code</Label>
                <Textarea
                  value={sectionConfig.html || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      html: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm font-mono"
                  rows={10}
                  placeholder="<div>Your custom HTML here</div>"
                />
                <p className="text-[#00d9ff]/40 text-[10px] mt-1">Enter raw HTML code to be rendered in this section</p>
              </div>
              
              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Custom CSS (Optional)</Label>
                <Textarea
                  value={sectionConfig.css || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      css: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm font-mono"
                  rows={6}
                  placeholder=".custom-class { color: #00d9ff; }"
                />
                <p className="text-[#00d9ff]/40 text-[10px] mt-1">Add custom CSS styles for your HTML</p>
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Custom JavaScript (Optional)</Label>
                <Textarea
                  value={sectionConfig.javascript || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      javascript: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm font-mono"
                  rows={6}
                  placeholder="console.log('Hello from custom HTML');"
                />
                <p className="text-[#00d9ff]/50 text-[10px] mt-1">⚠️ JavaScript is disabled by default for security. Enable in advanced settings.</p>
              </div>

              <div className="pt-2 border-t border-[#00d9ff]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Switch
                    checked={sectionConfig.sanitize !== false}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        sanitize: checked
                      }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Sanitize HTML (Recommended)</Label>
                </div>
                <p className="text-[#00d9ff]/40 text-[10px]">When enabled, removes script tags and event handlers for security</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {sectionId === "header" && (
          <AccordionItem value="header" className="border-[#00d9ff]/20">
            <AccordionTrigger className="text-white font-light text-sm py-3">
              Header Content
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Logo URL</Label>
                <Input
                  value={sectionConfig.logoUrl || sectionConfig.logo || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      logo: e.target.value,
                      logoUrl: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-[#00d9ff]/40 text-[10px] mt-1">URL or path to logo image</p>
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Company Name</Label>
                <Input
                  value={sectionConfig.companyName || config.branding.companyName || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      companyName: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Navigation Links</Label>
                <p className="text-[#00d9ff]/40 text-[10px] mb-2">Add navigation menu items</p>
                {(sectionConfig.navigation || []).map((item: any, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={item.label || item.text || ""}
                      onChange={(e) => {
                        const nav = [...(sectionConfig.navigation || [])]
                        nav[index] = { ...nav[index], label: e.target.value, text: e.target.value }
                        onSectionConfigChange(sectionId, {
                          config: { ...sectionConfig, navigation: nav }
                        })
                      }}
                      className="flex-1 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                      placeholder="Link Label"
                    />
                    <Input
                      value={item.link || item.url || ""}
                      onChange={(e) => {
                        const nav = [...(sectionConfig.navigation || [])]
                        nav[index] = { ...nav[index], link: e.target.value, url: e.target.value }
                        onSectionConfigChange(sectionId, {
                          config: { ...sectionConfig, navigation: nav }
                        })
                      }}
                      className="flex-1 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                      placeholder="/link"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const nav = (sectionConfig.navigation || []).filter((_: any, i: number) => i !== index)
                        onSectionConfigChange(sectionId, {
                          config: { ...sectionConfig, navigation: nav }
                        })
                      }}
                      className="h-9 w-9 p-0 text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const nav = [...(sectionConfig.navigation || []), { label: "New Link", link: "#" }]
                    onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, navigation: nav }
                    })
                  }}
                  className="w-full bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/20 text-sm h-9"
                >
                  + Add Navigation Link
                </Button>
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">CTA Button Text</Label>
                <Input
                  value={sectionConfig.ctaText || sectionConfig.ctaPrimary || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      ctaText: e.target.value,
                      ctaPrimary: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="Get Started"
                />
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">CTA Button Link</Label>
                <Input
                  value={sectionConfig.ctaLink || sectionConfig.ctaPrimaryLink || "/form"}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      ctaLink: e.target.value,
                      ctaPrimaryLink: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="/form"
                />
              </div>

              <div className="pt-2 border-t border-[#00d9ff]/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sectionConfig.sticky !== false}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, sticky: checked }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Sticky Header</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sectionConfig.transparent === true}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, transparent: checked }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Transparent Background</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {sectionId === "footer" && (
          <AccordionItem value="footer" className="border-[#00d9ff]/20">
            <AccordionTrigger className="text-white font-light text-sm py-3">
              Footer Content
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Logo URL (Optional)</Label>
                <Input
                  value={sectionConfig.logoUrl || sectionConfig.logo || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      logo: e.target.value,
                      logoUrl: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Company Name</Label>
                <Input
                  value={sectionConfig.companyName || config.branding.companyName || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      companyName: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Company Info</Label>
                <Textarea
                  value={sectionConfig.companyInfo || ""}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      companyInfo: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm"
                  rows={3}
                  placeholder="Brief company description..."
                />
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Footer Links</Label>
                <p className="text-[#00d9ff]/40 text-[10px] mb-2">Add links to display in footer</p>
                {(sectionConfig.links || []).map((item: any, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={item.label || item.text || ""}
                      onChange={(e) => {
                        const links = [...(sectionConfig.links || [])]
                        links[index] = { ...links[index], label: e.target.value, text: e.target.value }
                        onSectionConfigChange(sectionId, {
                          config: { ...sectionConfig, links }
                        })
                      }}
                      className="flex-1 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                      placeholder="Link Label"
                    />
                    <Input
                      value={item.url || item.link || ""}
                      onChange={(e) => {
                        const links = [...(sectionConfig.links || [])]
                        links[index] = { ...links[index], url: e.target.value, link: e.target.value }
                        onSectionConfigChange(sectionId, {
                          config: { ...sectionConfig, links }
                        })
                      }}
                      className="flex-1 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                      placeholder="/link"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const links = (sectionConfig.links || []).filter((_: any, i: number) => i !== index)
                        onSectionConfigChange(sectionId, {
                          config: { ...sectionConfig, links }
                        })
                      }}
                      className="h-9 w-9 p-0 text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const links = [...(sectionConfig.links || []), { label: "New Link", url: "#" }]
                    onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, links }
                    })
                  }}
                  className="w-full bg-[#00d9ff]/10 border border-[#00d9ff]/30 text-[#00d9ff] hover:bg-[#00d9ff]/20 text-sm h-9"
                >
                  + Add Footer Link
                </Button>
              </div>

              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Copyright Text</Label>
                <Input
                  value={sectionConfig.copyright || `© ${new Date().getFullYear()} ${config.branding.companyName || "Company"}. All rights reserved.`}
                  onChange={(e) => onSectionConfigChange(sectionId, {
                    config: {
                      ...sectionConfig,
                      copyright: e.target.value
                    }
                  })}
                  className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                  placeholder="Copyright text"
                />
              </div>

              <div className="pt-2 border-t border-[#00d9ff]/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sectionConfig.showSocial !== false}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, showSocial: checked }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Show Social Links</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sectionConfig.showCopyright !== false}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, showCopyright: checked }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Show Copyright</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sectionConfig.showLogo === true}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, showLogo: checked }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Show Logo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sectionConfig.showCompanyInfo === true}
                    onCheckedChange={(checked) => onSectionConfigChange(sectionId, {
                      config: { ...sectionConfig, showCompanyInfo: checked }
                    })}
                    className="data-[state=checked]:bg-[#00d9ff]"
                  />
                  <Label className="text-[#00d9ff]/70 text-xs">Show Company Info</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Section-Specific Styling - Available for all sections except header/footer */}
        <AccordionItem value="styling" className="border-[#00d9ff]/20">
          <AccordionTrigger 
            className={`text-white font-light text-sm py-3 ${
              (sectionId === "header" || sectionId === "footer") ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={sectionId === "header" || sectionId === "footer"}
          >
            Section Styling
            {(sectionId === "header" || sectionId === "footer") && (
              <span className="ml-2 text-[10px] text-[#00d9ff]/40">(Not available for header/footer)</span>
            )}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {(sectionId === "header" || sectionId === "footer") ? (
              <div className="text-center py-6">
                <p className="text-[#00d9ff]/40 text-xs font-light">
                  Background styling is not available for header and footer sections.
                </p>
                <p className="text-[#00d9ff]/30 text-[10px] mt-2">
                  Headers and footers use transparent backgrounds to blend with the page.
                </p>
              </div>
            ) : (
              <>
            <p className="text-[#00d9ff]/50 text-[10px] mb-4">Customize colors and background for this section only</p>
            
            {/* Section Background */}
            <div className="space-y-3">
              <Label className="text-[#00d9ff]/70 mb-2 block text-xs font-light">Section Background</Label>
              <div>
                <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Background Type</Label>
                <div className="flex gap-2 flex-wrap">
                  {(["solid", "gradient", "image", "video"] as const).map((type) => {
                    const currentBg = sectionConfig?.background || section?.background
                    return (
                      <Button
                        key={type}
                        variant={currentBg?.type === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          onSectionConfigChange(sectionId, {
                            background: {
                              type,
                              ...(type === "solid" && { color: currentBg?.color || config.theme.sectionBackground }),
                              ...(type === "gradient" && { 
                                gradient: currentBg?.gradient || {
                                  type: "linear",
                                  stops: [
                                    { color: config.theme.sectionBackground, position: 0 },
                                    { color: config.theme.cardBackground, position: 1 }
                                  ],
                                  angle: 90
                                }
                              }),
                              ...(type === "image" && currentBg?.image ? { image: currentBg.image } : {}),
                              ...(type === "video" && currentBg?.video ? { video: currentBg.video } : {}),
                            },
                          })
                        }}
                        className="text-xs capitalize"
                      >
                        {type}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Solid Background */}
              {((sectionConfig?.background || section?.background)?.type === "solid" || !(sectionConfig?.background || section?.background)?.type) && (
                <div>
                  <ColorInput
                    label="Background Color"
                    value={(sectionConfig?.background || section?.background)?.color || config.theme.sectionBackground}
                    onChange={(value) => {
                      onSectionConfigChange(sectionId, {
                        background: {
                          type: "solid",
                          color: value,
                        },
                      })
                    }}
                  />
                </div>
              )}

              {/* Gradient Background */}
              {(sectionConfig?.background || section?.background)?.type === "gradient" && (
                <div className="space-y-3 p-3 bg-[#0f1629]/40 rounded-lg border border-[#00d9ff]/10">
                  <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Gradient Stops</Label>
                  {((sectionConfig?.background || section?.background)?.gradient?.stops || []).map((stop: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <ColorInput
                        label={`Stop ${index + 1}`}
                        value={stop.color}
                        onChange={(value) => {
                          const currentBg = sectionConfig?.background || section?.background
                          const stops = [...(currentBg?.gradient?.stops || [])]
                          stops[index] = { ...stops[index], color: value }
                          onSectionConfigChange(sectionId, {
                            background: {
                              type: "gradient",
                              gradient: {
                                ...currentBg?.gradient,
                                stops,
                              } as any,
                            },
                          })
                        }}
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => {
                          const currentBg = sectionConfig?.background || section?.background
                          const stops = [...(currentBg?.gradient?.stops || [])]
                          stops[index] = { ...stops[index], position: parseFloat(e.target.value) }
                          onSectionConfigChange(sectionId, {
                            background: {
                              type: "gradient",
                              gradient: {
                                ...currentBg?.gradient,
                                stops,
                              } as any,
                            },
                          })
                        }}
                        className="w-20 bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                      />
                      <span className="text-white/40 text-xs">%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Background */}
              {(sectionConfig?.background || section?.background)?.type === "image" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Background Image</Label>
                    {(sectionConfig?.background || section?.background)?.image?.url ? (
                      <div className="relative">
                        <img
                          src={(sectionConfig?.background || section?.background)?.image?.url}
                          alt="Section background"
                          className="w-full h-32 object-cover rounded-lg border border-[#00d9ff]/20"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onSectionConfigChange(sectionId, {
                              background: {
                                type: "image",
                                image: undefined,
                              } as any,
                            })
                          }}
                          className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/80 hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#00d9ff]/30 rounded-lg cursor-pointer hover:border-[#00d9ff]/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                onSectionConfigChange(sectionId, {
                                  background: {
                                    type: "image",
                                    image: {
                                      url: reader.result as string,
                                      position: "center",
                                      size: "cover",
                                    },
                                  },
                                })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                          className="hidden"
                        />
                        <Upload className="w-5 h-5 text-[#00d9ff]/50 mr-2" />
                        <span className="text-[#00d9ff]/50 text-xs">Upload Image</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Video Background */}
              {(sectionConfig?.background || section?.background)?.type === "video" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#00d9ff]/70 mb-2 block text-xs">Background Video URL</Label>
                    <Input
                      value={(sectionConfig?.background || section?.background)?.video?.url || ""}
                      onChange={(e) => {
                        onSectionConfigChange(sectionId, {
                          background: {
                            type: "video",
                            video: {
                              url: e.target.value,
                              autoplay: (sectionConfig?.background || section?.background)?.video?.autoplay ?? true,
                              loop: (sectionConfig?.background || section?.background)?.video?.loop ?? true,
                              muted: (sectionConfig?.background || section?.background)?.video?.muted ?? true,
                            },
                          },
                        })
                      }}
                      className="bg-[#0a0e27]/60 border-[#00d9ff]/20 text-white text-sm h-9"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section-Specific Colors */}
            <div className="space-y-3 pt-4 border-t border-[#00d9ff]/20">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-[#00d9ff]/70 block text-xs font-light">Section Colors</Label>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded border border-amber-500/30 font-medium">
                  Overrides Global
                </span>
              </div>
              <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-400/80 text-[10px] leading-relaxed">
                  <strong className="font-semibold">⚠️ Override Warning:</strong> These colors will override the global theme colors <strong>for this section only</strong>. Other sections will continue using the global theme colors.
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-[#00d9ff]/70 block text-xs">Primary Color</Label>
                    {sectionConfig.primaryColor && (
                      <span className="px-1.5 py-0.5 bg-[#00d9ff]/20 text-[#00d9ff] text-[9px] rounded border border-[#00d9ff]/30">
                        Overridden
                      </span>
                    )}
                  </div>
                  <ColorInput
                    label=""
                    value={getSectionColor("primaryColor")}
                  onChange={(value) => {
                    onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        primaryColor: value,
                      },
                    })
                  }}
                  />
                  {sectionConfig.primaryColor && (
                    <p className="text-amber-400/60 text-[9px] mt-1 ml-1">
                      Overriding global: <span className="font-mono">{config.theme.primaryColor}</span>
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-[#00d9ff]/70 block text-xs">Secondary Color</Label>
                    {sectionConfig.secondaryColor && (
                      <span className="px-1.5 py-0.5 bg-[#00d9ff]/20 text-[#00d9ff] text-[9px] rounded border border-[#00d9ff]/30">
                        Overridden
                      </span>
                    )}
                  </div>
                  <ColorInput
                    label=""
                    value={getSectionColor("secondaryColor")}
                  onChange={(value) => {
                    onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        secondaryColor: value,
                      },
                    })
                  }}
                  />
                  {sectionConfig.secondaryColor && (
                    <p className="text-amber-400/60 text-[9px] mt-1 ml-1">
                      Overriding global: <span className="font-mono">{config.theme.secondaryColor}</span>
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-[#00d9ff]/70 block text-xs">Accent Color</Label>
                    {sectionConfig.accentColor && (
                      <span className="px-1.5 py-0.5 bg-[#00d9ff]/20 text-[#00d9ff] text-[9px] rounded border border-[#00d9ff]/30">
                        Overridden
                      </span>
                    )}
                  </div>
                  <ColorInput
                    label=""
                    value={getSectionColor("accentColor")}
                  onChange={(value) => {
                    onSectionConfigChange(sectionId, {
                      config: {
                        ...sectionConfig,
                        accentColor: value,
                      },
                    })
                  }}
                  />
                  {sectionConfig.accentColor && (
                    <p className="text-amber-400/60 text-[9px] mt-1 ml-1">
                      Overriding global: <span className="font-mono">{config.theme.accentColor}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#00d9ff]/10">
                <p className="text-[#00d9ff]/40 text-[10px]">
                  💡 <strong>Tip:</strong> Leave empty to use global theme colors. Set a value to override for this section only.
                </p>
              </div>
            </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

