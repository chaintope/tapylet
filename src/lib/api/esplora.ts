const EXPLORER_API_URL = process.env.PLASMO_PUBLIC_EXPLORER_API_URL
  ?? "https://testnet-explorer.tapyrus.dev.chaintope.com/api"

const EXPLORER_URL = process.env.PLASMO_PUBLIC_EXPLORER_URL
  ?? "https://testnet-explorer.tapyrus.dev.chaintope.com"

export const getExplorerTxUrl = (txid: string): string => {
  return `${EXPLORER_URL}/tx/${txid}`
}

// Color ID for native TPC (uncolored coins)
const TPC_COLOR_ID = "000000000000000000000000000000000000000000000000000000000000000000"

export interface BalanceInfo {
  colorId: string
  count: number
  received: number
  sent: number
  balanced: number
}

export interface AddressInfo {
  balances: BalanceInfo[]
  tx: {
    txs: unknown[]
    last_seen_txid: string
  }
}

export interface Utxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
  value: number
}

export const getAddressInfo = async (address: string): Promise<AddressInfo> => {
  const response = await fetch(`${EXPLORER_API_URL}/address/${address}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch address info: ${response.status}`)
  }
  return response.json()
}

export const getAddressUtxos = async (address: string): Promise<Utxo[]> => {
  const response = await fetch(`${EXPLORER_API_URL}/address/${address}/utxo`)
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.status}`)
  }
  return response.json()
}

export const getBalance = async (address: string): Promise<number> => {
  const info = await getAddressInfo(address)
  const tpcBalance = info.balances.find(b => b.colorId === TPC_COLOR_ID)
  return tpcBalance?.balanced ?? 0
}

export interface BalanceDetails {
  confirmed: number
  unconfirmed: number
  total: number
}

export const getBalanceDetails = async (address: string): Promise<BalanceDetails> => {
  const utxos = await getAddressUtxos(address)

  let confirmed = 0
  let unconfirmed = 0

  for (const utxo of utxos) {
    if (utxo.status.confirmed) {
      confirmed += utxo.value
    } else {
      unconfirmed += utxo.value
    }
  }

  return {
    confirmed,
    unconfirmed,
    total: confirmed + unconfirmed,
  }
}

export const formatTpc = (tapyrus: number): string => {
  const tpc = tapyrus / 100000000
  return tpc.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })
}

export const parseTpc = (tpcString: string): number => {
  const tpc = parseFloat(tpcString)
  if (isNaN(tpc)) {
    throw new Error("Invalid TPC amount")
  }
  return Math.round(tpc * 100000000)
}

export const broadcastTransaction = async (txHex: string): Promise<string> => {
  const response = await fetch(`${EXPLORER_API_URL}/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: txHex,
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to broadcast transaction: ${errorText}`)
  }
  return response.text()
}

export interface TransactionStatus {
  confirmed: boolean
  block_height?: number
  block_hash?: string
  block_time?: number
}

export interface TransactionInfo {
  txid: string
  status: TransactionStatus
}

export const getTransactionInfo = async (txid: string): Promise<TransactionInfo> => {
  const response = await fetch(`${EXPLORER_API_URL}/tx/${txid}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction: ${response.status}`)
  }
  return response.json()
}
