import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui"
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
  const { t } = useTranslation()
  const [mnemonic, setMnemonic] = useState("")
  const [error, setError] = useState<string | null>(null)

  const wordCount = mnemonic.trim() ? mnemonic.trim().split(/\s+/).length : 0
  const isValidLength = wordCount === 12 || wordCount === 24

  const handleRestore = () => {
    setError(null)

    const normalized = normalizeMnemonic(mnemonic)

    if (!isValidLength) {
      setError(t("restoreWallet.errors.invalidMnemonic"))
      return
    }

    if (!validateMnemonic(normalized)) {
      setError(t("restoreWallet.errors.invalidMnemonic"))
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
          {t("restoreWallet.title")}
        </h1>
        <p className="text-sm text-slate-500">
          {t("restoreWallet.subtitle")}
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
            placeholder={t("restoreWallet.placeholder")}
            className="w-full h-40 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm font-mono"
          />
          <span
            className={`absolute bottom-3 right-3 text-xs ${
              isValidLength ? "text-green-600" : "text-slate-400"
            }`}>
            {wordCount} / 12
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-6">
        <Button
          fullWidth
          disabled={!isValidLength}
          onClick={handleRestore}>
          {t("restoreWallet.restore")}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onNavigate("welcome")}>
          {t("common.back")}
        </Button>
      </div>
    </div>
  )
}
