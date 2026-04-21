import { Storage } from "@plasmohq/storage"

const AUTO_LOCK_KEY = "auto_lock_minutes"
export const DEFAULT_AUTO_LOCK_MINUTES = 5
export const AUTO_LOCK_OPTIONS = [1, 5, 15, 30, 60, 0] as const

const storage = new Storage({ area: "local" })

const normalizeMinutes = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return DEFAULT_AUTO_LOCK_MINUTES
  }
  return value
}

export const settingsStore = {
  async getAutoLockMinutes(): Promise<number> {
    const value = await storage.get<number>(AUTO_LOCK_KEY)
    return normalizeMinutes(value)
  },

  async setAutoLockMinutes(minutes: number): Promise<void> {
    await storage.set(AUTO_LOCK_KEY, minutes)
  },

  watchAutoLockMinutes(callback: (minutes: number) => void): () => void {
    const watcher = {
      [AUTO_LOCK_KEY]: ({ newValue }: { newValue: unknown }) => {
        callback(normalizeMinutes(newValue))
      },
    }
    storage.watch(watcher)
    return () => storage.unwatch(watcher)
  },
}
