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
        <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col">
          <Header />
          <main className="flex-1">
            <HeroSection selectedPool={selectedPool} setSelectedPool={setSelectedPool} />
            <StatsBar />

            <section className="container py-12">
              <span id="stake-section" className="block h-0 -mt-16 pt-16 invisible"></span>

              <Tabs defaultValue="stake" className="w-full">
                {/*
                  - The `TabsList` padding (`p-2`) has been removed to allow the triggers to fill the container.
                  - A new `px-2` and `py-1` padding has been added to the `TabsTrigger` elements themselves for proper spacing.
                  - The `data-[state=active]` styles have been kept to maintain the active color scheme.
                */}
                <TabsList className="grid w-full grid-cols-4 border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl mb-8">
                  <TabsTrigger 
                    value="stake" 
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-2xl text-base font-semibold hover:bg-white/10 transition-colors duration-200 py-2 px-2"
                  >
                    Stake
                  </TabsTrigger>
                  <TabsTrigger 
                    value="vip"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-2xl text-base font-semibold hover:bg-white/10 transition-colors duration-200 py-2 px-2"
                  >
                    VIP Program
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rewards"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-2xl text-base font-semibold hover:bg-white/10 transition-colors duration-200 py-2 px-2"
                  >
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-2xl text-base font-semibold hover:bg-white/10 transition-colors duration-200 py-2 px-2"
                  >
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="stake" className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-1">
                    <Card className="bg-gray-900 border-gray-800 text-gray-200">
                      <CardHeader>
                        <CardTitle className="text-gray-100">Stake with Batch Permits</CardTitle>
                        <CardDescription className="text-gray-400">
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
