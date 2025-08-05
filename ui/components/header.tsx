"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ExternalLink, LogOut } from "lucide-react"

export default function Header() {
  const { address, connect, disconnect, isConnecting } = useWallet()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Helper function to truncate a wallet address for display.
  const truncateAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    // The header now uses a dark background and subtle border and shadow for premium feel.
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur-lg shadow-md supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            {/* The logo text is large and bold for a stronger brand presence. */}
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              Honey Drip
            </span>
          </Link>

          {/* Navigation links with a hover effect. */}
          <nav className="hidden md:flex gap-6">
            <Link
              href="#"
              className="text-base font-medium text-gray-300 transition-colors duration-200 hover:text-amber-500"
            >
              Home
            </Link>
            <Link
              href="#stake-section"
              className="text-base font-medium text-gray-300 transition-colors duration-200 hover:text-amber-500"
            >
              Stake
            </Link>
            <Link
              href="#vip-section"
              className="text-base font-medium text-gray-300 transition-colors duration-200 hover:text-amber-500"
            >
              VIP Program
            </Link>
            <Link
              href="#rewards-section"
              className="text-base font-medium text-gray-300 transition-colors duration-200 hover:text-amber-500"
            >
              Rewards
            </Link>
            <Link
              href="https://github.com/cenwadike/honey-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-gray-300 transition-colors duration-200 hover:text-amber-500"
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggler is kept */}
          <ModeToggle />

          {address ? (
            <DropdownMenu>
              {/* Wallet button is styled to be more prominent and match the amber theme. */}
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-gray-800 border-gray-700 text-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-700"
                >
                  <span className="hidden sm:inline-block">{truncateAddress(address)}</span>
                  <span className="inline-block sm:hidden">Wallet</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
                <DropdownMenuItem className="text-gray-300">
                  <span>Ethereum Mainnet</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-700">
                  <Link
                    href={`https://etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View on Etherscan
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={disconnect} className="flex items-center gap-2 text-red-400 hover:bg-gray-700">
                  Disconnect
                  <LogOut className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // "Connect Wallet" button styled as a primary CTA.
            <Button onClick={connect} disabled={isConnecting} className="bg-amber-500 hover:bg-amber-600 rounded-lg px-4 py-2 text-sm font-semibold transition-transform duration-200 hover:scale-105">
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
