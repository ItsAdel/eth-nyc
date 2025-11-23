import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { BattleCard } from '@/components/BattleCard'

export default function BattlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80">
              Aetheria
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-400 hover:text-purple-300">
            ← Back to Home
          </Link>
        </div>

        <BattleCard />

        {/* Additional Info */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-3">Battle Rewards</h3>
            <ul className="space-y-2 text-gray-300">
              <li>✅ Win: 5 Energy Tokens</li>
              <li>💪 Lose: 2 Energy Tokens</li>
              <li>🎲 50% win chance</li>
            </ul>
          </div>

          <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-3">Battle Arenas</h3>
            <ul className="space-y-2 text-gray-300">
              <li>⚡ Arbitrum Sepolia</li>
              <li>🔴 Optimism Sepolia</li>
              <li>🔄 Cross-chain battles</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

