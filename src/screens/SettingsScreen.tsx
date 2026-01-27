import React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "../components/ui"
import type { AppScreen } from "../types/wallet"

interface SettingsScreenProps {
  onNavigate: (screen: AppScreen) => void
}

const APP_VERSION = "0.0.1"

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("main")}
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{t("settings.title")}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Version Info */}
        <Card>
          <CardContent>
            <h2 className="text-sm font-medium text-slate-700 mb-3">
              {t("settings.about")}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("settings.version")}</span>
                <span className="text-sm font-mono text-slate-800">{APP_VERSION}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{t("settings.network")}</span>
                <span className="text-sm text-slate-800">{t("wallet.testnet")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
