"use client"

import Link from "next/link"
import { Github, Twitter } from "lucide-react"

export default function Footer() {
  return (
    // The footer now has a dark background and a defined top border to match the header.
    <footer className="w-full bg-gray-950 border-t border-gray-800 py-12">
      <div className="container flex flex-col items-center justify-between gap-8 md:flex-row">
        {/* The copyright text is styled for better visibility on the dark background. */}
        <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
          © 2025 Honey Drip. All rights reserved.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Navigation links with hover effects that match the header. */}
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-amber-500"
            >
              About
            </Link>
            <Link
              href="https://github.com/cenwadike/honey-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-amber-500"
            >
              Docs
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-amber-500"
            >
              Audit
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-400 transition-colors duration-200 hover:text-amber-500"
            >
              Terms
            </Link>
          </nav>

          {/* Social icons are larger and have the same hover effect. */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-200 hover:text-amber-500"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors duration-200 hover:text-amber-500"
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
