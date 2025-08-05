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

  // This function is for simulating the contract call. In a real app, it would
  // interact with the blockchain.
  const handleHarvest = async () => {
    if (!address || !optimizerContract) {
      setErrorMessage("Wallet not connected properly")
      return
    }

    setIsHarvesting(true)
    setTxStatus("pending")
    setErrorMessage(null)

    try {
      // Simulate a successful transaction for the UI
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus("success");
      setTxHash("0x123abc..."); // Mock transaction hash
      setAvailableRewards("0");

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
    <div className="grid gap-8 md:grid-cols-2 p-8 bg-gray-950 text-white">
      {/* Harvest Rewards Card */}
      <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-amber-500/20">
        <CardHeader className="border-b border-white/10 p-6">
          <CardTitle className="text-2xl font-bold text-white">Harvest Your Rewards</CardTitle>
          <CardDescription className="text-gray-400">
            Claim your staking rewards to boost your earnings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {!address ? (
            <Alert className="bg-white/5 backdrop-blur-xl border border-white/20 text-amber-300">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-sm">
                Please connect your wallet to harvest rewards.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Select a pool</p>
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
                  <SelectTrigger className="w-full bg-white/5 border-white/20 text-gray-200 hover:bg-white/10 transition-colors rounded-xl">
                    <SelectValue placeholder="Select a pool" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-200 rounded-xl">
                    {mockPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id.toString()}>
                        {pool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-base text-gray-400">Available Rewards</span>
                  <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500 drop-shadow-md">
                    {availableRewards} ETH
                  </span>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  ≈ ${ (Number.parseFloat(availableRewards) * 3150).toFixed(2) } USD
                </div>
              </div>

              {txStatus === "success" && (
                <Alert className="bg-white/5 backdrop-blur-xl text-green-400 border-green-500/20 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                  <AlertDescription className="text-sm">
                    Rewards harvested successfully!
                    {txHash && (
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-amber-400 hover:underline"
                      >
                        View on Etherscan
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {txStatus === "error" && (
                <Alert className="bg-white/5 backdrop-blur-xl text-red-400 border-red-500/20 rounded-xl">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-sm">
                    Transaction failed. {errorMessage || "Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleHarvest}
                disabled={isHarvesting || Number.parseFloat(availableRewards) <= 0}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 rounded-full py-6 text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
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

              <p className="text-xs text-center text-gray-500">
                Rewards are capped at 0.005 ETH per harvest.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reward History Card */}
      <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 text-gray-200 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-amber-500/20">
        <CardHeader className="border-b border-white/10 p-6">
          <CardTitle className="text-2xl font-bold text-white">My Reward History</CardTitle>
          <CardDescription className="text-gray-400">
            My recent reward harvests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {address ? (
            <div className="overflow-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Pool</TableHead>
                    <TableHead className="text-right text-gray-400">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardHistory.map((reward, i) => (
                    <TableRow key={i} className="border-white/10 hover:bg-white/5 transition-colors">
                      <TableCell className="text-gray-300">{reward.date}</TableCell>
                      <TableCell className="text-gray-300">{reward.pool}</TableCell>
                      <TableCell className="text-right font-medium text-amber-400">
                        {reward.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-10 w-10 text-gray-600 mb-4" />
              <p className="text-gray-500">
                Connect your wallet to view your reward history.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
