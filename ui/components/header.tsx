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

  const truncateAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Honey Drip
            </span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="#stake-section" className="text-sm font-medium transition-colors hover:text-primary">
              Stake
            </Link>
            <Link href="#vip-section" className="text-sm font-medium transition-colors hover:text-primary">
              VIP Program
            </Link>
            <Link href="#rewards-section" className="text-sm font-medium transition-colors hover:text-primary">
              Rewards
            </Link>
            <Link
              href="https://github.com/cenwadike/honey-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="hidden sm:inline-block">{truncateAddress(address)}</span>
                  <span className="inline-block sm:hidden">Wallet</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <span>Ethereum Mainnet</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
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
                <DropdownMenuItem onClick={disconnect} className="flex items-center gap-2">
                  Disconnect
                  <LogOut className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={connect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
