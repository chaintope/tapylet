import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "../ui"
import { formatColorId, getExplorerColorUrl } from "../../lib/api"
import type { AssetBalance, Metadata } from "../../lib/api"

interface AssetDetailModalProps {
  colorId: string
  balance: AssetBalance
  metadata: Metadata | null
  isOpen: boolean
  onClose: () => void
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  colorId,
  balance,
  metadata,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const displayName = metadata?.name ?? formatColorId(colorId)

  const handleCopyColorId = async () => {
    await navigator.clipboard.writeText(colorId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 min-w-0">
            {metadata?.icon && (
              <img
                src={metadata.icon}
                alt={metadata.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            )}
            <h2 className="text-lg font-semibold text-slate-800 truncate">
              {displayName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Metadata Section */}
        {metadata && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("assetDetail.name")}</span>
              <span className="text-slate-800 font-medium">{metadata.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("assetDetail.symbol")}</span>
              <span className="text-slate-800 font-medium">{metadata.symbol}</span>
            </div>
            {metadata.description && (
              <div className="text-sm">
                <span className="text-slate-500">{t("assetDetail.description")}</span>
                <p className="text-slate-800 mt-1">{metadata.description}</p>
              </div>
            )}
            {metadata.decimals !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("assetDetail.decimals")}</span>
                <span className="text-slate-800 font-medium">{metadata.decimals}</span>
              </div>
            )}
            {metadata.version && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("assetDetail.version")}</span>
                <span className="text-slate-800 font-medium">{metadata.version}</span>
              </div>
            )}
            {metadata.website && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("assetDetail.website")}</span>
                <a
                  href={metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline truncate ml-2"
                >
                  {metadata.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <div className="border-t border-slate-200 my-2" />
          </div>
        )}

        {/* Balance Section */}
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">{t("assetDetail.balance")}</p>
          <div className="p-3 bg-slate-50 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("assetDetail.total")}</span>
              <span className="text-slate-800 font-semibold">{balance.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t("wallet.confirmed")}</span>
              <span className="text-slate-800">{balance.confirmed.toLocaleString()}</span>
            </div>
            {balance.unconfirmed !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t("wallet.unconfirmed")}</span>
                <span className="text-slate-800">
                  {balance.unconfirmed >= 0 ? "+" : ""}{balance.unconfirmed.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Color ID Section */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Color ID</p>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-mono text-slate-600 break-all">{colorId}</p>
            <button
              onClick={handleCopyColorId}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? t("common.copied") : t("common.copy")}
            </button>
          </div>
        </div>

        {/* Explorer Link */}
        <a
          href={getExplorerColorUrl(colorId)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {t("assetDetail.viewInExplorer")}
        </a>

        {/* Close Button */}
        <Button variant="outline" fullWidth onClick={onClose}>
          {t("common.close")}
        </Button>
      </div>
    </div>
  )
}
