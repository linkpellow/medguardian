"use client"

import React from "react"
import { LayoutComponentProps } from "@/types/layouts"
import Link from "next/link"
import { Linkedin, Facebook, Twitter, Instagram } from "lucide-react"

/**
 * Minimal Footer Component
 * 
 * Simple copyright and social links
 */
export function FooterMinimal({ config, agentData, primaryColor, secondaryColor }: LayoutComponentProps) {
  const copyright = config.config?.copyright || `© ${new Date().getFullYear()} ${config.config?.companyName || "Company"}. All rights reserved.`
  const socialLinks = config.config?.socialLinks || agentData?.profile?.socialLinks || {}
  const showCopyright = config.config?.showCopyright !== false
  const showSocial = config.config?.showSocial !== false

  return (
    <footer
      className="w-full border-t bg-transparent"
      style={{
        borderColor: `${primaryColor}15`,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-5 md:pt-6 pb-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {showCopyright && (
            <p className="text-[10px] sm:text-xs font-light text-center sm:text-left" style={{ color: "rgba(255, 255, 255, 0.45)" }}>
              {copyright}
            </p>
          )}
          {showSocial && Object.keys(socialLinks).length > 0 && (
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
              {socialLinks.linkedin && (
                <Link
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded transition-all hover:opacity-80 hover:scale-110"
                  style={{ color: primaryColor }}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              )}
              {socialLinks.facebook && (
                <Link
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded transition-all hover:opacity-80 hover:scale-110"
                  style={{ color: primaryColor }}
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded transition-all hover:opacity-80 hover:scale-110"
                  style={{ color: primaryColor }}
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              )}
              {socialLinks.instagram && (
                <Link
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded transition-all hover:opacity-80 hover:scale-110"
                  style={{ color: primaryColor }}
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

