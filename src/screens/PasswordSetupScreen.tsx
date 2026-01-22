import React, { useState } from "react"
import { Button, Input } from "../components/ui"
import { createHDWallet, generateAddress } from "../lib/wallet"
import { walletStorage } from "../lib/storage/secureStore"
import type { AppScreen, WalletData } from "../types/wallet"

interface PasswordSetupScreenProps {
  mnemonic: string
  onNavigate: (screen: AppScreen) => void
  onWalletCreated: (address: string) => void
}

export const PasswordSetupScreen: React.FC<PasswordSetupScreenProps> = ({
  mnemonic,
  onNavigate,
  onWalletCreated,
}) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const getPasswordStrength = (
    pwd: string
  ): { score: number; label: string; color: string } => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    const levels = [
      { label: "Very Weak", color: "bg-red-500" },
      { label: "Weak", color: "bg-orange-500" },
      { label: "Fair", color: "bg-yellow-500" },
      { label: "Strong", color: "bg-lime-500" },
      { label: "Very Strong", color: "bg-green-500" },
    ]

    return { score, ...levels[Math.min(score, 4)] }
  }

  const strength = getPasswordStrength(password)

  const handleCreateWallet = async () => {
    setError(null)

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsCreating(true)

    try {
      // Create HD wallet
      const keys = await createHDWallet(mnemonic)
      const address = generateAddress(keys.publicKey)

      // Set password and save wallet
      await walletStorage.setPassword(password)

      const walletData: WalletData = {
        encryptedMnemonic: mnemonic, // SecureStorage will encrypt this
        address,
        publicKey: Buffer.from(keys.publicKey).toString("hex"),
        createdAt: Date.now(),
      }

      await walletStorage.saveWallet(walletData)

      // Clear sensitive data from memory
      keys.privateKey.fill(0)

      onWalletCreated(address)
      onNavigate("main")
    } catch (err) {
      console.error("Failed to create wallet:", err)
      setError("Failed to create wallet. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Create Password
        </h1>
        <p className="text-sm text-slate-500">
          This password will be used to unlock your wallet. Make sure to
          remember it.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-4">
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          showPasswordToggle
        />

        {/* Password Strength */}
        {password.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < strength.score ? strength.color : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">{strength.label}</p>
          </div>
        )}

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          showPasswordToggle
        />

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Requirements */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-700 mb-2">
            Password requirements:
          </p>
          <ul className="text-sm text-slate-500 space-y-1">
            <li className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  password.length >= 8
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-200 text-slate-400"
                }`}>
                {password.length >= 8 ? "✓" : "·"}
              </span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  /[A-Z]/.test(password)
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-200 text-slate-400"
                }`}>
                {/[A-Z]/.test(password) ? "✓" : "·"}
              </span>
              Uppercase letter (recommended)
            </li>
            <li className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  /[0-9]/.test(password)
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-200 text-slate-400"
                }`}>
                {/[0-9]/.test(password) ? "✓" : "·"}
              </span>
              Number (recommended)
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-6">
        <Button
          fullWidth
          loading={isCreating}
          disabled={password.length < 8 || password !== confirmPassword}
          onClick={handleCreateWallet}>
          Create Wallet
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled={isCreating}
          onClick={() => onNavigate("mnemonic-confirm")}>
          Back
        </Button>
      </div>
    </div>
  )
}
