'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { getContractAddress, RESOURCE_OFT_ABI, OFT_ABI } from '@/config/contracts'

type ResourceType = 'wood' | 'ore'

export function useResourceVault() {
  const { address, chainId } = useAccount()
  const [status, setStatus] = useState<'idle' | 'approving' | 'minting' | 'complete' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { writeContractAsync } = useWriteContract()

  const burnForResource = async (resourceType: ResourceType, amount: string) => {
    if (!chainId || !address) {
      setErrorMessage('Please connect your wallet')
      setStatus('error')
      return
    }

    try {
      setErrorMessage('')
      const energyAddress = getContractAddress(chainId, 'energy')
      const resourceAddress = getContractAddress(chainId, resourceType)

      if (!energyAddress || !resourceAddress) {
        throw new Error(`Contracts not deployed on this chain`)
      }

      const amountBN = parseEther(amount)

      // Check allowance
      const { data: allowance } = await useReadContract({
        address: energyAddress,
        abi: OFT_ABI,
        functionName: 'allowance',
        args: [address, resourceAddress],
      })

      // Approve if needed
      if (!allowance || (allowance as bigint) < amountBN) {
        setStatus('approving')
        const approveHash = await writeContractAsync({
          address: energyAddress,
          abi: OFT_ABI,
          functionName: 'approve',
          args: [resourceAddress, amountBN],
        })

        await useWaitForTransactionReceipt({ hash: approveHash })
      }

      // Burn and mint
      setStatus('minting')
      const mintHash = await writeContractAsync({
        address: resourceAddress,
        abi: RESOURCE_OFT_ABI,
        functionName: 'burnEnergyAndMint',
        args: [amountBN],
      })

      await useWaitForTransactionReceipt({ hash: mintHash })

      setStatus('complete')
      return mintHash
    } catch (error: any) {
      console.error('Resource vault error:', error)
      setErrorMessage(error.message || 'Failed to get resources')
      setStatus('error')
      throw error
    }
  }

  return {
    burnForResource,
    status,
    errorMessage,
    resetStatus: () => setStatus('idle'),
  }
}

