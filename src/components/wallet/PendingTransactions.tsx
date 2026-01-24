import React from "react"
import type { PendingTransaction } from "../../lib/storage/pendingTxStore"
import { formatTpc } from "../../lib/api"

interface PendingTransactionsProps {
  transactions: PendingTransaction[]
  isOpen: boolean
  onClose: () => void
}

export const PendingTransactions: React.FC<PendingTransactionsProps> = ({
  transactions,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Pending Transactions</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No pending transactions</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.txid}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-600">
                      Pending
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      -{formatTpc(tx.amount)} TPC
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>To: {formatAddress(tx.toAddress)}</p>
                    <p>TX: {formatAddress(tx.txid)}</p>
                    <p>{formatTime(tx.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
