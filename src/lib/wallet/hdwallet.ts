import * as tapyrus from "tapyrusjs-lib"
import { mnemonicToSeed } from "./mnemonic"

const DERIVATION_PATH = "m/44'/1'/0'/0/0"

export interface HDWalletKeys {
  privateKey: Uint8Array
  publicKey: Uint8Array
  wif: string
}

export const createHDWallet = async (mnemonic: string): Promise<HDWalletKeys> => {
  const seed = await mnemonicToSeed(mnemonic)
  const network = tapyrus.networks.dev
  const root = tapyrus.bip32.fromSeed(seed, network)
  const child = root.derivePath(DERIVATION_PATH)

  if (!child.privateKey) {
    throw new Error("Failed to derive private key")
  }

  return {
    privateKey: child.privateKey,
    publicKey: child.publicKey,
    wif: child.toWIF(),
  }
}

export const getPublicKeyFromWIF = (wif: string): Uint8Array => {
  const network = tapyrus.networks.dev
  const keyPair = tapyrus.ECPair.fromWIF(wif, network)
  return keyPair.publicKey
}
