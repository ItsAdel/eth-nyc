import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { TokenBridge } from '@/components/TokenBridge'

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80">
              Aetheria
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>

        <TokenBridge />

        {/* Supported Tokens */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-3">Supported Tokens</h3>
            <ul className="space-y-2 text-gray-300">
              <li>⚡ Energy - Battle rewards token</li>
              <li>🌲 Wood - Building resource</li>
              <li>⛏️ Ore - Crafting resource</li>
              <li>🎮 Player NFT - Your game character</li>
            </ul>
          </div>

          <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-3">Supported Chains</h3>
            <ul className="space-y-2 text-gray-300">
              <li>🔵 Base Sepolia (Hub)</li>
              <li>⚡ Arbitrum Sepolia</li>
              <li>🔴 Optimism Sepolia</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

