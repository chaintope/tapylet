import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui"
import { MnemonicGrid } from "../components/wallet"
import { mnemonicToWords } from "../lib/wallet"
import type { AppScreen } from "../types/wallet"

interface MnemonicDisplayScreenProps {
  mnemonic: string
  onNavigate: (screen: AppScreen) => void
}

export const MnemonicDisplayScreen: React.FC<MnemonicDisplayScreenProps> = ({
  mnemonic,
  onNavigate,
}) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const words = mnemonicToWords(mnemonic)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      // Auto-clear clipboard after 60 seconds for security
      setTimeout(() => {
        navigator.clipboard.writeText("").catch(() => {})
      }, 60000)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          {t("mnemonic.title")}
        </h1>
        <p className="text-sm text-slate-500">
          {t("mnemonic.subtitle")}
        </p>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-amber-800">
            {t("mnemonic.warning")}
          </p>
        </div>
      </div>

      {/* Mnemonic Grid */}
      <div className="flex-1">
        <MnemonicGrid words={words} mode="display" />

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700">
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t("common.copied")}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t("common.copy")}
            </>
          )}
        </button>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-start gap-3 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
        />
        <span className="text-sm text-slate-600">
          {t("mnemonic.continue")}
        </span>
      </label>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          fullWidth
          disabled={!confirmed}
          onClick={() => onNavigate("mnemonic-confirm")}>
          {t("common.continue")}
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
