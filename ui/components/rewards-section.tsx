"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mockPools } from "@/lib/contract"

export default function RewardsSection() {
  const { address, optimizerContract } = useWallet()
  const [poolId, setPoolId] = useState("0")
  const [isHarvesting, setIsHarvesting] = useState(false)
  const [txStatus, setTxStatus] = useState<null | "pending" | "success" | "error">(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [availableRewards, setAvailableRewards] = useState("0.003")

  const handleHarvest = async () => {
    if (!address || !optimizerContract) {
      setErrorMessage("Wallet not connected properly")
      return
    }

    setIsHarvesting(true)
    setTxStatus("pending")
    setErrorMessage(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus("success");
      setTxHash("0x123abc...");
      setAvailableRewards("0");

    } catch (error) {
      console.error("Error harvesting rewards:", error)
      setTxStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsHarvesting(false)
    }
  }

  const rewardHistory = [
    { date: "2025-05-18", amount: "0.003 ETH", pool: "Stablecoin Pool" },
    { date: "2025-05-15", amount: "0.005 ETH", pool: "ETH Pool" },
    { date: "2025-05-12", amount: "0.002 ETH", pool: "Stablecoin Pool" },
    { date: "2025-05-09", amount: "0.004 ETH", pool: "Honey Pool" },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-2 p-8 bg-background text-foreground">
      <Card className="relative bg-card/5 backdrop-blur-xl border border-border rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-primary/20">
        <CardHeader className="border-b border-border p-6">
          <CardTitle className="text-2xl font-bold text-foreground">Harvest Your Rewards</CardTitle>
          <CardDescription className="text-muted-foreground">
            Claim your staking rewards to boost your earnings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {!address ? (
            <Alert className="bg-secondary/20 backdrop-blur-xl border border-accent text-accent-foreground">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-sm">
                Please connect your wallet to harvest rewards.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Select a pool</p>
                <Select
                  value={poolId}
                  onValueChange={(value) => {
                    setPoolId(value)
                    // Reset transaction state when the pool changes
                    setTxStatus(null)
                    setTxHash(null)
                    setErrorMessage(null)

                    if (value === "0") setAvailableRewards("0.003")
                    else if (value === "1") setAvailableRewards("0.005")
                    else setAvailableRewards("0.004")
                  }}
                >
                  <SelectTrigger className="w-full bg-secondary border-border text-foreground hover:bg-secondary/80 transition-colors rounded-xl">
                    <SelectValue placeholder="Select a pool" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
                    {mockPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id.toString()}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative p-6 rounded-2xl bg-secondary border border-border shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base text-muted-foreground">Available Rewards</span>
                  <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground drop-shadow-md">
                    {availableRewards} ETH
                  </span>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  ≈ ${ (Number.parseFloat(availableRewards) * 3150).toFixed(2) } USD
                </div>
              </div>

              {txStatus === "success" && (
                <Alert className="bg-secondary backdrop-blur-xl text-success border-success/20 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <AlertDescription className="text-sm">
                    Rewards harvested successfully!
                    {txHash && (
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-primary hover:underline"
                      >
                        View on Etherscan
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {txStatus === "error" && (
                <Alert className="bg-secondary backdrop-blur-xl text-destructive border-destructive/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <AlertDescription className="text-sm">
                    Transaction failed. {errorMessage || "Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleHarvest}
                disabled={isHarvesting || Number.parseFloat(availableRewards) <= 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isHarvesting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Harvest Rewards"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Rewards are capped at 0.005 ETH per harvest.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="relative bg-card/5 backdrop-blur-xl border border-border text-foreground rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-primary/20">
        <CardHeader className="border-b border-border p-6">
          <CardTitle className="text-2xl font-bold text-foreground">My Reward History</CardTitle>
          <CardDescription className="text-muted-foreground">
            My recent reward harvests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {address ? (
            <div className="overflow-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Pool</TableHead>
                    <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardHistory.map((reward, i) => (
                    <TableRow key={i} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell className="text-foreground">{reward.date}</TableCell>
                      <TableCell className="text-foreground">{reward.pool}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {reward.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Connect your wallet to view your reward history.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}