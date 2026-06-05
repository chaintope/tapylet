// Stub for @plasmohq/storage (and /secure) used in Jest.
// The real package ships ESM-only deps (pify) that Jest can't transform, and
// our tests never exercise the Plasmo adapter directly — they inject the
// in-memory stores instead. This stub only needs to keep module-load-time
// `new PlasmoKeyValueStore()` / `new PlasmoSecureStore()` singletons from
// throwing when a store module is imported.

export class Storage {
  constructor(_opts?: unknown) {}
  async get(_key?: string): Promise<undefined> {
    return undefined
  }
  async set(_key?: string, _value?: unknown): Promise<void> {}
  async remove(_key?: string): Promise<void> {}
  watch(_watcher?: unknown): void {}
  unwatch(_watcher?: unknown): void {}
}

export class SecureStorage extends Storage {
  async setPassword(_password?: string): Promise<void> {}
}
