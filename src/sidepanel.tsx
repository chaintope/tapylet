import { useCallback, useEffect, useState } from "react"
import { Loading } from "./components/ui"
import { walletStorage } from "./lib/storage/secureStore"
import { settingsStore, DEFAULT_AUTO_LOCK_MINUTES } from "./lib/storage/settingsStore"
import { useAutoLock } from "./lib/hooks/useAutoLock"
import { WelcomeScreen, CreateWalletScreen, MnemonicDisplayScreen, MnemonicConfirmScreen, PasswordSetupScreen, RestoreWalletScreen, UnlockScreen, MainWalletScreen, SettingsScreen } from "./screens"
import type { AppScreen } from "./types/wallet"
import "./lib/i18n"
import "./styles/globals.css"

const UNLOCKED_SCREENS: AppScreen[] = ["main", "settings"]

function SidePanel() {
  const [screen, setScreen] = useState<AppScreen>("loading")
  const [tempMnemonic, setTempMnemonic] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(DEFAULT_AUTO_LOCK_MINUTES)

  useEffect(() => {
    const init = async () => {
      try {
        const exists = await walletStorage.walletExists()
        setScreen(exists ? "unlock" : "welcome")
      } catch (err) {
        console.error("Failed to initialize:", err)
        setScreen("welcome")
      }
    }
    init()
  }, [])

  useEffect(() => {
    settingsStore.getAutoLockMinutes().then(setAutoLockMinutes)
    const unwatch = settingsStore.watchAutoLockMinutes(setAutoLockMinutes)
    return unwatch
  }, [])

  const handleAutoLock = useCallback(() => {
    walletStorage.lock()
    setScreen("unlock")
  }, [])

  const isUnlockedScreen = UNLOCKED_SCREENS.includes(screen)
  useAutoLock(isUnlockedScreen ? autoLockMinutes * 60 * 1000 : 0, handleAutoLock)

  const handleNavigate = (newScreen: AppScreen) => setScreen(newScreen)
  const handleMnemonicGenerated = (mnemonic: string) => setTempMnemonic(mnemonic)
  const handleMnemonicEntered = (mnemonic: string) => setTempMnemonic(mnemonic)
  const handleWalletCreated = (walletAddress: string) => { setAddress(walletAddress); setTempMnemonic(null) }
  const handleUnlock = (walletAddress: string) => setAddress(walletAddress)

  const renderScreen = () => {
    switch (screen) {
      case "loading": return <div className="flex h-full items-center justify-center"><Loading size="lg" text="Loading..." /></div>
      case "welcome": return <WelcomeScreen onNavigate={handleNavigate} />
      case "create": return <CreateWalletScreen onNavigate={handleNavigate} onMnemonicGenerated={handleMnemonicGenerated} />
      case "mnemonic-display": return tempMnemonic ? <MnemonicDisplayScreen mnemonic={tempMnemonic} onNavigate={handleNavigate} /> : null
      case "mnemonic-confirm": return tempMnemonic ? <MnemonicConfirmScreen mnemonic={tempMnemonic} onNavigate={handleNavigate} /> : null
      case "password-setup": return tempMnemonic ? <PasswordSetupScreen mnemonic={tempMnemonic} onNavigate={handleNavigate} onWalletCreated={handleWalletCreated} /> : null
      case "restore": return <RestoreWalletScreen onNavigate={handleNavigate} onMnemonicEntered={handleMnemonicEntered} />
      case "unlock": return <UnlockScreen onNavigate={handleNavigate} onUnlock={handleUnlock} />
      case "main": return address ? <MainWalletScreen address={address} onNavigate={handleNavigate} /> : null
      case "settings": return <SettingsScreen onNavigate={handleNavigate} />
      default: return <WelcomeScreen onNavigate={handleNavigate} />
    }
  }

  return <div className="h-full min-h-screen">{renderScreen()}</div>
}

export default SidePanel
