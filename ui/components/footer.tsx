"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"

export default function Footer() {
  return (
    // The footer now uses theme-aware variables for background and border.
    <footer className="w-full bg-background border-t border-border py-12">
      <div className="container flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* The copyright text now uses a theme-aware muted-foreground color. */}
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2025 Honey Drip. All rights reserved.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Navigation links use theme-aware colors for text and hover effect. */}
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              About
            </Link>
            <Link
              href="https://github.com/cenwadike/honey-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              Docs
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              Audit
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              Terms
            </Link>
          </nav>

          {/* Social icons also use theme-aware colors. */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}