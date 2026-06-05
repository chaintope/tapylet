// Chrome Extension implementation of the storage interfaces,
// backed by @plasmohq/storage. This file is Extension-specific and would
// NOT move into a shared core package — each platform provides its own
// adapter (Mobile: expo-secure-store, Web: IndexedDB + WebCrypto, etc.).

import { Storage } from "@plasmohq/storage"
import { SecureStorage } from "@plasmohq/storage/secure"
import type { KeyValueStore, SecureKeyValueStore } from "../types"

type StorageArea = "local" | "sync" | "managed" | "session"

export class PlasmoKeyValueStore implements KeyValueStore {
  private storage: Storage

  constructor(area: StorageArea = "local") {
    this.storage = new Storage({ area })
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.storage.get<T>(key)
    return value ?? null
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.storage.set(key, value)
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key)
  }

  watch(key: string, callback: (newValue: unknown) => void): () => void {
    const watcher = {
      [key]: ({ newValue }: { newValue: unknown }) => callback(newValue),
    }
    this.storage.watch(watcher)
    return () => this.storage.unwatch(watcher)
  }
}

export class PlasmoSecureStore implements SecureKeyValueStore {
  private storage: SecureStorage

  constructor(area: StorageArea = "local") {
    this.storage = new SecureStorage({ area })
  }

  async setPassword(password: string): Promise<void> {
    await this.storage.setPassword(password)
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.storage.get<T>(key)
    return value ?? null
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.storage.set(key, value)
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key)
  }
}
