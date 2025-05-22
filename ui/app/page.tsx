import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
  return (
    <ThemeProvider defaultTheme="system" storageKey="honey-drip-theme">
      <WalletProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            <HeroSection />
            <StatsBar />

            <section className="container py-12">
              {/* Anchor points for navigation */}
              <span id="stake-section" className="block h-0 -mt-16 pt-16 invisible"></span>

              <Tabs defaultValue="stake" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="stake">Stake</TabsTrigger>
                  <TabsTrigger value="vip">VIP Program</TabsTrigger>
                  <TabsTrigger value="rewards">Rewards</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="stake" className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Stake with Batch Permits</CardTitle>
                        <CardDescription>
                          Deposit tokens and ETH with EIP-2612 permits for gas-efficient staking
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <StakingForm />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Staking Pools</CardTitle>
                        <CardDescription>Choose a pool to maximize your yield</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: "Stablecoin Pool", apy: "50%", tvl: "$2.5M" },
                          { name: "ETH Pool", apy: "80%", tvl: "$4.2M" },
                          { name: "Honey Pool", apy: "95%", tvl: "$1.8M" },
                        ].map((pool, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{pool.name}</h3>
                              <p className="text-sm text-muted-foreground">TVL: {pool.tvl}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                {pool.apy} APY
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* VIP Program Section */}
                <span id="vip-section" className="block h-0 -mt-16 pt-16 invisible"></span>
                <TabsContent value="vip" className="space-y-4">
                  <VipStakingForm />
                </TabsContent>

                {/* Rewards Section */}
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
