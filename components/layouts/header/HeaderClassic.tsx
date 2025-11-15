"use client"

import React, { useState } from "react"
import { LayoutComponentProps } from "@/types/layouts"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

/**
 * Classic Header Component
 * 
 * Logo left, navigation center, CTA right
 * Compact, professional, fully responsive
 */
export function HeaderClassic({ config, agentData, primaryColor, secondaryColor }: LayoutComponentProps) {
  const logoUrl = config.config?.logo || config.config?.logoUrl || agentData?.profile?.photo || ""
  const companyName = config.config?.companyName || config.config?.branding?.companyName || ""
  const navigation = config.config?.navigation || []
  const ctaText = config.config?.ctaText || config.config?.ctaPrimary || "Get Started"
  const ctaLink = config.config?.ctaLink || config.config?.ctaPrimaryLink || "/form"
  const sticky = config.config?.sticky !== false
  const transparent = config.config?.transparent === true
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={`w-full ${sticky ? "sticky top-0 z-50" : ""} transition-all duration-200 bg-transparent border-b`}
      style={{
        borderColor: `${primaryColor}15`,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            {logoUrl ? (
              <Link href="/" className="flex items-center">
                <Image
                  src={logoUrl}
                  alt={companyName || "Logo"}
                  width={100}
                  height={32}
                  className="h-6 sm:h-7 md:h-8 w-auto object-contain"
                />
              </Link>
            ) : companyName ? (
              <Link href="/" className="text-base sm:text-lg md:text-xl font-medium" style={{ color: primaryColor }}>
                {companyName}
              </Link>
            ) : null}
          </div>

          {/* Desktop Navigation */}
          {navigation.length > 0 && (
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {navigation.map((item: any, index: number) => (
                <Link
                  key={index}
                  href={item.link || "#"}
                  className="text-xs sm:text-sm font-light transition-colors hover:opacity-70"
                  style={{ color: "rgba(255, 255, 255, 0.75)" }}
                >
                  {item.label || item.text}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop CTA & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {ctaText && (
              <>
                {/* Desktop CTA */}
                <Link
                  href={ctaLink}
                  className="hidden md:inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-normal transition-all hover:opacity-90"
                  style={{
                    backgroundColor: primaryColor,
                    color: "white",
                  }}
                >
                  {ctaText}
                </Link>
                {/* Mobile CTA */}
                <Link
                  href={ctaLink}
                  className="md:hidden inline-flex items-center px-2.5 py-1 rounded text-xs font-normal transition-all hover:opacity-90"
                  style={{
                    backgroundColor: primaryColor,
                    color: "white",
                  }}
                >
                  {ctaText}
                </Link>
              </>
            )}
            
            {/* Mobile Menu Toggle */}
            {navigation.length > 0 && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded transition-colors hover:bg-white/5"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {navigation.length > 0 && mobileMenuOpen && (
          <div className="md:hidden border-t py-3" style={{ borderColor: `${primaryColor}15` }}>
            <nav className="flex flex-col gap-2">
              {navigation.map((item: any, index: number) => (
                <Link
                  key={index}
                  href={item.link || "#"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-light py-1.5 transition-colors hover:opacity-70"
                  style={{ color: "rgba(255, 255, 255, 0.75)" }}
                >
                  {item.label || item.text}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

