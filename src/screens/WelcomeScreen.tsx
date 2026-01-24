import React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../components/ui"
import type { AppScreen } from "../types/wallet"

interface WelcomeScreenProps {
  onNavigate: (screen: AppScreen) => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-full p-6">
      {/* Logo and Title */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t("wallet.title")}</h1>
        <p className="text-slate-500 text-center mb-2">
          {t("welcome.subtitle")}
        </p>
        <p className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
          {t("wallet.testnet")}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          fullWidth
          onClick={() => onNavigate("create")}>
          {t("welcome.createWallet")}
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={() => onNavigate("restore")}>
          {t("welcome.restoreWallet")}
        </Button>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-400 text-center mt-6">
        Your keys, your coins
      </p>
    </div>
  )
}
