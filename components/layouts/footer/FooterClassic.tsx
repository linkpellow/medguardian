"use client"

import React from "react"
import { LayoutComponentProps } from "@/types/layouts"
import Link from "next/link"
import { Phone, Mail, Linkedin, Facebook, Twitter, Instagram } from "lucide-react"

/**
 * Classic Footer Component
 * 
 * Multi-column with links, social, and copyright
 */
export function FooterClassic({ config, agentData, primaryColor, secondaryColor }: LayoutComponentProps) {
  // Get columns from config, or create structure from links if provided
  const configColumns = config.config?.columns
  const configLinks = config.config?.links || []
  
  // Only use columns if explicitly provided or if there are actual links
  const columns = configColumns || (configLinks.length > 0 ? [
    { title: "Links", links: configLinks }
  ] : [])
  
  const socialLinks = config.config?.socialLinks || agentData?.profile?.socialLinks || {}
  const copyright = config.config?.copyright || `© ${new Date().getFullYear()} ${config.config?.companyName || config.config?.branding?.companyName || "Company"}. All rights reserved.`
  const showSocial = config.config?.showSocial !== false
  const showCopyright = config.config?.showCopyright !== false

  return (
    <footer
      className="w-full border-t bg-transparent"
      style={{
        borderColor: `${primaryColor}15`,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-0">
        {/* Columns - Only show if there are actual columns with content */}
        {columns.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
            {columns.map((column: any, index: number) => (
              <div key={index}>
                <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3" style={{ color: primaryColor }}>
                  {column.title}
                </h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {column.links?.map((link: any, linkIndex: number) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.url || "#"}
                        className="text-xs sm:text-sm font-light transition-colors hover:opacity-70"
                        style={{ color: "rgba(255, 255, 255, 0.55)" }}
                      >
                        {link.label || link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Contact Info */}
        {agentData?.profile && (
          <div className="border-t pt-4 sm:pt-6 mb-4 sm:mb-6" style={{ borderColor: `${primaryColor}15` }}>
            <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
              {agentData.profile.phone && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{agentData.profile.phone}</span>
                </div>
              )}
              {agentData.email && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="break-all">{agentData.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t" style={{ borderColor: `${primaryColor}15` }}>
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

