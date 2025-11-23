'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { LZ_ENDPOINT_IDS } from '@/config/chains'
import { getContractAddress, OFT_ABI, ONFT_ABI } from '@/config/contracts'
import { addressToBytes32 } from '@/lib/utils'

type TokenType = 'energy' | 'wood' | 'ore' | 'onft'

export function useTokenBridge() {
  const { address, chainId } = useAccount()
  const [status, setStatus] = useState<'idle' | 'quoting' | 'approving' | 'sending' | 'complete' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { writeContractAsync } = useWriteContract()

  const bridgeToken = async (
    tokenType: TokenType,
    amount: string,
    dstChainId: number,
    tokenId?: number
  ) => {
    if (!chainId || !address) {
      setErrorMessage('Please connect your wallet')
      setStatus('error')
      return
    }

    try {
      setErrorMessage('')
      setStatus('quoting')

      const isONFT = tokenType === 'onft'
      const contractAddress = getContractAddress(chainId, tokenType)
      if (!contractAddress) throw new Error(`${tokenType} not deployed on this chain`)

      const dstEid = LZ_ENDPOINT_IDS[dstChainId as keyof typeof LZ_ENDPOINT_IDS]
      if (!dstEid) throw new Error('Invalid destination chain')

      if (isONFT) {
        // Bridge ONFT
        if (tokenId === undefined) throw new Error('Token ID required for ONFT')

        const sendParam = {
          dstEid,
          to: addressToBytes32(address),
          tokenId: BigInt(tokenId),
          extraOptions: '0x' as `0x${string}`,
          composeMsg: '0x' as `0x${string}`,
          onftCmd: '0x' as `0x${string}`,
        }

        // Get quote
        const { data: quote } = await useReadContract({
          address: contractAddress,
          abi: ONFT_ABI,
          functionName: 'quoteSend',
          args: [sendParam, false],
        })

        const nativeFee = ((quote as any).nativeFee * 120n) / 100n

        setStatus('sending')

        const hash = await writeContractAsync({
          address: contractAddress,
          abi: ONFT_ABI,
          functionName: 'send',
          args: [sendParam, { nativeFee, lzTokenFee: 0n }, address],
          value: nativeFee,
        })

        await useWaitForTransactionReceipt({ hash })
      } else {
        // Bridge OFT
        const amountBN = parseEther(amount)

        const sendParam = {
          dstEid,
          to: addressToBytes32(address),
          amountLD: amountBN,
          minAmountLD: (amountBN * 95n) / 100n, // 5% slippage
          extraOptions: '0x' as `0x${string}`,
          composeMsg: '0x' as `0x${string}`,
          oftCmd: '0x' as `0x${string}`,
        }

        // Get quote
        const { data: quote } = await useReadContract({
          address: contractAddress,
          abi: OFT_ABI,
          functionName: 'quoteSend',
          args: [sendParam, false],
        })

        const nativeFee = ((quote as any).nativeFee * 120n) / 100n

        setStatus('sending')

        const hash = await writeContractAsync({
          address: contractAddress,
          abi: OFT_ABI,
          functionName: 'send',
          args: [sendParam, { nativeFee, lzTokenFee: 0n }, address],
          value: nativeFee,
        })

        await useWaitForTransactionReceipt({ hash })
      }

      setStatus('complete')
    } catch (error: any) {
      console.error('Bridge error:', error)
      setErrorMessage(error.message || 'Failed to bridge token')
      setStatus('error')
      throw error
    }
  }

  return {
    bridgeToken,
    status,
    errorMessage,
    resetStatus: () => setStatus('idle'),
  }
}

