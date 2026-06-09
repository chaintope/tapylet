// Extension-specific storage singletons: inject the Plasmo adapters into the
// platform-agnostic store classes from @chaintope/tapylet-core/storage. App code imports the
// singletons (and the re-exported core types/constants) from this one place.

import { WalletStorage } from "@chaintope/tapylet-core/storage/walletStorage"
import { IssuedTokenStore } from "@chaintope/tapylet-core/storage/issuedTokenStore"
import { PendingTxStore } from "@chaintope/tapylet-core/storage/pendingTxStore"
import { SettingsStore } from "@chaintope/tapylet-core/storage/settingsStore"
import { PlasmoKeyValueStore, PlasmoSecureStore } from "./adapters/plasmo"

export const walletStorage = new WalletStorage(
  new PlasmoSecureStore(),
  new PlasmoKeyValueStore(),
)
export const issuedTokenStore = new IssuedTokenStore(new PlasmoKeyValueStore())
export const pendingTxStore = new PendingTxStore(new PlasmoKeyValueStore())
export const settingsStore = new SettingsStore(new PlasmoKeyValueStore())

// Re-export core types and constants so callers can import everything from here.
export type { IssuedToken } from "@chaintope/tapylet-core/storage/issuedTokenStore"
export type { PendingTransaction } from "@chaintope/tapylet-core/storage/pendingTxStore"
export {
  DEFAULT_AUTO_LOCK_MINUTES,
  AUTO_LOCK_OPTIONS,
} from "@chaintope/tapylet-core/storage/settingsStore"
