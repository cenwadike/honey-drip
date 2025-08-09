"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// card component for the asset pools.
const PoolCard = ({ name, apy, tvl, className }) => (
  <div
    className={`relative z-10 w-full rounded-3xl border border-border bg-card/5 backdrop-blur-xl p-6 shadow-2xl transition-transform duration-300 hover:scale-[1.03] ${className}`}
  >
    <div className="space-y-2">
      <h4 className="text-xl font-bold text-foreground">{name}</h4>
      <div className="flex justify-between items-center pt-2">
        <span className="text-sm text-muted-foreground">APY</span>
        <Badge className="bg-primary/10 text-primary-foreground border-primary/20 text-lg font-bold">
          {apy}
        </Badge>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">TVL</span>
        <span className="text-xl font-bold text-foreground">{tvl}</span>
      </div>
    </div>
  </div>
)

export default function HeroSection() {
  const pools = [
    { name: "Stablecoin Pool", apy: "50%", tvl: "$2.5M" },
    { name: "ETH Pool", apy: "80%", tvl: "$2.2M" },
    { name: "Honey Pool", apy: "95%", tvl: "$6.06M" },
  ]

  return (
    <section className="relative w-full pt-12 pb-24 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32 bg-background text-foreground overflow-hidden">
      {/* animated background effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent opacity-50 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-lg">
                Unlock 100%+ APY with Gas-Optimized Staking
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Stake your tokens with batch permits for maximum efficiency and exclusive VIP benefits.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link href="#stake-section" passHref>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-7 text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  Start Staking
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#vip-section" passHref>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-full px-8 py-7 text-lg font-semibold transition-colors duration-200"
                >
                  VIP Program
                </Button>
              </Link>
            </div>

            {/* Audit Badge */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/30 border border-border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-semibold text-foreground">Audited by a leading firm</h3>
                <p className="text-sm text-muted-foreground">Security is our top priority</p>
              </div>
            </div>
          </div>

          {/* Right: Pools */}
          <div className="flex flex-col items-center justify-center relative space-y-4 md:space-y-6">
            <h3 className="text-3xl font-bold text-foreground drop-shadow-md">Asset Pools</h3>
            {pools.map((pool, i) => (
              <PoolCard
                key={i}
                name={pool.name}
                apy={pool.apy}
                tvl={pool.tvl}
                className={`transform transition-all duration-500 ease-out animate-fade-in-up delay-${i * 150}`}
              />
            ))}
            <Link href="#stake-section" passHref>
              <Button className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-lg font-semibold transition-transform duration-200 hover:scale-[1.01]">
                Stake Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-pulse {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in-up {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .delay-0 { animation-delay: 0s; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </section>
  )
}
