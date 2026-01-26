import React, { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Button, Card, CardContent } from "../components/ui"
import { AddressDisplay, ReceiveModal, SendModal, PendingTransactions } from "../components/wallet"
import { walletStorage } from "../lib/storage/secureStore"
import { pendingTxStore, type PendingTransaction } from "../lib/storage/pendingTxStore"
import { getBalanceDetails, formatTpc, getTransactionInfo, type BalanceDetails } from "../lib/api"
import type { AppScreen } from "../types/wallet"

interface MainWalletScreenProps {
  address: string
  onNavigate: (screen: AppScreen) => void
}

export const MainWalletScreen: React.FC<MainWalletScreenProps> = ({
  address,
  onNavigate,
}) => {
  const { t } = useTranslation()
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [balance, setBalance] = useState<BalanceDetails | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([])

  const refreshData = useCallback(async () => {
    // Check and remove confirmed transactions
    const txs = await pendingTxStore.getAll()
    for (const tx of txs) {
      try {
        const info = await getTransactionInfo(tx.txid)
        if (info.status.confirmed) {
          await pendingTxStore.remove(tx.txid)
        }
      } catch {
        // Transaction not found or error, keep in pending
      }
    }

    // Fetch balance and pending txs together
    const [bal, updatedTxs] = await Promise.all([
      getBalanceDetails(address).catch((err) => {
        console.error("Failed to fetch balance:", err)
        return null
      }),
      pendingTxStore.getAll(),
    ])

    // Update state together
    if (bal) {
      setBalance(bal)
      setBalanceError(null)
    } else {
      setBalanceError(t("wallet.failedToLoad"))
    }
    setPendingTxs(updatedTxs)
    setIsLoadingBalance(false)
  }, [address, t])

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 10000)
    return () => clearInterval(interval)
  }, [refreshData])

  const handleLock = () => {
    walletStorage.lock()
    onNavigate("unlock")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4"
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
            <span className="font-medium">{t("wallet.title")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {t("wallet.testnet")}
            </span>
            <button
              onClick={handleLock}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Lock wallet">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">{t("wallet.totalBalance")}</p>
          {isLoadingBalance ? (
            <p className="text-3xl font-bold animate-pulse">...</p>
          ) : balanceError ? (
            <p className="text-lg font-bold">{balanceError}</p>
          ) : (
            <>
              <p className="text-3xl font-bold">
                {formatTpc(balance?.total ?? 0)} TPC
              </p>
              {balance && balance.unconfirmed !== 0 && (
                <div className="mt-2 text-xs text-white/70 flex justify-center gap-4">
                  <span>{t("wallet.confirmed")}: {formatTpc(balance.confirmed)}</span>
                  <span>{t("wallet.unconfirmed")}: {balance.unconfirmed >= 0 ? "+" : ""}{formatTpc(balance.unconfirmed)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 -mt-6">
        {/* Address Card */}
        <Card className="mb-4">
          <CardContent>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {t("wallet.yourAddress")}
            </p>
            <AddressDisplay address={address} showFull />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setShowSendModal(true)}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            {t("common.send")}
          </Button>
          <Button variant="outline" onClick={() => setShowReceiveModal(true)}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {t("common.receive")}
          </Button>
        </div>

        {/* Pending Transactions Banner */}
        {pendingTxs.length > 0 && (
          <button
            onClick={() => setShowPendingModal(true)}
            className="w-full mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between hover:bg-orange-100 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-orange-700">
                {t("pending.pendingCount", { count: pendingTxs.length })}
              </span>
            </div>
            <svg
              className="w-4 h-4 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <p className="text-xs text-slate-400 text-center">
          {t("wallet.connectedTo")}
        </p>
      </div>

      {/* Receive Modal */}
      <ReceiveModal
        address={address}
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
      />

      {/* Send Modal */}
      <SendModal
        address={address}
        balance={balance?.total ?? 0}
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSuccess={async (txid: string, amount: number, toAddress: string) => {
          await pendingTxStore.add({
            txid,
            amount,
            toAddress,
            timestamp: Date.now(),
          })
          // Wait for API to reflect the new transaction, then refresh
          await new Promise(resolve => setTimeout(resolve, 1000))
          await refreshData()
        }}
      />

      {/* Pending Transactions Modal */}
      <PendingTransactions
        transactions={pendingTxs}
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      />
    </div>
  )
}
