import Link from 'next/link'
import { ConnectButton } from '@/components/ConnectButton'
import { ResourceVault } from '@/components/ResourceVault'

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex gap-6 items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent hover:opacity-80">
                Aetheria
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-300">
                Dashboard
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-green-400 hover:text-green-300">
            ← Back to Dashboard
          </Link>
        </div>

        <ResourceVault />

        {/* Additional Info */}
        <div className="mt-8 rounded-xl bg-gray-800/50 border border-gray-700 p-6">
          <h3 className="text-xl font-bold mb-3">Resource Types</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-bold text-green-400 mb-2">🌲 Wood</p>
              <p className="text-sm text-gray-300">
                Basic building material. Burn Energy tokens to obtain Wood resources for construction and crafting.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-400 mb-2">⛏️ Ore</p>
              <p className="text-sm text-gray-300">
                Valuable mineral resource. Burn Energy tokens to obtain Ore for advanced crafting and upgrades.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

