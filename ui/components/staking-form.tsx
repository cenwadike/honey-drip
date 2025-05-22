"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ethers } from "ethers"
import {
  PERMIT_PROCESSING_FEE,
  generatePermitSignature,
  createBatchPermitData,
  mockTokens,
  mockPools,
} from "@/lib/contract"

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

  const handleStake = async () => {
    if (!address || !signer || !optimizerContract) {
      setErrorMessage("Wallet not connected properly")
      return
    }

    setIsSubmitting(true)
    setTxStatus("pending")
    setErrorMessage(null)

    try {
      // Convert values to proper format
      const stakeAmountWei = ethers.parseEther(stakeAmount)
      const ethAmountWei = ethers.parseEther(ethAmount)
      const totalEthValue = PERMIT_PROCESSING_FEE + (ethAmountWei - PERMIT_PROCESSING_FEE)

      // Create permit data for each selected token
      const permits = []
      const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

      for (const tokenAddress of selectedTokens) {
        const tokenContract = getTokenContract(tokenAddress)
        if (!tokenContract) continue

        // Amount to approve via permit (100 tokens in wei)
        const permitAmount = ethers.parseEther("100")

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

      // Create batch permit data
      const batchPermitData = await createBatchPermitData(address, permits, deadline, isVipBatch)

      // Approve tokens for staking if needed
      const selectedPool = mockPools.find((pool) => pool.id.toString() === poolId)
      if (selectedPool) {
        const stakingTokenContract = getTokenContract(selectedPool.stakingToken)
        if (stakingTokenContract) {
          const currentAllowance = await stakingTokenContract.allowance(address, await optimizerContract.getAddress())

          if (currentAllowance < stakeAmountWei) {
            const approveTx = await stakingTokenContract.approve(await optimizerContract.getAddress(), stakeAmountWei)
            await approveTx.wait()
          }
        }
      }

      // Call stakeWithBatchPermits
      const tx = await optimizerContract.stakeWithBatchPermits(
        poolId,
        stakeAmountWei,
        batchPermitData,
        isVipBatch,
        acceptTerms,
        { value: totalEthValue },
      )

      setTxHash(tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      // Check for events in receipt
      const permitBatchProcessedEvent = receipt.logs.find(
        (log) => log.topics[0] === optimizerContract.interface.getEvent("PermitBatchProcessed").topicHash,
      )

      if (permitBatchProcessedEvent) {
        setTxStatus("success")
      } else {
        setTxStatus("error")
        setErrorMessage("Transaction completed but expected events not found")
      }
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

  return (
    <div className="space-y-4">
      {!address ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please connect your wallet to start staking</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="pool">Select Pool</Label>
            <Select value={poolId} onValueChange={setPoolId}>
              <SelectTrigger id="pool">
                <SelectValue placeholder="Select a pool" />
              </SelectTrigger>
              <SelectContent>
                {mockPools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id.toString()}>
                    {pool.name} ({pool.apy} APY)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Stake Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Available: 1000 MTK</p>
          </div>

          <div className="space-y-2">
            <Label>Select Tokens for Permits</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="eth">ETH Deposit (for gas)</Label>
            <Input
              id="eth"
              type="number"
              placeholder="0.001"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum: 0.001 ETH for processing fee</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="vip" checked={isVipBatch} onCheckedChange={(checked) => setIsVipBatch(checked as boolean)} />
            <Label htmlFor="vip" className="text-sm">
              VIP Batch (requires VIP status)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I accept the{" "}
              <a href="#" className="text-amber-500 hover:underline">
                Terms of Service
              </a>
            </Label>
          </div>

          {txStatus === "success" && (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Transaction successful! Your stake has been processed.
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
            onClick={handleStake}
            disabled={!stakeAmount || !acceptTerms || isSubmitting || selectedTokens.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Stake Now"
            )}
          </Button>
        </>
      )}
    </div>
  )
}
