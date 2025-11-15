"use client"

import React, { useState } from "react"
import { LayoutComponentProps } from "@/types/layouts"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

/**
 * Centered Header Component
 * 
 * Centered logo with navigation below - compact and professional
 */
export function HeaderCentered({ config, agentData, primaryColor, secondaryColor }: LayoutComponentProps) {
  const logoUrl = config.config?.logo || config.config?.logoUrl || agentData?.profile?.photo || ""
  const companyName = config.config?.companyName || config.config?.branding?.companyName || ""
  const navigation = config.config?.navigation || []
  const sticky = config.config?.sticky !== false
  const transparent = config.config?.transparent === false
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={`w-full ${sticky ? "sticky top-0 z-50" : ""} transition-all duration-200 bg-transparent border-b`}
      style={{
        borderColor: `${primaryColor}15`,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-2 sm:py-2.5 md:py-3">
          {/* Logo */}
          <div className="mb-2 sm:mb-2.5 md:mb-3">
            {logoUrl ? (
              <Link href="/" className="flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={companyName || "Logo"}
                  width={120}
                  height={38}
                  className="h-7 sm:h-8 md:h-9 w-auto object-contain"
                />
              </Link>
            ) : companyName ? (
              <Link href="/" className="text-lg sm:text-xl md:text-2xl font-medium" style={{ color: primaryColor }}>
                {companyName}
              </Link>
            ) : null}
          </div>

          {/* Desktop Navigation */}
          {navigation.length > 0 && (
            <>
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

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded transition-colors hover:bg-white/5"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {navigation.length > 0 && mobileMenuOpen && (
          <div className="md:hidden border-t py-2" style={{ borderColor: `${primaryColor}15` }}>
            <nav className="flex flex-col gap-1.5">
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

