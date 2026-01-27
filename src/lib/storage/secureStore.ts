import { SecureStorage } from "@plasmohq/storage/secure"
import { Storage } from "@plasmohq/storage"
import type { WalletData } from "../../types/wallet"

const STORAGE_KEYS = {
  WALLET_DATA: "wallet_data",
  WALLET_EXISTS: "wallet_exists",
  PASSWORD_HASH: "password_hash",
} as const

class WalletStorage {
  private secureStorage: SecureStorage
  private plainStorage: Storage
  private isUnlocked: boolean = false

  constructor() {
    this.secureStorage = new SecureStorage({ area: "local" })
    this.plainStorage = new Storage({ area: "local" })
  }

  async setPassword(password: string): Promise<void> {
    await this.secureStorage.setPassword(password)
    await this.secureStorage.set(STORAGE_KEYS.PASSWORD_HASH, "valid")
    this.isUnlocked = true
  }

  async unlock(password: string): Promise<boolean> {
    try {
      await this.secureStorage.setPassword(password)
      const hash = await this.secureStorage.get(STORAGE_KEYS.PASSWORD_HASH)
      if (hash === "valid") {
        this.isUnlocked = true
        return true
      }
      this.isUnlocked = false
      return false
    } catch {
      this.isUnlocked = false
      return false
    }
  }

  lock(): void {
    this.isUnlocked = false
  }

  getIsUnlocked(): boolean {
    return this.isUnlocked
  }

  async saveWallet(data: WalletData): Promise<void> {
    if (!this.isUnlocked) {
      throw new Error("Storage is locked")
    }
    await this.secureStorage.set(STORAGE_KEYS.WALLET_DATA, data)
    await this.plainStorage.set(STORAGE_KEYS.WALLET_EXISTS, true)
  }

  async getWallet(): Promise<WalletData | null> {
    if (!this.isUnlocked) {
      throw new Error("Storage is locked")
    }
    const data = await this.secureStorage.get<WalletData>(STORAGE_KEYS.WALLET_DATA)
    return data || null
  }

  async walletExists(): Promise<boolean> {
    const exists = await this.plainStorage.get<boolean>(STORAGE_KEYS.WALLET_EXISTS)
    return !!exists
  }

  async clearWallet(): Promise<void> {
    await this.secureStorage.remove(STORAGE_KEYS.WALLET_DATA)
    await this.secureStorage.remove(STORAGE_KEYS.PASSWORD_HASH)
    await this.plainStorage.remove(STORAGE_KEYS.WALLET_EXISTS)
    this.isUnlocked = false
  }
}

export const walletStorage = new WalletStorage()
