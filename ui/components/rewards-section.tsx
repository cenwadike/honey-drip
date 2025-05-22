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
      // Call harvestPermitRewards
      const tx = await optimizerContract.harvestPermitRewards(poolId)
      setTxHash(tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      // Check for events in receipt
      const rewardsHarvestedEvent = receipt.logs.find(
        (log) => log.topics[0] === optimizerContract.interface.getEvent("RewardsHarvested").topicHash,
      )

      if (rewardsHarvestedEvent) {
        setTxStatus("success")
        // Reset available rewards after successful harvest
        setAvailableRewards("0")
      } else {
        setTxStatus("error")
        setErrorMessage("Transaction completed but expected events not found")
      }
    } catch (error) {
      console.error("Error harvesting rewards:", error)
      setTxStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsHarvesting(false)
    }
  }

  // Mock reward history data
  const rewardHistory = [
    { date: "2025-05-18", amount: "0.003 ETH", pool: "Stablecoin Pool" },
    { date: "2025-05-15", amount: "0.005 ETH", pool: "ETH Pool" },
    { date: "2025-05-12", amount: "0.002 ETH", pool: "Stablecoin Pool" },
    { date: "2025-05-09", amount: "0.004 ETH", pool: "Honey Pool" },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Harvest Your Rewards</CardTitle>
          <CardDescription>Claim your staking rewards to boost your earnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!address ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please connect your wallet to harvest rewards</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Select
                  value={poolId}
                  onValueChange={(value) => {
                    setPoolId(value)
                    // Simulate different rewards for different pools
                    if (value === "0") setAvailableRewards("0.003")
                    else if (value === "1") setAvailableRewards("0.005")
                    else setAvailableRewards("0.004")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pool" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id.toString()}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Rewards</span>
                    <span className="text-xl font-bold">{availableRewards} ETH</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ≈ ${(Number.parseFloat(availableRewards) * 3150).toFixed(2)} USD
                  </div>
                </CardContent>
              </Card>

              {txStatus === "success" && (
                <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Rewards harvested successfully!
                    {txHash && (
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-amber-500 hover:underline"
                      >
                        View on Etherscan
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {txStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Transaction failed. {errorMessage || "Please try again."}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleHarvest}
                disabled={isHarvesting || Number.parseFloat(availableRewards) <= 0}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                {isHarvesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Harvest Rewards"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">Rewards are capped at 0.005 ETH per harvest</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reward History</CardTitle>
          <CardDescription>Your recent reward harvests</CardDescription>
        </CardHeader>
        <CardContent>
          {address ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardHistory.map((reward, i) => (
                  <TableRow key={i}>
                    <TableCell>{reward.date}</TableCell>
                    <TableCell>{reward.pool}</TableCell>
                    <TableCell className="text-right font-medium">{reward.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Connect your wallet to view reward history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
