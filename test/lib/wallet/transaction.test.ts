import { createAndSignTransaction, createAndSignAssetTransaction, burnAsset } from '../../../src/lib/wallet/transaction'
import * as esplora from '../../../src/lib/api/esplora'
import * as hdwallet from '../../../src/lib/wallet/hdwallet'

// Mock the modules
jest.mock('../../../src/lib/api/esplora')
jest.mock('../../../src/lib/wallet/hdwallet')

const mockedEsplora = esplora as jest.Mocked<typeof esplora>
const mockedHdwallet = hdwallet as jest.Mocked<typeof hdwallet>

describe('transaction', () => {
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  // Valid Tapyrus prod addresses
  const testAddress = '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH'
  const testRecipient = '1cMh228HTCiwS8ZsaakH8A8wze1JR5ZsP'
  const testColorId = 'c1ec2fd806701a3f55808cbec3922c38dafaa3070c48c803e9043ee3642c660b46'

  // Mock wallet keys
  const mockKeys = {
    privateKey: Buffer.alloc(32, 1),
    publicKey: Buffer.from('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 'hex'),
    wif: 'KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',
  }

  // Mock TPC UTXOs
  const mockTpcUtxos: esplora.Utxo[] = [
    {
      txid: 'a'.repeat(64),
      vout: 0,
      status: { confirmed: true },
      value: 100000000, // 1 TPC
      colorId: esplora.TPC_COLOR_ID,
    },
  ]

  // Mock colored UTXOs
  const mockColoredUtxos: esplora.Utxo[] = [
    {
      txid: 'b'.repeat(64),
      vout: 0,
      status: { confirmed: true },
      value: 1000,
      colorId: testColorId,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockedHdwallet.createHDWallet.mockResolvedValue(mockKeys)
    mockedEsplora.broadcastTransaction.mockResolvedValue('c'.repeat(64))
  })

  describe('createAndSignTransaction', () => {
    beforeEach(() => {
      mockedEsplora.getAddressUtxos.mockResolvedValue(mockTpcUtxos)
      mockedEsplora.isTpcColorId.mockImplementation((colorId) => {
        return !colorId || colorId === esplora.TPC_COLOR_ID
      })
    })

    it('should create and sign a TPC transaction', async () => {
      const result = await createAndSignTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 10000000, // 0.1 TPC
        mnemonic: testMnemonic,
      })

      expect(result.txid).toBe('c'.repeat(64))
      expect(result.txHex).toBeDefined()
      expect(typeof result.txHex).toBe('string')
      expect(mockedEsplora.broadcastTransaction).toHaveBeenCalledTimes(1)
    })

    it('should throw error if amount is below dust threshold', async () => {
      await expect(createAndSignTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 100, // Below dust threshold
        mnemonic: testMnemonic,
      })).rejects.toThrow('Amount must be at least 546 tapyrus')
    })

    it('should throw error if no TPC UTXOs available', async () => {
      mockedEsplora.getAddressUtxos.mockResolvedValue([])

      await expect(createAndSignTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 10000000,
        mnemonic: testMnemonic,
      })).rejects.toThrow('No TPC UTXOs available')
    })

    it('should throw error if insufficient funds', async () => {
      await expect(createAndSignTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 200000000, // 2 TPC, more than available
        mnemonic: testMnemonic,
      })).rejects.toThrow('Insufficient funds')
    })
  })

  describe('createAndSignAssetTransaction', () => {
    beforeEach(() => {
      mockedEsplora.getAddressUtxos.mockResolvedValue([...mockTpcUtxos, ...mockColoredUtxos])
      mockedEsplora.isTpcColorId.mockImplementation((colorId) => {
        return !colorId || colorId === esplora.TPC_COLOR_ID
      })
    })

    it('should create and sign an asset transfer transaction', async () => {
      const result = await createAndSignAssetTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 500,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })

      expect(result.txid).toBe('c'.repeat(64))
      expect(result.txHex).toBeDefined()
      expect(mockedEsplora.broadcastTransaction).toHaveBeenCalledTimes(1)
    })

    it('should throw error if amount is zero or negative', async () => {
      await expect(createAndSignAssetTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 0,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('Amount must be greater than 0')
    })

    it('should throw error if no asset UTXOs available', async () => {
      mockedEsplora.getAddressUtxos.mockResolvedValue(mockTpcUtxos) // Only TPC, no colored

      await expect(createAndSignAssetTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 500,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('No asset UTXOs available')
    })

    it('should throw error if no TPC UTXOs for fee', async () => {
      mockedEsplora.getAddressUtxos.mockResolvedValue(mockColoredUtxos) // Only colored, no TPC

      await expect(createAndSignAssetTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 500,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('No TPC UTXOs available for fee')
    })

    it('should throw error if insufficient asset balance', async () => {
      await expect(createAndSignAssetTransaction({
        fromAddress: testAddress,
        toAddress: testRecipient,
        amount: 2000, // More than available (1000)
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('Insufficient asset balance')
    })
  })

  describe('burnAsset', () => {
    beforeEach(() => {
      mockedEsplora.getAddressUtxos.mockResolvedValue([...mockTpcUtxos, ...mockColoredUtxos])
      mockedEsplora.isTpcColorId.mockImplementation((colorId) => {
        return !colorId || colorId === esplora.TPC_COLOR_ID
      })
    })

    it('should create and sign a burn transaction', async () => {
      const result = await burnAsset({
        fromAddress: testAddress,
        amount: 500,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })

      expect(result.txid).toBe('c'.repeat(64))
      expect(result.txHex).toBeDefined()
      expect(mockedEsplora.broadcastTransaction).toHaveBeenCalledTimes(1)
    })

    it('should burn all tokens when amount equals balance', async () => {
      const result = await burnAsset({
        fromAddress: testAddress,
        amount: 1000, // Burn all
        colorId: testColorId,
        mnemonic: testMnemonic,
      })

      expect(result.txid).toBe('c'.repeat(64))
    })

    it('should throw error if amount is zero or negative', async () => {
      await expect(burnAsset({
        fromAddress: testAddress,
        amount: 0,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('Amount must be greater than 0')
    })

    it('should throw error if no asset UTXOs available', async () => {
      mockedEsplora.getAddressUtxos.mockResolvedValue(mockTpcUtxos)

      await expect(burnAsset({
        fromAddress: testAddress,
        amount: 500,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('No asset UTXOs available')
    })

    it('should throw error if no TPC UTXOs for fee', async () => {
      mockedEsplora.getAddressUtxos.mockResolvedValue(mockColoredUtxos)

      await expect(burnAsset({
        fromAddress: testAddress,
        amount: 500,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('No TPC UTXOs available for fee')
    })

    it('should throw error if insufficient asset balance', async () => {
      await expect(burnAsset({
        fromAddress: testAddress,
        amount: 2000,
        colorId: testColorId,
        mnemonic: testMnemonic,
      })).rejects.toThrow('Insufficient asset balance')
    })
  })
})
