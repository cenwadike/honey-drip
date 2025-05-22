"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/components/wallet-provider"
import { ExternalLink } from "lucide-react"

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

  // Mock transaction data
  useEffect(() => {
    if (address) {
      // In a real implementation, this would fetch from a backend or blockchain
      setTransactions([
        {
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          type: "stake",
          timestamp: Date.now() - 3600000, // 1 hour ago
          status: "success",
          value: "50 MTK",
          poolId: 0,
          permitCount: 1,
        },
        {
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          type: "vip",
          timestamp: Date.now() - 86400000, // 1 day ago
          status: "success",
          value: "50 MTK",
          permitCount: 5,
        },
        {
          hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
          type: "harvest",
          timestamp: Date.now() - 172800000, // 2 days ago
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
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent transactions with Honey Drip</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      tx.type === "stake"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : tx.type === "vip"
                          ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }
                  >
                    {tx.type === "stake" ? "Stake" : tx.type === "vip" ? "VIP Stake" : "Harvest"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(tx.timestamp)}</TableCell>
                <TableCell>{tx.value}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.status === "success" ? "outline" : tx.status === "pending" ? "secondary" : "destructive"
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
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
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
