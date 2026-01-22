import React, { useState } from "react"
import { shortenAddress } from "../../lib/wallet"

interface AddressDisplayProps {
  address: string
  showFull?: boolean
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, showFull = false }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => navigator.clipboard.writeText("").catch(() => {}), 30000)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 px-4 py-3 bg-slate-100 rounded-lg font-mono text-sm text-slate-700 break-all">
        {showFull ? address : shortenAddress(address, 8)}
      </div>
      <button
        onClick={handleCopy}
        className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
        title="Copy address">
        {copied ? (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
