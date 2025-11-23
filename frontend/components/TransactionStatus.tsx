'use client'

interface TransactionStatusProps {
  status: 'idle' | 'pending' | 'success' | 'error'
  message?: string
  txHash?: string
}

export function TransactionStatus({ status, message, txHash }: TransactionStatusProps) {
  if (status === 'idle') return null

  return (
    <div
      className={`p-4 rounded-lg border ${
        status === 'pending'
          ? 'bg-blue-500/20 border-blue-500/30'
          : status === 'success'
          ? 'bg-green-500/20 border-green-500/30'
          : 'bg-red-500/20 border-red-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {status === 'pending' && (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
        )}
        {status === 'success' && <span className="text-2xl">✅</span>}
        {status === 'error' && <span className="text-2xl">❌</span>}
        
        <div className="flex-1">
          <p className={`font-medium ${
            status === 'success' ? 'text-green-400' :
            status === 'error' ? 'text-red-400' :
            'text-blue-400'
          }`}>
            {message || (status === 'pending' ? 'Processing...' : status === 'success' ? 'Success!' : 'Error')}
          </p>
          
          {txHash && (
            <a
              href={`https://layerzeroscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              View on LayerZero Scan
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

