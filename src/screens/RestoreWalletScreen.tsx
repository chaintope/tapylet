import React, { useState } from "react"
import { Button, Input } from "../components/ui"
import { validateMnemonic, normalizeMnemonic } from "../lib/wallet"
import type { AppScreen } from "../types/wallet"

interface RestoreWalletScreenProps {
  onNavigate: (screen: AppScreen) => void
  onMnemonicEntered: (mnemonic: string) => void
}

export const RestoreWalletScreen: React.FC<RestoreWalletScreenProps> = ({
  onNavigate,
  onMnemonicEntered,
}) => {
  const [mnemonic, setMnemonic] = useState("")
  const [error, setError] = useState<string | null>(null)

  const wordCount = mnemonic.trim() ? mnemonic.trim().split(/\s+/).length : 0
  const isValidLength = wordCount === 12 || wordCount === 24

  const handleRestore = () => {
    setError(null)

    const normalized = normalizeMnemonic(mnemonic)

    if (!isValidLength) {
      setError("Please enter 12 or 24 words")
      return
    }

    if (!validateMnemonic(normalized)) {
      setError("Invalid recovery phrase. Please check and try again.")
      return
    }

    onMnemonicEntered(normalized)
    onNavigate("password-setup")
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Restore Wallet
        </h1>
        <p className="text-sm text-slate-500">
          Enter your 12 or 24 word recovery phrase to restore your wallet.
        </p>
      </div>

      {/* Input */}
      <div className="flex-1">
        <div className="relative">
          <textarea
            value={mnemonic}
            onChange={(e) => {
              setMnemonic(e.target.value)
              setError(null)
            }}
            placeholder="Enter your recovery phrase..."
            className="w-full h-40 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm font-mono"
          />
          <span
            className={`absolute bottom-3 right-3 text-xs ${
              isValidLength ? "text-green-600" : "text-slate-400"
            }`}>
            {wordCount} / 12 or 24 words
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-700 mb-2">Tips:</p>
          <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
            <li>Separate words with spaces</li>
            <li>Words are case-insensitive</li>
            <li>Make sure there are no extra spaces</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-6">
        <Button
          fullWidth
          disabled={!isValidLength}
          onClick={handleRestore}>
          Continue
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onNavigate("welcome")}>
          Back
        </Button>
      </div>
    </div>
  )
}
