'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatTokenAmount } from '@/lib/utils'
import { getContractAddress, OFT_ABI } from '@/config/contracts'
import { useResourceVault } from '@/hooks/useResourceVault'

export function ResourceVault() {
  const { address, chainId } = useAccount()
  const [amount, setAmount] = useState('')
  const [resourceType, setResourceType] = useState<'wood' | 'ore'>('wood')
  const { burnForResource, status, errorMessage, resetStatus } = useResourceVault()

  const energyAddress = chainId ? getContractAddress(chainId, 'energy') : undefined
  const woodAddress = chainId ? getContractAddress(chainId, 'wood') : undefined
  const oreAddress = chainId ? getContractAddress(chainId, 'ore') : undefined

  // Read balances
  const { data: energyBalance } = useReadContract({
    address: energyAddress,
    abi: OFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!energyAddress,
    },
  })

  const { data: woodBalance } = useReadContract({
    address: woodAddress,
    abi: OFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!woodAddress,
    },
  })

  const { data: oreBalance } = useReadContract({
    address: oreAddress,
    abi: OFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!oreAddress,
    },
  })

  const handleGetResource = async () => {
    if (!amount) return
    try {
      await burnForResource(resourceType, amount)
      setAmount('')
    } catch (error) {
      console.error('Failed to get resource:', error)
    }
  }

  if (!address) {
    return (
      <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-8 text-center">
        <p className="text-gray-300">Please connect your wallet to access the vault</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balances */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 p-6">
          <p className="text-sm text-gray-400 mb-1">⚡ Energy</p>
          <p className="text-3xl font-bold">{energyBalance ? formatTokenAmount(energyBalance as bigint) : '0'}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 p-6">
          <p className="text-sm text-gray-400 mb-1">🌲 Wood</p>
          <p className="text-3xl font-bold">{woodBalance ? formatTokenAmount(woodBalance as bigint) : '0'}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/30 p-6">
          <p className="text-sm text-gray-400 mb-1">⛏️ Ore</p>
          <p className="text-3xl font-bold">{oreBalance ? formatTokenAmount(oreBalance as bigint) : '0'}</p>
        </div>
      </div>

      {/* Vault Card */}
      <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-8">
        <h2 className="text-3xl font-bold mb-6">🏦 Resource Vault</h2>

        {/* Exchange Rate Info */}
        <div className="mb-6 p-4 rounded-lg bg-gray-800/50">
          <p className="text-sm text-gray-400 mb-2">Exchange Rate</p>
          <p className="text-lg font-bold">1 Energy = 1 {resourceType === 'wood' ? 'Wood' : 'Ore'}</p>
        </div>

        {/* Resource Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Resource</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setResourceType('wood')}
              className={`px-6 py-4 rounded-lg font-bold transition-all ${
                resourceType === 'wood'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              }`}
              disabled={status !== 'idle'}
            >
              🌲 Wood
            </button>
            <button
              onClick={() => setResourceType('ore')}
              className={`px-6 py-4 rounded-lg font-bold transition-all ${
                resourceType === 'ore'
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              }`}
              disabled={status !== 'idle'}
            >
              ⛏️ Ore
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Energy Amount to Burn</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-green-500 focus:outline-none"
              placeholder="0.0"
              disabled={status !== 'idle'}
              step="0.1"
              min="0"
            />
            <button
              onClick={() => setAmount(energyBalance ? formatTokenAmount(energyBalance as bigint) : '0')}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm rounded bg-gray-800 hover:bg-gray-700 border border-gray-600"
              disabled={status !== 'idle'}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {status !== 'idle' && status !== 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
              <p className="font-medium">
                {status === 'approving' && 'Approving Energy...'}
                {status === 'minting' && 'Burning Energy and minting resources...'}
                {status === 'complete' && '✅ Resources received!'}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
            <p className="text-red-400">{errorMessage}</p>
            <button
              onClick={resetStatus}
              className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGetResource}
          disabled={!amount || parseFloat(amount) <= 0 || status !== 'idle'}
          className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold text-lg transition-all"
        >
          {status === 'idle' ? `Get ${resourceType === 'wood' ? 'Wood' : 'Ore'}` : 'Processing...'}
        </button>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-gray-800/30 text-sm text-gray-400">
          <p className="mb-2"><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Select resource type (Wood or Ore)</li>
            <li>Enter amount of Energy to burn</li>
            <li>Approve Energy token spending (first time only)</li>
            <li>Receive equivalent amount of resources instantly</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

