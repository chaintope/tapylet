import * as tapyrus from "tapyrusjs-lib"
import { getAddressUtxos, broadcastTransaction, type Utxo } from "../api/esplora"
import { createHDWallet } from "./hdwallet"

const DUST_THRESHOLD = 546
const DEFAULT_FEE_RATE = 1 // tapyrus per byte

export interface SendResult {
  txid: string
  txHex: string
}

export interface SendOptions {
  fromAddress: string
  toAddress: string
  amount: number // in tapyrus
  mnemonic: string
  feeRate?: number
}

const selectUtxos = (
  utxos: Utxo[],
  targetAmount: number,
  feeRate: number
): { selectedUtxos: Utxo[]; totalInput: number; fee: number } => {
  // Sort UTXOs by value (largest first) for efficient selection
  const sortedUtxos = [...utxos].sort((a, b) => b.value - a.value)

  const selectedUtxos: Utxo[] = []
  let totalInput = 0

  // Estimate transaction size: ~10 bytes base + 148 bytes per input + 34 bytes per output
  // We assume 2 outputs (recipient + change)
  const estimateFee = (inputCount: number): number => {
    const estimatedSize = 10 + inputCount * 148 + 2 * 34
    return estimatedSize * feeRate
  }

  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo)
    totalInput += utxo.value

    const fee = estimateFee(selectedUtxos.length)
    if (totalInput >= targetAmount + fee) {
      return { selectedUtxos, totalInput, fee }
    }
  }

  throw new Error("Insufficient funds")
}

export const createAndSignTransaction = async (
  options: SendOptions
): Promise<SendResult> => {
  const { fromAddress, toAddress, amount, mnemonic, feeRate = DEFAULT_FEE_RATE } = options

  // Validate amount
  if (amount < DUST_THRESHOLD) {
    throw new Error(`Amount must be at least ${DUST_THRESHOLD} tapyrus`)
  }

  // Get UTXOs
  const utxos = await getAddressUtxos(fromAddress)
  if (utxos.length === 0) {
    throw new Error("No UTXOs available")
  }

  // Select UTXOs
  const { selectedUtxos, totalInput, fee } = selectUtxos(utxos, amount, feeRate)

  // Get keys from mnemonic
  const keys = await createHDWallet(mnemonic)
  const network = tapyrus.networks.prod
  const keyPair = tapyrus.ECPair.fromWIF(keys.wif, network)

  // Create transaction builder
  const txb = new tapyrus.TransactionBuilder(network)
  txb.setVersion(1) // Tapyrus feature field

  // Add inputs
  for (const utxo of selectedUtxos) {
    txb.addInput(utxo.txid, utxo.vout)
  }

  // Add recipient output
  txb.addOutput(toAddress, amount)

  // Add change output if needed
  const change = totalInput - amount - fee
  if (change >= DUST_THRESHOLD) {
    txb.addOutput(fromAddress, change)
  }

  // Sign all inputs
  for (let i = 0; i < selectedUtxos.length; i++) {
    txb.sign({
      prevOutScriptType: "p2pkh",
      vin: i,
      keyPair,
    })
  }

  // Build and extract
  const tx = txb.build()
  const txHex = tx.toHex()

  // Broadcast
  const txid = await broadcastTransaction(txHex)

  return { txid, txHex }
}

export const estimateFee = async (
  fromAddress: string,
  amount: number,
  feeRate: number = DEFAULT_FEE_RATE
): Promise<number> => {
  const utxos = await getAddressUtxos(fromAddress)
  const { fee } = selectUtxos(utxos, amount, feeRate)
  return fee
}
