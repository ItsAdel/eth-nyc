'use client'

import { useState } from 'react'
import { usePlayerStats } from '@/hooks/usePlayerStats'

export function PlayerStats() {
  const [tokenId, setTokenId] = useState('')
  const { stats, totalGoblinsKilled, isLoading, refetch } = usePlayerStats(
    tokenId ? parseInt(tokenId) : undefined
  )

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-8">
        <h2 className="text-3xl font-bold mb-4">🌍 Global Stats</h2>
        <div className="grid gap-4 md:grid-cols-1">
          <div className="p-6 rounded-lg bg-gray-800/50">
            <p className="text-sm text-gray-400 mb-1">Total Goblins Defeated</p>
            <p className="text-4xl font-bold text-yellow-400">{totalGoblinsKilled}</p>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-8">
        <h2 className="text-3xl font-bold mb-6">📊 Player Stats</h2>

        {/* Token ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Player NFT Token ID</label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="Enter token ID to view stats"
          />
        </div>

        {/* Stats Display */}
        {tokenId && !isLoading && stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-6 rounded-lg bg-gray-800/50">
              <p className="text-sm text-gray-400 mb-1">Total Battles</p>
              <p className="text-3xl font-bold">{stats.totalBattles}</p>
            </div>

            <div className="p-6 rounded-lg bg-green-500/20 border border-green-500/30">
              <p className="text-sm text-gray-400 mb-1">Goblins Killed</p>
              <p className="text-3xl font-bold text-green-400">{stats.goblinsKilled}</p>
            </div>

            <div className="p-6 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-sm text-gray-400 mb-1">Battles Lost</p>
              <p className="text-3xl font-bold text-red-400">{stats.battlesLost}</p>
            </div>
          </div>
        )}

        {tokenId && !isLoading && stats && stats.totalBattles > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-gray-800/50">
            <p className="text-sm text-gray-400 mb-1">Win Rate</p>
            <p className="text-2xl font-bold">
              {((stats.goblinsKilled / stats.totalBattles) * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {tokenId && !isLoading && !stats && (
          <div className="p-6 rounded-lg bg-gray-800/50 text-center">
            <p className="text-gray-400">No battle data found for this token ID</p>
          </div>
        )}

        {tokenId && isLoading && (
          <div className="p-6 rounded-lg bg-gray-800/50 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent mx-auto" />
            <p className="text-gray-400 mt-2">Loading stats...</p>
          </div>
        )}

        {!tokenId && (
          <div className="p-6 rounded-lg bg-gray-800/50 text-center">
            <p className="text-gray-400">Enter a token ID to view player statistics</p>
          </div>
        )}
      </div>
    </div>
  )
}

