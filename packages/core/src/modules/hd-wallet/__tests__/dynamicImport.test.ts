import { createRootKeyFromMnemonicDynamic } from '../dynamicImport'

describe('HD Wallet Dynamic Import', () => {
  const testMnemonic =
    'salon zoo engage submit smile frost later decide wing sight chaos renew lizard rely canal coral scene hobby scare step bus leaf tobacco slice'

  it('should create root key using dynamic import', async () => {
    const rootKey = await createRootKeyFromMnemonicDynamic(testMnemonic)

    expect(rootKey).toBeInstanceOf(Uint8Array)
    expect(rootKey).toHaveLength(96)

    // Expected root key from the test file
    const expectedRootKey = Buffer.from(
      'a8ba80028922d9fcfa055c8aede55b5c575bcd8d5a53168edf45f36d9ec8f4694592b4bc892907583e22669ecdf1b0409a9f3d5549f2dd751b51360909cd05796b9206ec30e142e94b790a98805bf999042b55046963174ee6cee2d0375946',
      'hex'
    )

    expect(Buffer.from(rootKey)).toEqual(expectedRootKey)
  }, 10000) // Increase timeout for dynamic import
})
