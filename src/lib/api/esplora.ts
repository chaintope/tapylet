const EXPLORER_API_URL = "https://testnet-explorer.tapyrus.dev.chaintope.com/api"

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

export const formatTpc = (tapyrus: number): string => {
  const tpc = tapyrus / 100000000
  return tpc.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })
}
