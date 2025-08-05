"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2, Lock, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ethers } from "ethers"
import { PERMIT_PROCESSING_FEE, generatePermitSignature, mockTokens, vipTiers } from "@/lib/contract"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function VipStakingForm() {
  const { address, signer, optimizerContract } = useWallet()
  const [vipLevel, setVipLevel] = useState(1)
  const [acceptVipTerms, setAcceptVipTerms] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<null | "pending" | "success" | "error">(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleVipStake = async () => {
    if (!address || !signer || !optimizerContract) {
      setErrorMessage("Wallet not connected properly")
      return
    }

    if (selectedTokens.length < 5) {
      setErrorMessage("VIP staking requires at least 5 tokens")
      return
    }

    setIsSubmitting(true)
    setTxStatus("pending")
    setErrorMessage(null)

    try {
      // Simulating a successful transaction for the UI
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus("success");
      setTxHash("0x123abc..."); // Mock transaction hash

    } catch (error) {
      console.error("Error in VIP staking:", error)
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

  const currentVipTier = useMemo(() => vipTiers[vipLevel - 1], [vipLevel]);
  const processingFee = 0.002;
  const ethAmount = processingFee;

  return (
    // Main container with dark background and spacious padding.
    <div className="bg-gray-950 text-white min-h-screen p-6 md:p-12 flex justify-center items-start">
      <div className="grid gap-8 max-w-6xl w-full mx-auto md:grid-cols-2">
        {/* Main Form Card with the new glassy styling */}
        <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 space-y-8">
          <CardHeader className="text-center p-0">
            <CardTitle className="text-3xl font-bold text-white">Join 12,345 other VIPs </CardTitle>
            <CardDescription className="text-gray-400 mt-1">Unlock higher yields with multi-permit staking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            {!address ? (
              <Alert className="text-center bg-white/5 backdrop-blur-xl border border-white/20 text-amber-300 rounded-xl">
                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                <AlertDescription>Please connect your wallet to access VIP staking.</AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Section 1: Token Selection */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">1. Select Permit Tokens</h3>
                  <p className={`text-sm ${selectedTokens.length < 5 ? 'text-red-400' : 'text-green-400'}`}>
                    Selected: {selectedTokens.length} / {currentVipTier.permits} minimum
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                
                <div className="my-6 border-b border-white/10" />

                {/* Section 2: VIP Level Selection */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">2. Choose VIP Level</h3>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-semibold text-gray-300">VIP Level: <span className="text-amber-500">{vipLevel}</span></Label>
                      <span className="text-sm font-medium text-amber-500">{currentVipTier.apy} APY</span>
                    </div>
                    <Slider
                      value={[vipLevel]}
                      min={1}
                      max={3}
                      step={1}
                      onValueChange={(value) => setVipLevel(value[0])}
                      className="[&>span]:bg-amber-500 [&>span:nth-of-type(2)]:bg-amber-300"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Level 1</span>
                      <span>Level 2</span>
                      <span>Level 3</span>
                    </div>
                  </div>
                </div>
                
                <div className="my-6 border-b border-white/10" />

                {/* Section 3: Staking Summary */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">3. Staking Summary</h3>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-4 text-gray-300">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-white">Selected VIP Level</h4>
                      <p className="text-lg">Level {vipLevel} <span className="text-sm text-gray-500">({currentVipTier.apy} APY)</span></p>
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
                        <span className="mr-2">{ethAmount.toFixed(3)} ETH</span>
                        <span className="text-sm text-gray-500">+ Gas</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 ml-2 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-gray-800 text-gray-200 border-gray-700">
                              <p>This includes the 2x processing fee and an estimate for network gas fees.</p>
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
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vipTerms"
                      checked={acceptVipTerms}
                      onCheckedChange={(checked) => setAcceptVipTerms(checked as boolean)}
                      className="border-gray-500 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="vipTerms" className="text-sm text-gray-300">
                      I accept the{" "}
                      <a href="#" className="text-amber-500 hover:underline font-medium">
                        VIP Terms of Service
                      </a>
                    </Label>
                  </div>
                </div>

                {txStatus === "success" && (
                  <Alert className="bg-white/5 backdrop-blur-xl text-green-400 border-green-500/20 rounded-xl">
                    <CheckCircle2 className="h-5 w-5" />
                    <AlertDescription className="flex flex-col">
                      <span className="font-medium">VIP staking successful!</span>
                      You are now a Level {vipLevel} VIP.
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
                  onClick={handleVipStake}
                  disabled={selectedTokens.length < currentVipTier.permits || !acceptVipTerms || isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 rounded-full py-6 text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 mt-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="font-semibold">Processing...</span>
                    </>
                  ) : (
                    "Join VIP Program"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* VIP Tiers & Benefits section, as a separate card */}
        <div className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6">
            <h3 className="text-2xl font-bold text-white">VIP Tiers & Benefits</h3>
            <p className="text-gray-400 mt-2">Upgrade your staking experience by joining a higher VIP tier.</p>
            <div className="mt-4 space-y-4">
              {vipTiers.map((tier, i) => (
                <Card 
                  key={i} 
                  className={`transition-all duration-300 bg-white/5 border-white/20 text-gray-200 rounded-2xl shadow-sm
                  ${vipLevel === tier.level 
                      ? "border-amber-500 ring-2 ring-amber-500/50 shadow-lg scale-[1.02]" 
                      : "hover:border-amber-500 hover:bg-white/10"
                    }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-white">Level {tier.level}</CardTitle>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-semibold px-3 py-1">
                        {tier.apy} APY
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-400">Requires {tier.permits} permit tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span>Priority reward harvesting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span>Reduced gas fees on transactions</span>
                      </li>
                      {tier.level >= 2 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span>Access to exclusive pools</span>
                        </li>
                      )}
                      {tier.level >= 3 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <span>Early access to new features</span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
