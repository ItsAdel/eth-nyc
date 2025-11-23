"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTokenBridge } from "@/hooks/useTokenBridge";
import { arbitrumSepolia, optimismSepolia, baseSepolia } from "@/config/chains";

type TokenType = "energy" | "wood" | "ore" | "onft";

const TOKEN_OPTIONS = [
  { value: "energy" as TokenType, label: "⚡ Energy", emoji: "⚡" },
  { value: "wood" as TokenType, label: "🌲 Wood", emoji: "🌲" },
  { value: "ore" as TokenType, label: "⛏️ Ore", emoji: "⛏️" },
  { value: "onft" as TokenType, label: "🎮 Player NFT", emoji: "🎮" },
];

const CHAIN_OPTIONS = [
  { value: baseSepolia.id, label: "Base Sepolia", color: "blue" },
  { value: arbitrumSepolia.id, label: "Arbitrum Sepolia", color: "red" },
  { value: optimismSepolia.id, label: "Optimism Sepolia", color: "red" },
];

export function TokenBridge() {
  const { address, chainId } = useAccount();
  const [tokenType, setTokenType] = useState<TokenType>("energy");
  const [amount, setAmount] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [dstChain, setDstChain] = useState<number>(baseSepolia.id);
  const { bridgeToken, status, errorMessage, resetStatus } = useTokenBridge();

  const isONFT = tokenType === "onft";

  const availableChains = CHAIN_OPTIONS.filter(
    (chain) => chain.value !== chainId
  );

  const handleBridge = async () => {
    if (isONFT && !tokenId) return;
    if (!isONFT && !amount) return;

    try {
      await bridgeToken(
        tokenType,
        amount,
        dstChain,
        isONFT ? parseInt(tokenId) : undefined
      );
      setAmount("");
      setTokenId("");
    } catch (error) {
      console.error("Bridge failed:", error);
    }
  };

  if (!address) {
    return (
      <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-8 text-center">
        <p className="text-gray-300">
          Please connect your wallet to use the bridge
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-8">
      <h2 className="text-3xl font-bold mb-6">🌉 Cross-Chain Bridge</h2>

      {/* Current Chain */}
      <div className="mb-6 p-4 rounded-lg bg-gray-800/50">
        <p className="text-sm text-gray-400">Current Chain</p>
        <p className="text-xl font-bold">
          {CHAIN_OPTIONS.find((c) => c.value === chainId)?.label ||
            "Unknown Chain"}
        </p>
      </div>

      {/* Token Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Token</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOKEN_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTokenType(option.value)}
              className={`px-4 py-3 rounded-lg font-bold transition-all ${
                tokenType === option.value
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
              }`}
              disabled={status !== "idle"}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount or Token ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {isONFT ? "Token ID" : "Amount"}
        </label>
        <input
          type="number"
          value={isONFT ? tokenId : amount}
          onChange={(e) =>
            isONFT ? setTokenId(e.target.value) : setAmount(e.target.value)
          }
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={isONFT ? "Enter token ID" : "0.0"}
          disabled={status !== "idle"}
          step={isONFT ? "1" : "0.1"}
          min="0"
        />
      </div>

      {/* Destination Chain Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Destination Chain
        </label>
        <select
          value={dstChain}
          onChange={(e) => setDstChain(parseInt(e.target.value))}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status !== "idle"}
        >
          {availableChains.map((chain) => (
            <option key={chain.value} value={chain.value}>
              {chain.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Messages */}
      {status !== "idle" && status !== "error" && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
            <p className="font-medium">
              {status === "quoting" && "Calculating fees..."}
              {status === "approving" && "Approving token..."}
              {status === "sending" && "Sending cross-chain..."}
              {status === "complete" && "✅ Transfer complete!"}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30">
          <p className="text-red-400">{errorMessage}</p>
          <button
            onClick={resetStatus}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleBridge}
        disabled={
          (isONFT && !tokenId) ||
          (!isONFT && (!amount || parseFloat(amount) <= 0)) ||
          status !== "idle"
        }
        className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold text-lg transition-all"
      >
        {status === "idle" ? "Bridge Tokens" : "Processing..."}
      </button>

      {/* Info */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800/30 text-sm text-gray-400">
        <p className="mb-2">
          <strong>Bridge Information:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Transfers are secured by LayerZero V2</li>
          <li>Tokens arrive in your wallet automatically</li>
          <li>Gas fees paid on source chain</li>
          <li>Typical transfer time: 1-5 minutes</li>
        </ul>
      </div>
    </div>
  );
}
