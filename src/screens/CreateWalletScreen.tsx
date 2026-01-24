import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Loading } from "../components/ui"
import { generateMnemonic } from "../lib/wallet"
import type { AppScreen } from "../types/wallet"

interface CreateWalletScreenProps {
  onNavigate: (screen: AppScreen) => void
  onMnemonicGenerated: (mnemonic: string) => void
}

export const CreateWalletScreen: React.FC<CreateWalletScreenProps> = ({
  onNavigate,
  onMnemonicGenerated,
}) => {
  const { t } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    // Generate mnemonic on mount
    const mnemonic = generateMnemonic(128) // 12 words
    onMnemonicGenerated(mnemonic)
    setIsGenerating(false)
    onNavigate("mnemonic-display")
  }, [])

  if (isGenerating) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loading size="lg" text={t("createWallet.generating")} />
      </div>
    )
  }

  return null
}
