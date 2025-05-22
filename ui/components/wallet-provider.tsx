"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { getOptimizerContract, getTokenContract, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "@/lib/contract"

interface WalletContextType {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  chainId: number | null
  signer: ethers.Signer | null
  provider: ethers.Provider | null
  optimizerContract: ethers.Contract | null
  tokenContract: ethers.Contract | null
  getTokenContract: (tokenAddress: string) => ethers.Contract | null
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  chainId: null,
  signer: null,
  provider: null,
  optimizerContract: null,
  tokenContract: null,
  getTokenContract: () => null,
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [provider, setProvider] = useState<ethers.Provider | null>(null)
  const [optimizerContract, setOptimizerContract] = useState<ethers.Contract | null>(null)
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null)

  // Connect to wallet
  const connect = async () => {
    setIsConnecting(true)

    try {
      // Check if window.ethereum is available
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const userAddress = accounts[0]

        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(window.ethereum)
        const ethersSigner = await ethersProvider.getSigner()

        // Get network information
        const network = await ethersProvider.getNetwork()

        // Set state
        setAddress(userAddress)
        setChainId(Number(network.chainId))
        setProvider(ethersProvider)
        setSigner(ethersSigner)

        // Initialize contracts
        const optimizer = getOptimizerContract(ethersSigner)
        const token = getTokenContract(TOKEN_ADDRESS, ethersSigner)

        setOptimizerContract(optimizer)
        setTokenContract(token)

        // Store connection in localStorage
        localStorage.setItem("walletConnected", "true")

        // Setup event listeners
        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      } else {
        // Fallback to mock connection for demo purposes
        mockConnection()
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // Fallback to mock connection for demo purposes
      mockConnection()
    } finally {
      setIsConnecting(false)
    }
  }

  // Mock connection for demo purposes
  const mockConnection = () => {
    setAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    setChainId(1) // Ethereum Mainnet

    // Create a mock provider and signer
    const mockProvider = new ethers.JsonRpcProvider("http://localhost:8545")
    setProvider(mockProvider)

    // Create a mock signer with the address
    const mockSigner = new ethers.Wallet(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      mockProvider,
    )
    setSigner(mockSigner)

    // Create mock contracts
    const mockOptimizer = new ethers.Contract(CONTRACT_ADDRESS, [], mockSigner)
    const mockToken = new ethers.Contract(TOKEN_ADDRESS, [], mockSigner)

    setOptimizerContract(mockOptimizer)
    setTokenContract(mockToken)

    localStorage.setItem("walletConnected", "true")
  }

  // Handle account change
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect()
    } else {
      // User switched accounts
      setAddress(accounts[0])
    }
  }

  // Handle chain change
  const handleChainChanged = () => {
    // Reload the page on chain change as recommended by MetaMask
    window.location.reload()
  }

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null)
    setChainId(null)
    setSigner(null)
    setProvider(null)
    setOptimizerContract(null)
    setTokenContract(null)
    localStorage.removeItem("walletConnected")

    // Remove event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }

  // Get token contract instance
  const getTokenContractInstance = (tokenAddress: string) => {
    if (!signer) return null
    return getTokenContract(tokenAddress, signer)
  }

  // Check for saved connection on mount
  useEffect(() => {
    const isConnected = localStorage.getItem("walletConnected") === "true"
    if (isConnected) {
      connect()
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
        isConnecting,
        chainId,
        signer,
        provider,
        optimizerContract,
        tokenContract,
        getTokenContract: getTokenContractInstance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Add type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, listener: (...args: any[]) => void) => void
      removeListener: (event: string, listener: (...args: any[]) => void) => void
    }
  }
}
