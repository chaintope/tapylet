// UI navigation types — specific to the extension's screen flow.

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
  | "settings"

export interface NavigationState {
  screen: AppScreen
  tempMnemonic: string | null
}
