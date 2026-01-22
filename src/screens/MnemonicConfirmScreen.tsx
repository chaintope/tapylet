import React, { useMemo, useState } from "react"
import { Button } from "../components/ui"
import { MnemonicGrid } from "../components/wallet"
import { mnemonicToWords } from "../lib/wallet"
import type { AppScreen } from "../types/wallet"

interface MnemonicConfirmScreenProps {
  mnemonic: string
  onNavigate: (screen: AppScreen) => void
}

export const MnemonicConfirmScreen: React.FC<MnemonicConfirmScreenProps> = ({
  mnemonic,
  onNavigate,
}) => {
  const words = mnemonicToWords(mnemonic)
  const [inputValues, setInputValues] = useState<string[]>(
    Array(words.length).fill("")
  )
  const [error, setError] = useState<string | null>(null)

  // Randomly select 3 words to verify
  const hiddenIndices = useMemo(() => {
    const indices: number[] = []
    const available = [...Array(words.length).keys()]
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      indices.push(available.splice(randomIndex, 1)[0])
    }
    return indices.sort((a, b) => a - b)
  }, [words.length])

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...inputValues]
    newValues[index] = value.trim()
    setInputValues(newValues)
    setError(null)
  }

  const handleVerify = () => {
    // Check if all hidden words are correct
    const allCorrect = hiddenIndices.every(
      (index) => inputValues[index].toLowerCase() === words[index].toLowerCase()
    )

    if (allCorrect) {
      onNavigate("password-setup")
    } else {
      setError("Some words are incorrect. Please check and try again.")
    }
  }

  const isComplete = hiddenIndices.every(
    (index) => inputValues[index].length > 0
  )

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Confirm Recovery Phrase
        </h1>
        <p className="text-sm text-slate-500">
          Enter the missing words to confirm you have saved your recovery phrase.
        </p>
      </div>

      {/* Mnemonic Grid */}
      <div className="flex-1">
        <MnemonicGrid
          words={words}
          mode="input"
          inputValues={inputValues}
          onInputChange={handleInputChange}
          hiddenIndices={hiddenIndices}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-6">
        <Button fullWidth disabled={!isComplete} onClick={handleVerify}>
          Verify
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onNavigate("mnemonic-display")}>
          Back
        </Button>
      </div>
    </div>
  )
}
