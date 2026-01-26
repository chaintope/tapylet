import { Storage } from "@plasmohq/storage"

export interface PendingTransaction {
  txid: string
  amount: number
  toAddress: string
  timestamp: number
  colorId?: string
}

const STORAGE_KEY = "pending_transactions"
const storage = new Storage()

export const pendingTxStore = {
  async getAll(): Promise<PendingTransaction[]> {
    const txs = await storage.get<PendingTransaction[]>(STORAGE_KEY)
    return txs ?? []
  },

  async add(tx: PendingTransaction): Promise<void> {
    const txs = await this.getAll()
    txs.push(tx)
    await storage.set(STORAGE_KEY, txs)
  },

  async remove(txid: string): Promise<void> {
    const txs = await this.getAll()
    const filtered = txs.filter(tx => tx.txid !== txid)
    await storage.set(STORAGE_KEY, filtered)
  },

  async clear(): Promise<void> {
    await storage.set(STORAGE_KEY, [])
  }
}
