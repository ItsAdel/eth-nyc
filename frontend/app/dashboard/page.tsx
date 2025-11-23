import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { PlayerStats } from "@/components/PlayerStats";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80"
            >
              Aetheria
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Dashboard</h2>
          <p className="text-xl text-gray-300">
            Manage your cross-chain gaming activities
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Link
            href="/battle"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-8 hover:border-purple-400 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">⚔️ Battle</h3>
              <p className="text-gray-300">
                Send your NFT to battle goblins across chains and earn Energy
                tokens
              </p>
            </div>
          </Link>

          <Link
            href="/resources"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 p-8 hover:border-green-400 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-emerald-600/0 group-hover:from-green-600/10 group-hover:to-emerald-600/10 transition-all" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">🌲 Resources</h3>
              <p className="text-gray-300">
                Burn Energy tokens to get Wood and Ore resources
              </p>
            </div>
          </Link>

          <Link
            href="/bridge"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-8 hover:border-blue-400 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/10 transition-all" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">🌉 Bridge</h3>
              <p className="text-gray-300">
                Transfer tokens and NFTs across supported chains
              </p>
            </div>
          </Link>
        </div>

        {/* Player Stats */}
        <PlayerStats />

        {/* Stats Section */}
        <div className="mt-12 rounded-2xl bg-gray-800/50 border border-gray-700 p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            Supported Chains
          </h3>
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">Base</div>
              <div className="text-sm text-gray-400">Hub Chain</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">Arbitrum</div>
              <div className="text-sm text-gray-400">Battle Arena</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">Optimism</div>
              <div className="text-sm text-gray-400">Battle Arena</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>Powered by LayerZero V2</p>
        </div>
      </footer>
    </div>
  );
}
