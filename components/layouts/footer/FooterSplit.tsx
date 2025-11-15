"use client"

import React from "react"
import { LayoutComponentProps } from "@/types/layouts"
import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, Linkedin, Facebook, Twitter, Instagram } from "lucide-react"

/**
 * Split Footer Component
 * 
 * Left: logo/company info, Right: links and social
 */
export function FooterSplit({ config, agentData, primaryColor, secondaryColor }: LayoutComponentProps) {
  const logoUrl = config.config?.logo || config.config?.logoUrl || agentData?.profile?.photo || ""
  const companyName = config.config?.companyName || config.config?.branding?.companyName || ""
  const companyInfo = config.config?.companyInfo || ""
  const links = config.config?.links || []
  const socialLinks = config.config?.socialLinks || agentData?.profile?.socialLinks || {}
  const showLogo = config.config?.showLogo !== false
  const showCompanyInfo = config.config?.showCompanyInfo !== false

  return (
    <footer
      className="w-full border-t bg-transparent"
      style={{
        borderColor: `${primaryColor}15`,
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left: Logo & Company Info */}
          <div className="space-y-3 sm:space-y-4">
            {showLogo && (
              <div>
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={companyName || "Logo"}
                    width={100}
                    height={32}
                    className="h-7 sm:h-8 md:h-9 w-auto object-contain"
                  />
                ) : companyName ? (
                  <h3 className="text-base sm:text-lg md:text-xl font-medium" style={{ color: primaryColor }}>
                    {companyName}
                  </h3>
                ) : null}
              </div>
            )}
            {showCompanyInfo && companyInfo && (
              <p className="text-xs sm:text-sm font-light leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
                {companyInfo}
              </p>
            )}
            {agentData?.profile && (
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
                {agentData.profile.phone && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{agentData.profile.phone}</span>
                  </div>
                )}
                {agentData.email && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="break-all">{agentData.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Links & Social */}
          <div className="flex flex-col items-start md:items-end gap-4 sm:gap-5 md:gap-6">
            {links.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-start md:justify-end">
                {links.map((link: any, index: number) => (
                  <Link
                    key={index}
                    href={link.url || "#"}
                    className="text-xs sm:text-sm font-light transition-colors hover:opacity-70"
                    style={{ color: "rgba(255, 255, 255, 0.55)" }}
                  >
                    {link.label || link.text}
                  </Link>
                ))}
              </div>
            )}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-start md:justify-end">
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

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t text-center" style={{ borderColor: `${primaryColor}15` }}>
          <p className="text-[10px] sm:text-xs font-light" style={{ color: "rgba(255, 255, 255, 0.45)" }}>
            © {new Date().getFullYear()} {companyName || "Company"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

