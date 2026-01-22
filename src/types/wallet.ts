export interface WalletData {
  encryptedMnemonic: string
  address: string
  publicKey: string
  createdAt: number
}

export interface WalletState {
  address: string | null
  isLocked: boolean
  walletExists: boolean
}

export type AppScreen =
  | "loading"
  | "welcome"
  | "create"
  | "mnemonic-display"
  | "mnemonic-confirm"
  | "password-setup"
  | "restore"
  | "unlock"
  | "main"

export interface NavigationState {
  screen: AppScreen
  tempMnemonic: string | null
}
