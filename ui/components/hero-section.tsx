import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-amber-500/10 to-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                Unlock 100%+ APY with Gas-Optimized Staking
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Stake your tokens with batch permits for maximum efficiency and exclusive VIP benefits.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="#stake-section">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600">
                  Start Staking
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#vip-section">
                <Button size="lg" variant="outline">
                  VIP Program
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-amber-500"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium">Audited Protocol</h3>
                <p className="text-xs text-muted-foreground">Security is our top priority</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[400px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur-[100px] opacity-20"></div>
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="w-full max-w-[320px] aspect-square bg-black/10 backdrop-blur-sm rounded-3xl border border-white/10 p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Stablecoin Pool</h3>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">APY</span>
                      <span className="text-lg font-bold text-amber-500">50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">TVL</span>
                      <span className="text-lg font-medium">$2.5M</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full w-[65%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Capacity</span>
                      <span>65% filled</span>
                    </div>
                    <Link href="#stake-section">
                      <Button className="w-full bg-amber-500 hover:bg-amber-600">Stake Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
