"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ethers } from "ethers"
import { PERMIT_PROCESSING_FEE, generatePermitSignature, mockTokens, vipTiers } from "@/lib/contract"

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
      // Create permit data for each selected token
      const permits = []
      const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

      for (const tokenAddress of selectedTokens) {
        // Amount to approve via permit (10 tokens in wei)
        const permitAmount = ethers.parseEther("10")

        // Generate permit signature
        const { v, r, s } = await generatePermitSignature(
          tokenAddress,
          signer,
          await optimizerContract.getAddress(),
          permitAmount,
          BigInt(deadline),
        )

        permits.push({
          token: tokenAddress,
          value: permitAmount,
          deadline,
          v,
          r,
          s,
        })
      }

      // Generate batch nonce
      const batchNonce = ethers.hexlify(ethers.randomBytes(32))

      // Calculate processing fee (2x standard fee)
      const processingFee = PERMIT_PROCESSING_FEE * BigInt(2)

      // Call vipMultiPermitStaking
      const tx = await optimizerContract.vipMultiPermitStaking(
        permits,
        vipLevel, // minVipLevel
        batchNonce,
        acceptVipTerms,
        { value: processingFee },
      )

      setTxHash(tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      // Check for events in receipt
      const vipPermitAccessEvent = receipt.logs.find(
        (log) => log.topics[0] === optimizerContract.interface.getEvent("VipPermitAccess").topicHash,
      )

      if (vipPermitAccessEvent) {
        setTxStatus("success")
      } else {
        setTxStatus("error")
        setErrorMessage("Transaction completed but expected events not found")
      }
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Join Our Exclusive VIP Program</CardTitle>
          <CardDescription>Unlock higher yields with multi-permit staking. Minimum 5 permits required.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!address ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Please connect your wallet to access VIP staking</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Select Tokens for Permits (min 5)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockTokens.map((token) => (
                    <div
                      key={token.address}
                      className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${
                        selectedTokens.includes(token.address) ? "border-amber-500 bg-amber-500/10" : ""
                      }`}
                      onClick={() => toggleToken(token.address)}
                    >
                      <span>{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">{token.balance}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Selected: {selectedTokens.length} / 5 minimum</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>VIP Level: {vipLevel}</Label>
                  <span className="text-sm text-amber-500">{vipTiers[vipLevel - 1]?.apy} APY</span>
                </div>
                <Slider
                  value={[vipLevel]}
                  min={1}
                  max={3}
                  step={1}
                  onValueChange={(value) => setVipLevel(value[0])}
                  className="[&>span]:bg-amber-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Level 1</span>
                  <span>Level 2</span>
                  <span>Level 3</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Processing Fee</Label>
                <Input type="text" value="0.002 ETH" disabled />
                <p className="text-xs text-muted-foreground">VIP staking requires 2x the standard processing fee</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vipTerms"
                  checked={acceptVipTerms}
                  onCheckedChange={(checked) => setAcceptVipTerms(checked as boolean)}
                />
                <Label htmlFor="vipTerms" className="text-sm">
                  I accept the{" "}
                  <a href="#" className="text-amber-500 hover:underline">
                    VIP Terms of Service
                  </a>
                </Label>
              </div>

              {txStatus === "success" && (
                <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    VIP staking successful! You are now a Level {vipLevel} VIP.
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
                onClick={handleVipStake}
                disabled={selectedTokens.length < 5 || !acceptVipTerms || isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Join VIP Program"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">VIP Tiers & Benefits</h3>

        {vipTiers.map((tier, i) => (
          <Card key={i} className={vipLevel === tier.level ? "border-amber-500" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Level {tier.level}</CardTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  {tier.apy} APY
                </Badge>
              </div>
              <CardDescription>Requires {tier.permits} permit tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Priority reward harvesting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Reduced gas fees on transactions</span>
                </li>
                {tier.level >= 2 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span>Access to exclusive pools</span>
                  </li>
                )}
                {tier.level >= 3 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    <span>Early access to new features</span>
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              {vipLevel < tier.level ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Upgrade to unlock</span>
                </div>
              ) : (
                <div className="text-sm text-amber-500">{vipLevel === tier.level ? "Current tier" : "Unlocked"}</div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
