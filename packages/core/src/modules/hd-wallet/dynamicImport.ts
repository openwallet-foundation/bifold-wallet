/**
 * Jest-compatible wrapper for xHD-Wallet-API
 * Uses dynamic imports to handle ES modules in Jest
 */

const hdWalletAPI: any = null

export const getHDWalletAPI = async () => {
  if (!hdWalletAPI) {
    try {
      // ...existing code...
    } catch (error) {
      throw new Error(`Failed to load HD Wallet API: ${error}`)
    }
  }
  return hdWalletAPI
}

export const createRootKeyFromMnemonicDynamic = async (
  mnemonic: string,
  passphrase: string = ''
): Promise<Uint8Array> => {
  const bip39 = await import('@scure/bip39')
  const hdAPI = await getHDWalletAPI()

  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase)
  const rootKey = hdAPI.fromSeed(seed)

  return rootKey
}
