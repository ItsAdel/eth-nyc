'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { encodePacked, parseEther } from 'viem'
import { LZ_ENDPOINT_IDS } from '@/config/chains'
import { getContractAddress, ONFT_ABI } from '@/config/contracts'
import { addressToBytes32 } from '@/lib/utils'

export function useONFTBattle() {
  const { address, chainId } = useAccount()
  const [status, setStatus] = useState<'idle' | 'quoting' | 'sending' | 'battling' | 'complete' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { writeContractAsync } = useWriteContract()

  // Function to get quote for sending ONFT
  const getQuote = async (tokenId: number, dstChainId: number) => {
    if (!chainId || !address) throw new Error('Not connected')
    
    const onftAddress = getContractAddress(chainId, 'onft')
    if (!onftAddress) throw new Error('ONFT not deployed on this chain')

    const dstEid = LZ_ENDPOINT_IDS[dstChainId as keyof typeof LZ_ENDPOINT_IDS]
    if (!dstEid) throw new Error('Invalid destination chain')

    const composerAddress = getContractAddress(dstChainId, 'composer')
    if (!composerAddress) throw new Error('Composer not deployed on destination')

    // Encode compose message with tokenId
    const composeMsg = encodePacked(['uint256'], [BigInt(tokenId)])

    const sendParam = {
      dstEid,
      to: addressToBytes32(composerAddress),
      tokenId: BigInt(tokenId),
      extraOptions: '0x',
      composeMsg,
      onftCmd: '0x',
    }

    // Quote the send (read-only call)
    const { data } = await useReadContract({
      address: onftAddress,
      abi: ONFT_ABI,
      functionName: 'quoteSend',
      args: [sendParam, false],
    })

    return data as { nativeFee: bigint; lzTokenFee: bigint }
  }

  const sendToBattle = async (tokenId: number, dstChainId: number) => {
    if (!chainId || !address) {
      setErrorMessage('Please connect your wallet')
      setStatus('error')
      return
    }

    try {
      setStatus('quoting')
      setErrorMessage('')

      const onftAddress = getContractAddress(chainId, 'onft')
      if (!onftAddress) throw new Error('ONFT not deployed on this chain')

      const dstEid = LZ_ENDPOINT_IDS[dstChainId as keyof typeof LZ_ENDPOINT_IDS]
      if (!dstEid) throw new Error('Invalid destination chain')

      const composerAddress = getContractAddress(dstChainId, 'composer')
      if (!composerAddress) throw new Error('Composer not deployed on destination')

      // Encode compose message with tokenId
      const composeMsg = encodePacked(['uint256'], [BigInt(tokenId)])

      const sendParam = {
        dstEid,
        to: addressToBytes32(composerAddress),
        tokenId: BigInt(tokenId),
        extraOptions: '0x' as `0x${string}`,
        composeMsg,
        onftCmd: '0x' as `0x${string}`,
      }

      // Get quote
      const quote = await getQuote(tokenId, dstChainId)
      const nativeFee = (quote.nativeFee * 120n) / 100n // Add 20% buffer

      setStatus('sending')

      // Send the ONFT
      const hash = await writeContractAsync({
        address: onftAddress,
        abi: ONFT_ABI,
        functionName: 'send',
        args: [
          sendParam,
          { nativeFee, lzTokenFee: 0n },
          address,
        ],
        value: nativeFee,
      })

      setStatus('battling')

      // Wait for transaction
      const { data: receipt } = await useWaitForTransactionReceipt({ hash })

      setStatus('complete')
      return hash
    } catch (error: any) {
      console.error('Battle error:', error)
      setErrorMessage(error.message || 'Failed to send to battle')
      setStatus('error')
      throw error
    }
  }

  return {
    sendToBattle,
    status,
    errorMessage,
    resetStatus: () => setStatus('idle'),
  }
}

