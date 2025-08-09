"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/components/wallet-provider"
import { ExternalLink, AlertCircle } from "lucide-react"

interface Transaction {
  hash: string
  type: "stake" | "vip" | "harvest"
  timestamp: number
  status: "success" | "pending" | "failed"
  value: string
  poolId?: number
  permitCount?: number
}

export default function TransactionHistory() {
  const { address } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (address) {
      setTransactions([
        {
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          type: "stake",
          timestamp: Date.now() - 3600000,
          status: "success",
          value: "50 MTK",
          poolId: 0,
          permitCount: 1,
        },
        {
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          type: "vip",
          timestamp: Date.now() - 86400000,
          status: "success",
          value: "50 MTK",
          permitCount: 5,
        },
        {
          hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
          type: "harvest",
          timestamp: Date.now() - 172800000,
          status: "success",
          value: "0.003 ETH",
          poolId: 1,
        },
      ])
    }
  }, [address])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  if (!address) {
    return (
      // Replaced hardcoded dark theme colors with theme-aware ones.
      <Card className="bg-card border-border text-foreground rounded-3xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Connect your wallet to view your transaction history.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    // The main card is now styled with theme-aware variables.
    <Card className="bg-card border-border text-foreground rounded-3xl shadow-lg">
      <CardHeader className="border-b border-border p-6">
        <CardTitle className="text-2xl font-bold text-foreground">Transaction History</CardTitle>
        <CardDescription className="text-muted-foreground">Your recent transactions with Honey Drip.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              {/* Table headers now use muted-foreground for consistency. */}
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Value</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, i) => (
              // Table rows use border-border and a hover effect with background from muted/10.
              <TableRow key={i} className="border-border hover:bg-muted/10 transition-colors duration-200">
                <TableCell className="text-foreground">
                  <Badge
                    // Badge colors are replaced with theme-aware versions.
                    className={
                      tx.type === "stake"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : tx.type === "vip"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }
                  >
                    {tx.type === "stake" ? "Stake" : tx.type === "vip" ? "VIP Stake" : "Harvest"}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground">{formatDate(tx.timestamp)}</TableCell>
                <TableCell className="text-foreground">{tx.value}</TableCell>
                <TableCell>
                  <Badge
                    // Status badges also use theme-aware colors.
                    className={
                      tx.status === "success" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : tx.status === "pending" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Link color is now dynamic and uses the primary theme color on hover.
                    className="flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {truncateHash(tx.hash)}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}