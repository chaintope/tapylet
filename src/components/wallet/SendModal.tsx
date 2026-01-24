import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Input } from "../ui"
import { validateAddress } from "../../lib/wallet"
import { createAndSignTransaction } from "../../lib/wallet/transaction"
import { parseTpc, formatTpc } from "../../lib/api"
import { walletStorage } from "../../lib/storage/secureStore"

interface SendModalProps {
  address: string
  balance: number
  isOpen: boolean
  onClose: () => void
  onSuccess: (txid: string, amount: number, toAddress: string) => void
}

type SendStep = "input" | "confirm" | "sending" | "success" | "error"

export const SendModal: React.FC<SendModalProps> = ({
  address,
  balance,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<SendStep>("input")
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [txid, setTxid] = useState<string | null>(null)

  const resetState = () => {
    setStep("input")
    setToAddress("")
    setAmount("")
    setError(null)
    setTxid(null)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleConfirm = () => {
    setError(null)

    // Validate address
    if (!toAddress.trim()) {
      setError(t("send.errors.enterAddress"))
      return
    }

    if (!validateAddress(toAddress.trim())) {
      setError(t("send.errors.invalidAddress"))
      return
    }

    // Validate amount
    if (!amount.trim()) {
      setError(t("send.errors.enterAmount"))
      return
    }

    let amountTapyrus: number
    try {
      amountTapyrus = parseTpc(amount)
    } catch {
      setError(t("send.errors.invalidAmount"))
      return
    }

    if (amountTapyrus <= 0) {
      setError(t("send.errors.amountGreaterThanZero"))
      return
    }

    if (amountTapyrus > balance) {
      setError(t("send.errors.insufficientBalance"))
      return
    }

    setStep("confirm")
  }

  const handleSend = async () => {
    setStep("sending")
    setError(null)

    try {
      const walletData = await walletStorage.getWallet()
      if (!walletData) {
        throw new Error("Wallet not found")
      }

      const amountTapyrus = parseTpc(amount)
      const result = await createAndSignTransaction({
        fromAddress: address,
        toAddress: toAddress.trim(),
        amount: amountTapyrus,
        mnemonic: walletData.encryptedMnemonic,
      })

      setTxid(result.txid)
      setStep("success")
      onSuccess(result.txid, amountTapyrus, toAddress.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed")
      setStep("error")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {step === "success" ? t("send.sentTitle") : t("send.title")}
          </h2>
          <button
            onClick={handleClose}
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

        {/* Input Step */}
        {step === "input" && (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("send.recipientAddress")}
                </label>
                <Input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder={t("send.enterAddress")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("send.amount")}
                </label>
                <Input
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00000000"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t("send.available", { amount: formatTpc(balance) })}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button fullWidth onClick={handleConfirm}>
                {t("common.continue")}
              </Button>
            </div>
          </>
        )}

        {/* Confirm Step */}
        {step === "confirm" && (
          <>
            <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
              <div>
                <p className="text-xs text-slate-500">{t("send.to")}</p>
                <p className="text-sm font-mono break-all">{toAddress}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("send.amount")}</p>
                <p className="text-lg font-semibold">{amount} TPC</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 text-center">
              {t("send.confirmTransaction")}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep("input")}>
                {t("common.back")}
              </Button>
              <Button fullWidth onClick={handleSend}>
                {t("common.send")}
              </Button>
            </div>
          </>
        )}

        {/* Sending Step */}
        {step === "sending" && (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-600">{t("send.sending")}</p>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-slate-800 mb-2">
                {t("send.transactionSent")}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {t("send.sentSuccessfully", { amount })}
              </p>
              {txid && (
                <p className="text-xs font-mono text-slate-400 break-all px-4">
                  TX: {txid}
                </p>
              )}
            </div>

            <Button fullWidth onClick={handleClose} className="mt-6">
              {t("common.done")}
            </Button>
          </>
        )}

        {/* Error Step */}
        {step === "error" && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
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
              </div>
              <p className="text-lg font-semibold text-slate-800 mb-2">
                {t("send.transactionFailed")}
              </p>
              <p className="text-sm text-red-500">{error}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button fullWidth onClick={() => setStep("input")}>
                {t("common.tryAgain")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
