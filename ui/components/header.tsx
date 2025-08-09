"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ExternalLink, LogOut } from "lucide-react"

// Import shadcn/ui components for the modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Define a mock address for demonstration purposes
const MOCK_ADDRESS = "0x4A6bA34B200c92D879E3166699a2283A431536b5"

export default function Header() {
  const { address, connect, disconnect, isConnecting, setMockAddress } = useWallet() // Assuming useWallet can now accept and set a mock address
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false) // New state for the modal

  // Helper function for desktop truncation (longer)
  const truncateAddressDesktop = (addr: string | null) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Helper function for mobile truncation (shorter)
  const truncateAddressMobile = (addr: string | null) => {
    if (!addr) return ""
    return `${addr.slice(0, 4)}...${addr.slice(-2)}`
  }

  const handleConnect = async () => {
    // This will trigger the actual wallet connection process
    await connect()
    setShowConnectModal(false) // Close the modal after connection
  }

  const handleUseMockWallet = () => {
    // This will set the mock address and bypass the real connection process
    setMockAddress(MOCK_ADDRESS)
    setShowConnectModal(false) // Close the modal
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-lg shadow-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              Honey Drip
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-base font-medium text-muted-foreground transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="#stake-section" className="text-base font-medium text-muted-foreground transition-colors hover:text-primary">
              Stake
            </Link>
            <Link href="#vip-section" className="text-base font-medium text-muted-foreground transition-colors hover:text-primary">
              VIP Program
            </Link>
            <Link href="#rewards-section" className="text-base font-medium text-muted-foreground transition-colors hover:text-primary">
              Rewards
            </Link>
            <Link
              href="https://github.com/cenwadike/honey-drip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
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
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border border-border bg-card text-card-foreground rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="sm:hidden">{truncateAddressMobile(address)}</span>
                  <span className="hidden sm:inline-block">{truncateAddressDesktop(address)}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                  <span>Ethereum Mainnet</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
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
                <DropdownMenuItem onClick={disconnect} className="flex items-center gap-2 text-destructive hover:bg-accent hover:text-accent-foreground">
                  Disconnect
                  <LogOut className="h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* This button now opens the modal instead of directly connecting */}
              <Button
                onClick={() => setShowConnectModal(true)}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/80 rounded-lg px-4 py-2 text-sm font-semibold transition-transform hover:scale-105"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
              <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                    <DialogDescription>
                      Choose how you want to connect to start staking.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Button onClick={handleConnect} isLoading={isConnecting}>
                      Connect Real Wallet
                    </Button>
                    <Button variant="outline" onClick={handleUseMockWallet}>
                      Use Mock Wallet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  )
}