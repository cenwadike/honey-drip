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

  // Mock transaction data to simulate a live wallet.
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
    return (
      // Display a friendly message if the wallet is not connected.
      <Card className="bg-gray-900 border-gray-800 text-gray-200 rounded-3xl shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-gray-600 mb-4" />
            <p className="text-gray-500">
              Connect your wallet to view your transaction history.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    // The main card is styled to match the dark theme.
    <Card className="bg-gray-900 border-gray-800 text-gray-200 rounded-3xl shadow-lg">
      <CardHeader className="border-b border-gray-800 p-6">
        <CardTitle className="text-2xl font-bold text-white">Transaction History</CardTitle>
        <CardDescription className="text-gray-400">Your recent transactions with Honey Drip.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Value</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, i) => (
              // Table rows have a hover effect for better user experience.
              <TableRow key={i} className="border-gray-800 hover:bg-gray-800 transition-colors duration-200">
                <TableCell className="text-gray-300">
                  <Badge
                    // Badges are styled with new background and text colors to fit the dark theme.
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
                <TableCell className="text-gray-300">{formatDate(tx.timestamp)}</TableCell>
                <TableCell className="text-gray-300">{tx.value}</TableCell>
                <TableCell>
                  <Badge
                    // Status badges are also updated to be visually distinct and match the theme.
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
                    className="flex items-center text-sm text-gray-500 transition-colors duration-200 hover:text-amber-500"
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
