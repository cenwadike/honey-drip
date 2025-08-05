"use client"

import { useState, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/components/wallet-provider"
import { AlertCircle, CheckCircle2, Loader2, Info, Lock } from "lucide-react" // Added Lock icon
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { mockTokens, vipTiers } from "@/lib/contract"

// === Components ===
const WalletAlert = memo(() => (
  <Alert className="text-center bg-accent/20 backdrop-blur-xl border border-accent text-accent-foreground rounded-xl">
    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
    <AlertDescription>Please connect your wallet to access VIP staking.</AlertDescription>
  </Alert>
))
WalletAlert.displayName = "WalletAlert"

const TokenSelector = memo(({ selectedTokens, toggleToken, maxPermits }: any) => ( // Added maxPermits prop
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
    {mockTokens.map((token) => {
      const isSelected = selectedTokens.includes(token.address);
      // Disable token if already selected OR if maxPermits reached and this token is not selected
      const isDisabled = !isSelected && selectedTokens.length >= maxPermits;

      return (
        <div
          key={token.address}
          className={`relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200
            ${isSelected
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border bg-card/5 hover:border-accent hover:bg-accent/10"
            }
            ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={() => !isDisabled && toggleToken(token.address)} // Prevent click if disabled
        >
          <div className="flex-grow">
            <span className="font-semibold text-foreground">{token.symbol}</span>
            <p className="text-xs text-muted-foreground">{token.balance}</p>
          </div>
          {isSelected && (
            <CheckCircle2 className="h-5 w-5 text-primary absolute top-2 right-2" />
          )}
          {isDisabled && !isSelected && ( // Show lock icon for disabled, unselected tokens
            <Lock className="h-4 w-4 text-muted-foreground absolute top-2 right-2" />
          )}
        </div>
      );
    })}
  </div>
))
TokenSelector.displayName = "TokenSelector"

const VipLevelSelector = memo(({ vipLevel, setVipLevel, currentVipTier, hasStakedHoneyPool }: any) => {
  const maxSliderLevel = hasStakedHoneyPool ? 3 : 1; // Max level depends on Honey Pool stake

  return (
    <div className="space-y-3 pt-2">
      <div className="flex justify-between items-center">
        <Label className="font-semibold text-muted-foreground">
          VIP Level: <span className="text-primary">{vipLevel}</span>
        </Label>
        <span className="text-sm font-medium text-primary">{currentVipTier.apy} APY</span>
      </div>
      <Slider
        value={[vipLevel]}
        min={1}
        max={maxSliderLevel} // Dynamic max
        step={1}
        onValueChange={(value) => setVipLevel(value[0])}
        className="[&>span]:bg-primary [&>span:nth-of-type(2)]:bg-primary/50"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Level 1</span>
        <span className="flex items-center gap-1">
          Level 2
          {!hasStakedHoneyPool && <Lock className="h-3 w-3 text-muted-foreground" />}
        </span>
        <span className="flex items-center gap-1">
          Level 3
          {!hasStakedHoneyPool && <Lock className="h-3 w-3 text-muted-foreground" />}
        </span>
      </div>
      {!hasStakedHoneyPool && vipLevel > 1 && ( // Message for locked levels
        <Alert className="bg-secondary/20 border-border text-muted-foreground rounded-xl mt-4">
          <AlertCircle className="h-5 w-5 text-accent" />
          <AlertDescription className="text-sm">
            To unlock VIP Levels 2 & 3, you must first stake with the **Honey Pool** at least once.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});
VipLevelSelector.displayName = "VipLevelSelector"

const VipStakingSummary = memo(({ vipLevel, currentVipTier, selectedTokens, ethAmount }: any) => (
  <section className="space-y-4">
    <h3 className="text-lg sm:text-xl font-semibold text-foreground">3. Staking Summary</h3>
    <div className="bg-muted/5 backdrop-blur-xl border border-border rounded-xl p-4 space-y-4 text-muted-foreground">
      <div>
        <h4 className="font-semibold text-foreground">Selected VIP Level</h4>
        <p className="text-lg">
          Level {vipLevel}{" "}
          <span className="text-sm text-muted-foreground">({currentVipTier.apy} APY)</span>
        </p>
      </div>
      <div className="border-t border-border" />

      <div>
        <h4 className="font-semibold text-foreground">Tokens for Permits ({selectedTokens.length})</h4>
        <div className="flex flex-wrap gap-2">
          {selectedTokens.length > 0 ? (
            selectedTokens.map((tokenAddress) => {
              const token = mockTokens.find((t) => t.address === tokenAddress)
              return (
                <span key={tokenAddress} className="text-sm bg-accent text-accent-foreground rounded-full px-3 py-1">
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

      <div>
        <h4 className="font-semibold text-foreground">Estimated Transaction Cost</h4>
        <div className="flex flex-wrap items-center gap-2 text-lg">
          <span>{ethAmount.toFixed(3)} ETH</span>
          <span className="text-sm text-muted-foreground">+ Gas</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground border-border">
                <p>This includes the 2x processing fee and an estimate for network gas fees.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  </section>
))
VipStakingSummary.displayName = "VipStakingSummary"

export default function VipStakingForm() {
  const { address } = useWallet()
  const [vipLevel, setVipLevel] = useState(1)
  const [acceptVipTerms, setAcceptVipTerms] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txStatus, setTxStatus] = useState<null | "pending" | "success" | "error">(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  // New state to track if Honey Pool has been staked (mocked for now)
  const [hasStakedHoneyPool, setHasStakedHoneyPool] = useState(false);
  // New state to track if VIP program has been joined
  const [isVipJoined, setIsVipJoined] = useState(false);

  const currentVipTier = useMemo(() => vipTiers[vipLevel - 1], [vipLevel])
  const ethAmount = 0.002

  const toggleToken = (token: string) => {
    // Reset VIP joined status and transaction status when tokens are changed
    setIsVipJoined(false);
    setTxStatus(null);
    setTxHash(null);
    setErrorMessage(null);

    // Prevent adding more tokens than allowed for the current VIP level
    if (!selectedTokens.includes(token) && selectedTokens.length >= currentVipTier.permits) {
      setErrorMessage(`You can select a maximum of ${currentVipTier.permits} tokens for VIP Level ${vipLevel}.`);
      return;
    }

    setSelectedTokens(prev =>
      prev.includes(token) ? prev.filter(t => t !== token) : [...prev, token]
    )
  }

  // Handle VIP level change to reset transaction status
  const handleVipLevelChange = (value: number) => {
    // Reset VIP joined status and transaction status when VIP level is changed
    setIsVipJoined(false);
    setTxStatus(null);
    setTxHash(null);
    setErrorMessage(null);
    setVipLevel(value);
  }

  // === Optimistic-UI Simulated Blockchain Call ===
  const handleVipStake = async () => {
    if (!address) {
      setErrorMessage("Wallet not connected properly")
      return
    }
    if (selectedTokens.length < currentVipTier.permits) {
      setErrorMessage(`VIP staking requires at least ${currentVipTier.permits} tokens for Level ${vipLevel}.`)
      return
    }
    if (currentVipTier.level > 1 && !hasStakedHoneyPool) {
      setErrorMessage("To join VIP Levels 2 & 3, you must first stake with the Honey Pool.")
      return;
    }

    try {
      setIsSubmitting(true)
      setTxStatus("pending")
      setErrorMessage(null)

      const fakeHash = "0x" + Math.floor(Math.random() * 1e16).toString(16).padEnd(64, "0")
      setTxHash(fakeHash)

      await new Promise(resolve => setTimeout(resolve, 2000))

      setTxStatus("success")
      setIsVipJoined(true); // Set VIP joined status on success
      // Simulate staking Honey Pool for demonstration purposes
      if (vipLevel === 1) { // Assuming initial VIP join is Level 1
        setHasStakedHoneyPool(true); // Simulate Honey Pool stake after first VIP join
      }
    } catch (err) {
      setTxStatus("error")
      setErrorMessage(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to reset the form to a clean slate
  const handleStartFresh = () => {
    setVipLevel(1);
    setAcceptVipTerms(false);
    setSelectedTokens([]);
    setIsSubmitting(false);
    setTxStatus(null);
    setTxHash(null);
    setErrorMessage(null);
    setIsVipJoined(false);
    // Do NOT reset hasStakedHoneyPool here, as it represents a permanent action.
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 flex justify-center">
      <div className="grid gap-8 max-w-6xl w-full mx-auto md:grid-cols-2">
        {/* Main VIP Form */}
        <Card className="relative bg-card/5 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-4 sm:p-6 space-y-8">
          <CardHeader className="text-center p-0">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">Join {">"}12,000 VIPs</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Unlock higher yields with multi-permit staking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            {!address ? (
              <WalletAlert />
            ) : (
              <>
                {/* Token Selection */}
                <section className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">1. Select Permit Tokens</h3>
                  <p className={`text-sm ${selectedTokens.length < currentVipTier.permits ? 'text-destructive' : 'text-success'}`}>
                    Selected: {selectedTokens.length} / {currentVipTier.permits} minimum
                  </p>
                  <TokenSelector selectedTokens={selectedTokens} toggleToken={toggleToken} maxPermits={currentVipTier.permits} />
                </section>

                {/* VIP Level Selection */}
                <section className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">2. Choose VIP Level</h3>
                  <VipLevelSelector vipLevel={vipLevel} setVipLevel={handleVipLevelChange} currentVipTier={currentVipTier} hasStakedHoneyPool={hasStakedHoneyPool} />
                </section>

                {/* Staking Summary */}
                <VipStakingSummary
                  vipLevel={vipLevel}
                  currentVipTier={currentVipTier}
                  selectedTokens={selectedTokens}
                  ethAmount={ethAmount}
                />

                {/* Confirmation */}
                <section className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">4. Confirmation</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vipTerms"
                      checked={acceptVipTerms}
                      onCheckedChange={(checked) => setAcceptVipTerms(!!checked)}
                      className="border-border data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="vipTerms" className="text-sm text-muted-foreground">
                      I accept the{" "}
                      <a href="#" className="text-primary hover:underline font-medium">
                        VIP Terms of Service
                      </a>
                    </Label>
                  </div>
                </section>

                {/* Transaction Feedback */}
                {txStatus === "success" && (
                  <Alert className="bg-secondary text-success border-success/20 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <AlertDescription>
                      <span className="font-medium">Welcome to the VIP Program!</span><br/>
                      You are now a Level {vipLevel} VIP.
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

                {isVipJoined ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You are currently a Level {vipLevel} VIP.
                      {vipLevel < 3 && hasStakedHoneyPool && (
                        <span> To upgrade, select a higher VIP Level above.</span>
                      )}
                      {!hasStakedHoneyPool && vipLevel < 3 && (
                        <span> To upgrade to Level 2 or 3, you must first stake with the Honey Pool.</span>
                      )}
                    </p>
                    <Button
                      onClick={handleStartFresh}
                      variant="outline"
                      className="w-full rounded-full py-5 text-lg font-bold"
                    >
                      Start Fresh
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleVipStake}
                    disabled={selectedTokens.length < currentVipTier.permits || !acceptVipTerms || isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-5 text-lg font-bold shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Join VIP Program"
                    )}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* VIP Tiers & Benefits */}
        <Card className="bg-card/5 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-6">
          <h3 className="text-2xl font-bold text-foreground">VIP Tiers & Benefits</h3>
          <p className="text-muted-foreground mt-2">Upgrade your staking experience by joining a higher VIP tier.</p>
          <div className="mt-4 space-y-4">
            {vipTiers.map((tier, i) => (
              <Card
                key={i}
                className={`transition-all duration-300 bg-card/5 border-border text-foreground rounded-2xl shadow-sm
                  ${vipLevel === tier.level
                    ? "border-primary ring-2 ring-primary/50 shadow-lg scale-[1.02]"
                    : "hover:border-primary hover:bg-card/10"
                  }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-foreground">Level {tier.level}</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1">
                      {tier.apy} APY
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    Requires {tier.permits} permit tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Priority reward harvesting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Reduced gas fees on transactions</span>
                    </li>
                    {tier.level >= 2 && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Access to exclusive pools</span>
                      </li>
                    )}
                    {tier.level >= 3 && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
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
  )
}