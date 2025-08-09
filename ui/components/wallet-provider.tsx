"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { getOptimizerContract, getTokenContract, CONTRACT_ADDRESS, TOKEN_ADDRESS } from "@/lib/contract"

// ✅ Added constant so it's defined everywhere you need it
const MOCK_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

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
  setMockAddress: (mockAddr: string) => void
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
  setMockAddress: () => {},
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

  const setMockAddress = (mockAddr: string) => {
    setAddress(mockAddr)
    setChainId(1)

    const mockProvider = new ethers.JsonRpcProvider("http://localhost:8545")
    setProvider(mockProvider)

    const mockSigner = new ethers.Wallet(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      mockProvider
    )
    setSigner(mockSigner)

    const mockOptimizer = new ethers.Contract(CONTRACT_ADDRESS, [], mockSigner)
    const mockToken = new ethers.Contract(TOKEN_ADDRESS, [], mockSigner)
    setOptimizerContract(mockOptimizer)
    setTokenContract(mockToken)

    sessionStorage.setItem("mockConnected", "true") 
  }

  const connect = async () => {
    setIsConnecting(true)

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await ethersProvider.send("eth_requestAccounts", [])
        const userAddress = accounts[0]
        const ethersSigner = await ethersProvider.getSigner()
        const network = await ethersProvider.getNetwork()

        setAddress(userAddress)
        setChainId(Number(network.chainId))
        setProvider(ethersProvider)
        setSigner(ethersSigner)

        const optimizer = getOptimizerContract(ethersSigner)
        const token = getTokenContract(TOKEN_ADDRESS, ethersSigner)
        setOptimizerContract(optimizer)
        setTokenContract(token)

        sessionStorage.setItem("walletConnected", "true")
        sessionStorage.removeItem("mockConnected") 

        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
      } else {
        console.error("No Ethereum provider found. Please install a wallet like MetaMask.")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      disconnect()
    } finally {
      setIsConnecting(false)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAddress(accounts[0])
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const disconnect = () => {
    setAddress(null)
    setChainId(null)
    setSigner(null)
    setProvider(null)
    setOptimizerContract(null)
    setTokenContract(null)
    sessionStorage.removeItem("walletConnected")
    sessionStorage.removeItem("mockConnected")
    
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }

  const getTokenContractInstance = (tokenAddress: string) => {
    if (!signer) return null
    return getTokenContract(tokenAddress, signer)
  }

  useEffect(() => {
    const wasConnected = sessionStorage.getItem("walletConnected") === "true"
    const wasMockConnected = sessionStorage.getItem("mockConnected") === "true"

    if (wasConnected && typeof window !== "undefined" && window.ethereum?.selectedAddress) {
      connect()
    } else if (wasMockConnected) {
      setMockAddress(MOCK_ADDRESS)
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
        setMockAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

declare global {
  interface Window {
    ethereum?: {
      selectedAddress?: string
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, listener: (...args: any[]) => void) => void
      removeListener: (event: string, listener: (...args: any[]) => void) => void
    }
  }
}
