"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StakingForm from "@/components/staking-form"
import VipStakingForm from "@/components/vip-staking-form"
import RewardsSection from "@/components/rewards-section"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import StatsBar from "@/components/stats-bar"
import TransactionHistory from "@/components/transaction-history"

export default function Home() {
  const [selectedPool, setSelectedPool] = React.useState("Stablecoin Pool");

  return (
    <ThemeProvider defaultTheme="system" storageKey="honey-drip-theme">
      <WalletProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-1">
            <HeroSection selectedPool={selectedPool} setSelectedPool={setSelectedPool} />
            <StatsBar />

            <section className="container py-12">
              <span id="stake-section" className="block h-0 -mt-16 pt-16 invisible"></span>

              <Tabs defaultValue="stake" className="w-full">
                {/* - The `TabsList` now uses a single `flex` container.
                  - The `w-full` on `TabsList` ensures it takes up all available width.
                  - The `TabsTrigger` components are now styled to be more compact on mobile.
                  - The `text-sm` class is added for smaller font size on mobile, with `sm:text-base`
                    to return to the original size on larger screens.
                  - `whitespace-nowrap` prevents the button text from wrapping.
                  - A `flex-1` class is used to make each button take an equal amount of space.
                */}
                <TabsList className="flex w-full border border-border bg-muted/50 backdrop-blur-xl rounded-2xl mb-8 p-1">
                  <TabsTrigger 
                    value="stake" 
                    className="flex-1 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl text-sm sm:text-base font-semibold hover:bg-muted transition-colors duration-200 py-2 px-2"
                  >
                    Stake
                  </TabsTrigger>
                  <TabsTrigger 
                    value="vip"
                    className="flex-1 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl text-sm sm:text-base font-semibold hover:bg-muted transition-colors duration-200 py-2 px-2"
                  >
                    VIP Program
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rewards"
                    className="flex-1 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl text-sm sm:text-base font-semibold hover:bg-muted transition-colors duration-200 py-2 px-2"
                  >
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="flex-1 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-2xl text-sm sm:text-base font-semibold hover:bg-muted transition-colors duration-200 py-2 px-2"
                  >
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stake" className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-1">
                    <Card className="bg-card border-border text-card-foreground">
                      <CardHeader>
                        <CardTitle className="text-card-foreground">Stake with Batch Permits</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Deposit tokens and ETH with EIP-2612 permits for gas-efficient staking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StakingForm selectedPool={selectedPool} onPoolChange={setSelectedPool} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <span id="vip-section" className="block h-0 -mt-16 pt-16 invisible"></span>
                <TabsContent value="vip" className="space-y-4">
                  <VipStakingForm />
                </TabsContent>

                <span id="rewards-section" className="block h-0 -mt-16 pt-16 invisible"></span>
                <TabsContent value="rewards" className="space-y-4">
                  <RewardsSection />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <TransactionHistory />
                </TabsContent>
              </Tabs>
            </section>
          </main>
          <Footer />
        </div>
      </WalletProvider>
    </ThemeProvider>
  )
}