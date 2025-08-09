"use client"

import { useState, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTokens, mockPools } from "@/lib/contract"

// === Utility ===
const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`

// === Components ===
const WalletAlert = memo(() => (
  <Alert className="text-center bg-accent/20 backdrop-blur-xl border border-accent text-accent-foreground rounded-xl">
    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
    <AlertDescription>Please connect your wallet to get started.</AlertDescription>
  </Alert>
))
WalletAlert.displayName = "WalletAlert"

const PoolSelector = memo(({ poolId, setPoolId, onPoolChange }: any) => (
  <div className="space-y-2">
    <Label htmlFor="pool" className="text-sm text-muted-foreground font-medium">Select Pool</Label>
    <Select value={poolId} onValueChange={onPoolChange}>
      <SelectTrigger id="pool" className="rounded-xl bg-input border-border text-foreground hover:bg-muted transition-colors">
        <SelectValue placeholder="Select a pool" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl">
        {mockPools.map((pool) => (
          <SelectItem key={pool.id} value={pool.id.toString()} className="hover:bg-accent hover:text-accent-foreground">
            {pool.name} ({pool.apy} APY)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
))
PoolSelector.displayName = "PoolSelector"

const TokenSelector = memo(({ selectedTokens, toggleToken }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {mockTokens.map((token) => (
      <div
        key={token.address}
        className={`relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200
          ${selectedTokens.includes(token.address)
            ? "border-primary bg-primary/10 shadow-md"
            : "border-border bg-card/5 hover:border-accent hover:bg-accent/10"
          }`}
        onClick={() => toggleToken(token.address)}
      >
        <div className="flex-grow">
          <span className="font-semibold text-foreground">{token.symbol}</span>
          <p className="text-xs text-muted-foreground">{token.balance}</p>
        </div>
        {selectedTokens.includes(token.address) && (
          <CheckCircle2 className="h-5 w-5 text-primary absolute top-2 right-2" />
        )}
      </div>
    ))}
  </div>
))
TokenSelector.displayName = "TokenSelector"

const StakingSummary = memo(({ selectedPool, stakeAmount, selectedTokens, ethAmount }: any) => (
  <section className="space-y-4">
    <h3 className="text-lg sm:text-xl font-semibold text-foreground">4. Staking Summary</h3>
    <div className="bg-muted/5 backdrop-blur-xl border border-border rounded-xl p-4 space-y-4 text-muted-foreground">
      {/* Pool */}
      <div>
        <h4 className="font-semibold text-foreground">Selected Pool</h4>
        <p className="text-lg">
          {selectedPool ? (
            <>
              {selectedPool.name}{" "}
              <span className="text-sm text-muted-foreground">
                ({selectedPool.apy} APY)
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">No pool selected</span>
          )}
        </p>
      </div>
      <div className="border-t border-border" />

      {/* Stake Amount */}
      <div>
        <h4 className="font-semibold text-foreground">Stake Amount</h4>
        <p className="text-lg">{stakeAmount || "0"} MTK</p>
      </div>
      <div className="border-t border-border" />

      {/* Tokens for Permits */}
      <div>
        <h4 className="font-semibold text-foreground">
          Tokens for Permits ({selectedTokens.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {selectedTokens.length > 0 ? (
            selectedTokens.map((tokenAddress) => {
              const token = mockTokens.find((t) => t.address === tokenAddress)
              return (
                <span
                  key={tokenAddress}
                  className="text-sm bg-accent text-accent-foreground rounded-full px-3 py-1"
                >
                  {token?.symbol}
                </span>
              )
            })
          ) : (
            <span className="text-muted-foreground">None selected</span>
          )}
        </div>
      </div>
      <div className="border-t border-border" />

      {/* Estimated Cost */}
      <div>
        <h4 className="font-semibold text-foreground">Estimated Transaction Cost</h4>
        <div className="flex flex-wrap items-center gap-2 text-lg">
          <span>{Number(ethAmount).toFixed(4)} ETH</span>
          <span className="text-sm text-muted-foreground">+ Gas</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border">
                <p>
                  This includes the processing fee and an estimate for network gas fees.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </section>
))
StakingSummary.displayName = "StakingSummary"

export default function StakingForm() {
  const { address } = useWallet()
  const [poolId, setPoolId] = useState("0")
  const [stakeAmount, setStakeAmount] = useState("")
  const [ethAmount, setEthAmount] = useState("0.001")
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<null | "pending" | "success" | "error">(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // New state to disable the button after a successful transaction
  const [stakeConfirmed, setStakeConfirmed] = useState(false);

  const selectedPool = useMemo(
    () => mockPools.find(pool => pool.id.toString() === poolId),
    [poolId]
  )

  const toggleToken = (token: string) => {
    // Reset confirmation states when a token is added/removed
    setStakeConfirmed(false);
    setTxStatus(null);
    setTxHash(null);
    setErrorMessage(null);

    setSelectedTokens(prev =>
      prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]
    )
  }
  
  // New handler to clear states when pool or amount changes
  const handleStakingDetailChange = (value: string) => {
    // Reset all confirmation states
    setStakeConfirmed(false);
    setTxStatus(null);
    setTxHash(null);
    setErrorMessage(null);
    setPoolId(value);
  }

  const setMaxStakeAmount = () => {
    // Reset confirmation states
    setStakeConfirmed(false);
    setTxStatus(null);
    setTxHash(null);
    setErrorMessage(null);
    setStakeAmount("1000");
  }

  // === Simulated Blockchain Call (Optimistic UI) ===
  const handleStake = async () => {
    if (!address) {
      setErrorMessage("Wallet not connected properly")
      return
    }
    if (!stakeAmount || selectedTokens.length === 0) {
      setErrorMessage("Please enter an amount and select at least one token.")
      return
    }

    try {
      setIsSubmitting(true)
      setTxStatus("pending")
      setErrorMessage(null)

      // Simulate a 1-second delay before showing the pending state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show tx hash immediately (mocked)
      const fakeHash = "0x" + Math.floor(Math.random() * 1e16).toString(16).padEnd(64, "0")
      setTxHash(fakeHash)

      // Simulate waiting for blockchain confirmation
      await new Promise(resolve => setTimeout(resolve, 2000))

      setTxStatus("success")
      setStakeConfirmed(true); // Set the new state to true after a successful transaction
    } catch (err) {
      setTxStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 flex justify-center">
      <Card className="relative bg-card/5 backdrop-blur-xl border border-border rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-primary/20 p-4 sm:p-6 space-y-8 max-w-xl w-full">
        <CardHeader className="text-center p-0">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">Staking & Permits</CardTitle>
          <CardDescription className="text-muted-foreground">Manage your staking options and approve tokens.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-0">
          {!address ? (
            <WalletAlert />
          ) : (
            <>
              {/* Staking Details */}
              <section className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">1. Staking Details</h3>
                <PoolSelector poolId={poolId} setPoolId={setPoolId} onPoolChange={handleStakingDetailChange} />

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm text-muted-foreground font-medium">Stake Amount</Label>
                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-2">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => {
                        // Reset confirmation states when the amount changes
                        setStakeConfirmed(false);
                        setTxStatus(null);
                        setTxHash(null);
                        setErrorMessage(null);
                        setStakeAmount(e.target.value);
                      }}
                      className="rounded-xl bg-input border-border text-foreground w-full"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="sm:w-auto w-full text-primary hover:bg-primary/20 hover:text-primary-foreground"
                      onClick={setMaxStakeAmount}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Available: 1000 MTK</p>
                </div>
              </section>

              {/* Permit Options */}
              <section className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">2. Permit Options</h3>
                <TokenSelector selectedTokens={selectedTokens} toggleToken={toggleToken} />

                <div className="space-y-2">
                  <Label htmlFor="eth" className="text-sm text-muted-foreground font-medium">ETH Deposit (for gas)</Label>
                  <Input
                    id="eth"
                    type="number"
                    placeholder="0.001"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                    className="rounded-xl bg-input border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Minimum: 0.001 ETH for processing fee</p>
                </div>
              </section>

              {/* Summary */}
              <StakingSummary
                selectedPool={selectedPool}
                stakeAmount={stakeAmount}
                selectedTokens={selectedTokens}
                ethAmount={ethAmount}
              />

              {/* Confirmation */}
              <section className="space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">5. Confirmation</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                    className="border-border data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I accept the <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                  </Label>
                </div>
              </section>

              {/* Transaction Feedback */}
              {txStatus === "success" && (
                <Alert className="bg-secondary text-success border-success/20 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <AlertDescription>
                    <span className="font-medium">Transaction successful!</span><br />
                    You are now staking {stakeAmount} MTK in the {selectedPool?.name} pool.
                    {txHash && (
                      <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-sm text-primary hover:underline font-medium"
                      >
                        View on Etherscan
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {txStatus === "error" && (
                <Alert className="bg-secondary text-destructive border-destructive/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <AlertDescription>
                    <span className="font-medium">Transaction failed.</span><br />
                    {errorMessage || "Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {stakeConfirmed ? (
                // This message is shown after a successful transaction
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    To stake again, please update your staking details above.
                  </p>
                  <Button
                    onClick={() => {
                      setStakeConfirmed(false);
                      setTxStatus(null);
                      setTxHash(null);
                      setStakeAmount("");
                      setSelectedTokens([]);
                      setAcceptTerms(false);
                    }}
                    variant="outline"
                    className="w-full rounded-full py-5 text-lg font-bold"
                  >
                    Start Fresh
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || !acceptTerms || isSubmitting || selectedTokens.length === 0}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5 text-lg font-bold shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Stake Now"
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}