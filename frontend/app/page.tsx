import Link from 'next/link'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Aetheria
            </h1>
            <Link 
              href="/dashboard"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium transition-all"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Cross-Chain Gaming,
            <br />
            Simplified
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Battle goblins, earn rewards, and manage resources seamlessly across multiple blockchains
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg transition-all"
            >
              Get Started
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-lg border border-gray-600 hover:border-gray-500 font-bold text-lg transition-all"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* What is Aetheria */}
        <div id="how-it-works" className="mb-20 scroll-mt-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4">What is Aetheria?</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A cross-chain gaming platform where your NFTs can travel between blockchains to battle enemies and earn rewards
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid gap-8 md:grid-cols-3 mb-20">
          <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-8">
            <div className="text-5xl mb-4">⚔️</div>
            <h3 className="text-2xl font-bold mb-3">1. Battle</h3>
            <p className="text-gray-300">
              Send your NFT cross-chain to battle goblins. Win or lose, you earn Energy tokens as rewards. Your NFT automatically returns to you.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-8">
            <div className="text-5xl mb-4">🌲</div>
            <h3 className="text-2xl font-bold mb-3">2. Gather Resources</h3>
            <p className="text-gray-300">
              Burn your Energy tokens to mint valuable resources like Wood and Ore. Use these for building and crafting in the game.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-8">
            <div className="text-5xl mb-4">🌉</div>
            <h3 className="text-2xl font-bold mb-3">3. Bridge Anywhere</h3>
            <p className="text-gray-300">
              Move your tokens and NFTs freely between Base, Arbitrum, and Optimism. True cross-chain ownership powered by LayerZero.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-8 mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center">Why Aetheria?</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="text-3xl">⚡</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Simple & Fast</h4>
                <p className="text-gray-400">No complex transactions. Click, confirm, and you're done. Cross-chain in seconds.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🔒</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Secure</h4>
                <p className="text-gray-400">Built on LayerZero V2, the most secure cross-chain messaging protocol.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Earn Rewards</h4>
                <p className="text-gray-400">Every battle earns you Energy tokens. Win or lose, you're always rewarded.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl">🌐</div>
              <div>
                <h4 className="font-bold text-lg mb-2">Multi-Chain</h4>
                <p className="text-gray-400">Play on Base, Arbitrum, or Optimism. Your choice, your adventure.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Chains */}
        <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-8 mb-20">
          <h3 className="text-3xl font-bold mb-8 text-center">Supported Chains</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-4xl font-bold text-blue-400 mb-2">Base</div>
              <div className="text-gray-400">Hub Chain</div>
              <p className="text-sm text-gray-500 mt-2">Main hub for rewards and statistics</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-4xl font-bold text-red-400 mb-2">Arbitrum</div>
              <div className="text-gray-400">Battle Arena</div>
              <p className="text-sm text-gray-500 mt-2">Fast battles with low gas fees</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-4xl font-bold text-red-500 mb-2">Optimism</div>
              <div className="text-gray-400">Battle Arena</div>
              <p className="text-sm text-gray-500 mt-2">Quick fights and instant rewards</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-16 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
          <h3 className="text-4xl font-bold mb-4">Ready to Start?</h3>
          <p className="text-xl text-gray-300 mb-8">Connect your wallet and begin your cross-chain adventure</p>
          <Link 
            href="/dashboard"
            className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg transition-all"
          >
            Launch App
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Aetheria
            </h3>
            <p className="text-gray-400 mb-4">Cross-chain gaming powered by LayerZero V2</p>
            <div className="flex gap-6 justify-center text-sm text-gray-500">
              <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
              <Link href="/battle" className="hover:text-gray-300">Battle</Link>
              <Link href="/resources" className="hover:text-gray-300">Resources</Link>
              <Link href="/bridge" className="hover:text-gray-300">Bridge</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
