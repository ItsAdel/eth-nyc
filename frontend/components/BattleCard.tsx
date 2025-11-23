'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { getContractAddress, ONFT_ABI } from '@/config/contracts'
import { useONFTBattle } from '@/hooks/useONFTBattle'
import { arbitrumSepolia, optimismSepolia, baseSepolia } from '@/config/chains'

export function BattleCard() {
  const { address, chainId } = useAccount()
  const [tokenId, setTokenId] = useState('')
  const [dstChain, setDstChain] = useState<number>(baseSepolia.id)
  const { sendToBattle, status, errorMessage, resetStatus } = useONFTBattle()

  const onftAddress = chainId ? getContractAddress(chainId, 'onft') : undefined

  // Read user's ONFT balance
  const { data: balance } = useReadContract({
    address: onftAddress,
    abi: ONFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!onftAddress,
    },
  })

  const handleBattle = async () => {
    if (!tokenId) return
    try {
      await sendToBattle(parseInt(tokenId), dstChain)
    } catch (error) {
      console.error('Battle failed:', error)
    }
  }

  // Only show on chains that have ONFTs (Arbitrum, Optimism)
  if (!chainId || (chainId !== arbitrumSepolia.id && chainId !== optimismSepolia.id)) {
    return (
      <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-8 text-center">
        <p className="text-gray-300">Please connect to Arbitrum Sepolia or Optimism Sepolia to battle</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-8">
      <h2 className="text-3xl font-bold mb-6">⚔️ Send NFT to Battle</h2>
      
      {/* Balance Display */}
      <div className="mb-6 p-4 rounded-lg bg-gray-800/50">
        <p className="text-sm text-gray-400">Your ONFTs</p>
        <p className="text-2xl font-bold">{balance?.toString() || '0'}</p>
      </div>

      {/* Input */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Token ID</label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="Enter token ID"
            disabled={status !== 'idle'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Battle Arena Chain</label>
          <select
            value={dstChain}
            onChange={(e) => setDstChain(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none"
            disabled={status !== 'idle'}
          >
            {chainId === arbitrumSepolia.id && (
              <option value={optimismSepolia.id}>Optimism Sepolia</option>
            )}
            {chainId === optimismSepolia.id && (
              <option value={arbitrumSepolia.id}>Arbitrum Sepolia</option>
            )}
          </select>
        </div>
      </div>

      {/* Status Messages */}
      {status !== 'idle' && status !== 'error' && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
            <p className="font-medium">
              {status === 'quoting' && 'Preparing transaction...'}
              {status === 'sending' && 'Sending NFT...'}
              {status === 'battling' && 'Battle in progress...'}
              {status === 'complete' && '✅ Battle complete! Rewards incoming...'}
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
        onClick={handleBattle}
        disabled={!tokenId || status !== 'idle'}
        className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold text-lg transition-all"
      >
        {status === 'idle' ? 'Send to Battle' : 'Processing...'}
      </button>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800/30 text-sm text-gray-400">
        <p className="mb-2"><strong>How it works:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Your NFT travels to the battle arena chain</li>
          <li>Automatic battle with 50% win chance</li>
          <li>NFT returns to you automatically</li>
          <li>Energy tokens sent to your wallet as rewards</li>
        </ol>
      </div>
    </div>
  )
}

