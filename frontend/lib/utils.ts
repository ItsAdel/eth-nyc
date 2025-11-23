import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert address to bytes32 for LayerZero
export function addressToBytes32(address: string): `0x${string}` {
  return `0x${address.slice(2).padStart(64, '0')}` as `0x${string}`
}

// Format token amount with decimals
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const fractional = amount % divisor
  
  if (fractional === 0n) {
    return whole.toString()
  }
  
  const fractionalStr = fractional.toString().padStart(decimals, '0')
  const trimmed = fractionalStr.replace(/0+$/, '')
  
  return `${whole}.${trimmed}`
}

// Parse token amount to bigint
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const [whole, fractional = ''] = amount.split('.')
  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + fractionalPadded)
}

// Truncate address
export function truncateAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

