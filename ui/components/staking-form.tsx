"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ethers } from "ethers"
import {
  PERMIT_PROCESSING_FEE,
  generatePermitSignature,
  createBatchPermitData,
  mockTokens,
  mockPools,
} from "@/lib/contract"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StakingForm() {
  const { address, signer, optimizerContract, getTokenContract } = useWallet()
  const [poolId, setPoolId] = useState("0")
  const [stakeAmount, setStakeAmount] = useState("")
  const [ethAmount, setEthAmount] = useState("0.001")
  const [isVipBatch, setIsVipBatch] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<null | "pending" | "success" | "error">(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Function to handle the staking logic, which is now a mock for UI purposes.
  // In a live application, this would interact with the blockchain.
  const handleStake = async () => {
    if (!address || !signer || !optimizerContract) {
      setErrorMessage("Wallet not connected properly")
      return
    }

    if (!stakeAmount || selectedTokens.length === 0) {
      setErrorMessage("Please enter an amount and select at least one token.")
      return;
    }

    setIsSubmitting(true)
    setTxStatus("pending")
    setErrorMessage(null)

    try {
      // Simulating a successful transaction for the UI
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus("success");
      setTxHash("0x123def..."); // Mock transaction hash

    } catch (error) {
      console.error("Error staking:", error)
      setTxStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleToken = (token: string) => {
    if (selectedTokens.includes(token)) {
      setSelectedTokens(selectedTokens.filter((t) => t !== token))
    } else {
      setSelectedTokens([...selectedTokens, token])
    }
  }

  const setMaxStakeAmount = () => {
    // This is a mock function, would be replaced with a real balance lookup
    setStakeAmount("1000")
  }

  const selectedPool = useMemo(() => {
    return mockPools.find(pool => pool.id.toString() === poolId);
  }, [poolId]);

  return (
    // Main container with dark background and spacious padding.
    <div className="bg-gray-950 text-white min-h-screen p-6 md:p-12 flex justify-center items-start">
      {/* Main Card with glass like styling */}
      <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-amber-500/20 p-6 space-y-8 max-w-xl w-full">
        <CardHeader className="text-center p-0">
          <CardTitle className="text-3xl font-bold text-white">Staking & Permits</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your staking options and approve tokens.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-0">
          {!address ? (
            // Custom alert for disconnected wallet, styled for the dark theme.
            <Alert className="text-center bg-white/5 backdrop-blur-xl border border-white/20 text-amber-300 rounded-xl">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              <AlertDescription>
                Please connect your wallet to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Section 1: Staking Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">1. Staking Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="pool" className="text-sm text-gray-300 font-medium">Select Pool</Label>
                  {/* Select component styled for the new theme */}
                  <Select value={poolId} onValueChange={setPoolId}>
                    <SelectTrigger id="pool" className="rounded-xl bg-white/5 border-white/20 text-gray-200 hover:bg-white/10 transition-colors">
                      <SelectValue placeholder="Select a pool" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-200 rounded-xl">
                      {mockPools.map((pool) => (
                        <SelectItem key={pool.id} value={pool.id.toString()} className="hover:bg-gray-700">
                          {pool.name} ({pool.apy} APY)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm text-gray-300 font-medium">Stake Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="pr-12 rounded-xl bg-white/5 border-white/20 text-gray-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-amber-500 hover:bg-amber-500/20"
                      onClick={setMaxStakeAmount}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Available: 1000 MTK</p>
                </div>
              </div>

              <div className="my-6 border-b border-white/10" />

              {/* Section 2: Permit Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">2. Permit Options</h3>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300 font-medium">Select Tokens for Permits</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mockTokens.map((token) => (
                      <div
                        key={token.address}
                        className={`
                          relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200
                          ${selectedTokens.includes(token.address) 
                            ? "border-amber-500 bg-amber-500/10 shadow-md" 
                            : "border-white/20 bg-white/5 hover:border-amber-300 hover:bg-white/10"
                          }
                        `}
                        onClick={() => toggleToken(token.address)}
                      >
                        <div className="flex-grow">
                          <span className="font-semibold text-white">{token.symbol}</span>
                          <p className="text-xs text-gray-500">{token.balance}</p>
                        </div>
                        {selectedTokens.includes(token.address) && (
                          <CheckCircle2 className="h-5 w-5 text-amber-500 absolute top-2 right-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eth" className="text-sm text-gray-300 font-medium">ETH Deposit (for gas)</Label>
                  <Input
                    id="eth"
                    type="number"
                    placeholder="0.001"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    className="rounded-xl bg-white/5 border-white/20 text-gray-200"
                  />
                  <p className="text-xs text-gray-500">Minimum: 0.001 ETH for processing fee</p>
                </div>
              </div>

              <div className="my-6 border-b border-white/10" />
              
              {/* Section 3: Staking Summary */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">3. Staking Summary</h3>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-4 text-gray-300">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Selected Pool</h4>
                      <p className="text-lg">
                        {selectedPool ? (
                          <span>{selectedPool.name} <span className="text-sm text-gray-500">({selectedPool.apy} APY)</span></span>
                        ) : (
                          <span className="text-gray-500">No pool selected</span>
                        )}
                      </p>
                    </div>
                    <div className="border-t border-white/10" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Stake Amount</h4>
                      <p className="text-lg">{stakeAmount || "0"} MTK</p>
                    </div>
                    <div className="border-t border-white/10" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Tokens for Permits ({selectedTokens.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTokens.length > 0 ? (
                          selectedTokens.map(tokenAddress => {
                            const token = mockTokens.find(t => t.address === tokenAddress);
                            return <span key={tokenAddress} className="text-sm bg-white/10 text-white rounded-full px-3 py-1">{token?.symbol}</span>
                          })
                        ) : (
                          <span className="text-gray-500">None selected</span>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-white/10" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Estimated Transaction Cost</h4>
                      <div className="flex items-center text-lg">
                        <span className="mr-2">{Number(ethAmount).toFixed(4)} ETH</span>
                        <span className="text-sm text-gray-500">+ Gas</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-2 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
                              <p>This includes the processing fee and an estimate for network gas fees.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
              </div>

              <div className="my-6 border-b border-white/10" />

              {/* Section 4: Confirmation */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">4. Confirmation</h3>
                
                <TooltipProvider>
                  <Tooltip>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="vip" 
                        checked={isVipBatch} 
                        onCheckedChange={(checked) => setIsVipBatch(checked as boolean)} 
                        className="border-gray-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="vip" className="text-sm text-gray-300 flex items-center gap-1">
                        VIP Batch (requires VIP status)
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                      </Label>
                    </div>
                    <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
                      <p>Enables a priority batch for faster transaction processing.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="border-gray-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-300">
                    I accept the{" "}
                    <a href="#" className="text-amber-500 hover:underline font-medium">
                      Terms of Service
                    </a>
                  </Label>
                </div>
              </div>

              {txStatus === "success" && (
                <Alert className="bg-white/5 backdrop-blur-xl text-green-400 border-green-500/20 rounded-xl">
                  <CheckCircle2 className="h-5 w-5" />
                  <AlertDescription className="flex flex-col">
                    <span className="font-medium">Transaction successful!</span>
                    Your stake has been processed.
                    {txHash && (
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-sm text-amber-400 hover:underline font-medium"
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
                  <AlertDescription>
                    <span className="font-medium">Transaction failed.</span>
                    <br/>
                    {errorMessage || "Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleStake}
                disabled={!stakeAmount || !acceptTerms || isSubmitting || selectedTokens.length === 0}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 rounded-full py-6 text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span className="font-semibold">Processing...</span>
                  </>
                ) : (
                  "Stake Now"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
