'use client'

import { useReadContract } from 'wagmi'
import { baseSepolia } from '@/config/chains'
import { getContractAddress, AETHERIA_HUB_ABI } from '@/config/contracts'

export function usePlayerStats(tokenId?: number) {
  const hubAddress = getContractAddress(baseSepolia.id, 'hub')

  const { data: stats, isLoading, refetch } = useReadContract({
    address: hubAddress,
    abi: AETHERIA_HUB_ABI,
    functionName: 'getPlayerStats',
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    chainId: baseSepolia.id,
    query: {
      enabled: !!hubAddress && tokenId !== undefined,
    },
  })

  const { data: totalGoblinsKilled } = useReadContract({
    address: hubAddress,
    abi: AETHERIA_HUB_ABI,
    functionName: 'totalGoblinsKilled',
    chainId: baseSepolia.id,
    query: {
      enabled: !!hubAddress,
    },
  })

  return {
    stats: stats ? {
      totalBattles: Number(stats[0]),
      goblinsKilled: Number(stats[1]),
      battlesLost: Number(stats[2]),
    } : null,
    totalGoblinsKilled: totalGoblinsKilled ? Number(totalGoblinsKilled) : 0,
    isLoading,
    refetch,
  }
}

