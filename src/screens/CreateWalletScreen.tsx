import React, { useEffect, useState } from "react"
import { Button, Loading } from "../components/ui"
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
        <Loading size="lg" text="Generating secure wallet..." />
      </div>
    )
  }

  return null
}
