import { Agent, Key, KeyType } from '@credo-ts/core'
import { OpenId4VciResolvedCredentialOffer } from '@credo-ts/openid4vc'
import { DeterministicP256 } from '@algorandfoundation/dp256'

// Mock dependencies
jest.mock('@algorandfoundation/dp256')
jest.mock('../../../src/services/keychain')

import {
  getBip39PhraseFromSecureStorage,
  extractOriginFromCredentialOffer,
  getUserHandleFromAgent,
  createDeterministicSoftwareKey,
  createDeterministicKeyFromContext,
} from '../../../src/modules/openid/deterministicKeyUtils'
import { loadMnemonic } from '../../../src/services/keychain'

const mockDeterministicP256 = {
  genDerivedMainKeyWithBIP39: jest.fn(),
  genDomainSpecificKeyPair: jest.fn(),
  getPurePKBytes: jest.fn(),
}

const MockDeterministicP256 = jest.mocked(DeterministicP256)
MockDeterministicP256.mockImplementation(() => mockDeterministicP256 as any)

// Mock keychain functions
const mockLoadMnemonic = jest.mocked(loadMnemonic)

describe('deterministicKeyUtils', () => {
  const mockBip39Phrase =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const mockOrigin = 'https://example.com'
  const mockUserHandle = 'test-user-handle'
  const mockDerivedMainKey = new Uint8Array(32).fill(1)
  const mockDomainSpecificKey = new Uint8Array(32).fill(2)
  const mockPublicKeyBytes = new Uint8Array(65).fill(3)

  const createMockLogger = () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    constructor: { name: 'ConsoleLogger' },
  })

  const mockLogger = createMockLogger()

  const mockAgent = {
    config: {
      walletConfig: {
        seed: mockBip39Phrase,
        id: 'test-wallet-id',
      },
      logger: mockLogger,
    },
    dids: {
      getCreatedDids: jest.fn().mockResolvedValue([{ did: 'did:example:123456789abcdef' }]),
    },
  } as unknown as Agent

  const mockCredentialOffer = {
    metadata: {
      issuer: mockOrigin,
    },
  } as unknown as OpenId4VciResolvedCredentialOffer

  const mockKey = {
    keyType: KeyType.P256,
    publicKey: mockPublicKeyBytes,
  } as Key

  beforeEach(() => {
    jest.clearAllMocks()
    mockDeterministicP256.genDerivedMainKeyWithBIP39.mockResolvedValue(mockDerivedMainKey)
    mockDeterministicP256.genDomainSpecificKeyPair.mockResolvedValue(mockDomainSpecificKey)
    mockDeterministicP256.getPurePKBytes.mockReturnValue(mockPublicKeyBytes)

    // Mock keychain function to return undefined by default
    mockLoadMnemonic.mockResolvedValue(undefined)

    // Clear logger mocks
    mockLogger.info.mockClear()
    mockLogger.warn.mockClear()
    mockLogger.error.mockClear()

    // Mock Key.fromPublicKey static method
    jest.spyOn(Key, 'fromPublicKey').mockReturnValue(mockKey)
  })

  describe('getBip39PhraseFromSecureStorage', () => {
    it('should retrieve BIP39 phrase from wallet config seed', async () => {
      const result = await getBip39PhraseFromSecureStorage(mockAgent)
      expect(result).toBe(mockBip39Phrase)
    })

    it('should retrieve BIP39 phrase from keychain storage', async () => {
      const agentWithoutWalletConfig = {
        config: {
          walletConfig: {},
          logger: createMockLogger(),
        },
      } as unknown as Agent

      mockLoadMnemonic.mockResolvedValue(mockBip39Phrase)

      const result = await getBip39PhraseFromSecureStorage(agentWithoutWalletConfig)
      expect(result).toBe(mockBip39Phrase)
      expect(mockLoadMnemonic).toHaveBeenCalled()
    })

    it('should retrieve BIP39 phrase from secure storage', async () => {
      const agentWithSecureStorage = {
        config: {
          secureStorage: {
            getItem: jest.fn().mockResolvedValue(mockBip39Phrase),
          },
          logger: createMockLogger(),
        },
      } as unknown as Agent

      const result = await getBip39PhraseFromSecureStorage(agentWithSecureStorage)
      expect(result).toBe(mockBip39Phrase)
    })

    it('should retrieve BIP39 phrase from agent context', async () => {
      const agentWithContext = {
        config: { logger: createMockLogger() },
        context: {
          bip39Phrase: mockBip39Phrase,
        },
      } as unknown as Agent

      const result = await getBip39PhraseFromSecureStorage(agentWithContext)
      expect(result).toBe(mockBip39Phrase)
    })

    it('should throw error when BIP39 phrase not found', async () => {
      const agentWithoutPhrase = {
        config: { logger: createMockLogger() },
      } as unknown as Agent

      await expect(getBip39PhraseFromSecureStorage(agentWithoutPhrase)).rejects.toThrow(
        'BIP39 phrase not found in secure storage, wallet config, or agent context'
      )
    })
  })

  describe('extractOriginFromCredentialOffer', () => {
    it('should extract origin from issuer metadata', () => {
      const result = extractOriginFromCredentialOffer(mockCredentialOffer)
      expect(result).toBe('https://example.com')
    })

    it('should extract origin from credential issuer metadata', () => {
      const offerWithCredentialIssuer = {
        ...mockCredentialOffer,
        metadata: {
          credentialIssuerMetadata: {
            credential_issuer: 'https://issuer.example.com',
          },
        },
      } as OpenId4VciResolvedCredentialOffer

      const result = extractOriginFromCredentialOffer(offerWithCredentialIssuer)
      expect(result).toBe('https://issuer.example.com')
    })

    it('should extract origin from original offer URI', () => {
      const offerWithUri = {
        ...mockCredentialOffer,
        metadata: {},
        originalOfferUri: 'https://original.example.com/offer',
      } as any

      const result = extractOriginFromCredentialOffer(offerWithUri)
      expect(result).toBe('https://original.example.com')
    })

    it('should generate fallback domain when no URL found', () => {
      const offerWithoutUrl = {
        ...mockCredentialOffer,
        metadata: {},
      } as OpenId4VciResolvedCredentialOffer

      const result = extractOriginFromCredentialOffer(offerWithoutUrl)
      expect(result).toMatch(/^https:\/\/issuer-[a-z0-9]+\.credential-provider\.com$/)
    })
  })

  describe('getUserHandleFromAgent', () => {
    it('should extract user handle from agent context userId', async () => {
      const agentWithUserId = {
        ...mockAgent,
        context: { userId: 'test-user-123' },
      } as unknown as Agent

      const result = await getUserHandleFromAgent(agentWithUserId)
      expect(result).toBe('test-user-123')
    })

    it('should extract user handle from DID', async () => {
      const result = await getUserHandleFromAgent(mockAgent)
      expect(result).toBe('did-123456789abcdef')
    })

    it('should extract user handle from wallet ID', async () => {
      const agentWithoutDids = {
        ...mockAgent,
        dids: {
          getCreatedDids: jest.fn().mockResolvedValue([]),
        },
      } as unknown as Agent

      const result = await getUserHandleFromAgent(agentWithoutDids)
      expect(result).toBe('wallet-testwalletid')
    })

    it('should extract user handle from wallet label', async () => {
      const agentWithLabel = {
        config: {
          walletConfig: {
            label: 'My Test Wallet!',
          },
          logger: createMockLogger(),
        },
        dids: {
          getCreatedDids: jest.fn().mockResolvedValue([]),
        },
      } as unknown as Agent

      const result = await getUserHandleFromAgent(agentWithLabel)
      expect(result).toBe('user-MyTestWallet')
    })

    it('should generate fallback user handle from agent config', async () => {
      const minimalAgent = {
        config: {
          walletConfig: {},
          logger: createMockLogger(),
        },
        dids: {
          getCreatedDids: jest.fn().mockResolvedValue([]),
        },
      } as unknown as Agent

      const result = await getUserHandleFromAgent(minimalAgent)
      expect(result).toMatch(/^agent-[a-z0-9]+$/)
    })
  })

  describe('createDeterministicSoftwareKey', () => {
    it('should create deterministic P256 key successfully', async () => {
      const result = await createDeterministicSoftwareKey({
        keyType: KeyType.P256,
        bip39Phrase: mockBip39Phrase,
        origin: mockOrigin,
        userHandle: mockUserHandle,
      })

      expect(result).toBe(mockKey)
      expect(mockDeterministicP256.genDerivedMainKeyWithBIP39).toHaveBeenCalledWith(mockBip39Phrase)
      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenCalledWith(
        mockDerivedMainKey,
        mockOrigin,
        mockUserHandle,
        0
      )
      expect(mockDeterministicP256.getPurePKBytes).toHaveBeenCalledWith(mockDomainSpecificKey)
      expect(Key.fromPublicKey).toHaveBeenCalledWith(mockPublicKeyBytes, KeyType.P256)
    })

    it('should use custom counter when provided', async () => {
      await createDeterministicSoftwareKey({
        keyType: KeyType.P256,
        bip39Phrase: mockBip39Phrase,
        origin: mockOrigin,
        userHandle: mockUserHandle,
        counter: 5,
      })

      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenCalledWith(
        mockDerivedMainKey,
        mockOrigin,
        mockUserHandle,
        5
      )
    })

    it('should throw error for non-P256 key types', async () => {
      await expect(
        createDeterministicSoftwareKey({
          keyType: KeyType.Ed25519,
          bip39Phrase: mockBip39Phrase,
          origin: mockOrigin,
          userHandle: mockUserHandle,
        })
      ).rejects.toThrow('Deterministic keys currently only support P256 curve')
    })

    it('should handle dp256 errors', async () => {
      mockDeterministicP256.genDerivedMainKeyWithBIP39.mockRejectedValue(new Error('Invalid BIP39 phrase'))

      await expect(
        createDeterministicSoftwareKey({
          keyType: KeyType.P256,
          bip39Phrase: 'invalid phrase',
          origin: mockOrigin,
          userHandle: mockUserHandle,
        })
      ).rejects.toThrow('Invalid BIP39 phrase')
    })
  })

  describe('createDeterministicKeyFromContext', () => {
    it('should create deterministic key with all context extracted', async () => {
      const result = await createDeterministicKeyFromContext(mockAgent, mockCredentialOffer, KeyType.P256)

      expect(result).toBe(mockKey)
      expect(mockDeterministicP256.genDerivedMainKeyWithBIP39).toHaveBeenCalledWith(mockBip39Phrase)
      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenCalledWith(
        mockDerivedMainKey,
        'https://example.com',
        'did-123456789abcdef',
        0
      )
    })

    it('should use custom counter when provided', async () => {
      await createDeterministicKeyFromContext(mockAgent, mockCredentialOffer, KeyType.P256, 3)

      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenCalledWith(
        mockDerivedMainKey,
        'https://example.com',
        'did-123456789abcdef',
        3
      )
    })

    it('should handle errors from getBip39PhraseFromSecureStorage', async () => {
      const agentWithoutPhrase = {
        config: { logger: createMockLogger() },
      } as unknown as Agent

      await expect(
        createDeterministicKeyFromContext(agentWithoutPhrase, mockCredentialOffer, KeyType.P256)
      ).rejects.toThrow('BIP39 phrase not found in secure storage, wallet config, or agent context')
    })

    it('should handle errors from extractOriginFromCredentialOffer', async () => {
      const invalidOffer = {
        metadata: {},
      } as unknown as OpenId4VciResolvedCredentialOffer

      const result = await createDeterministicKeyFromContext(mockAgent, invalidOffer, KeyType.P256)

      // Should still work with fallback domain
      expect(result).toBe(mockKey)
    })

    it('should handle errors from getUserHandleFromAgent', async () => {
      const agentWithError = {
        ...mockAgent,
        dids: {
          getCreatedDids: jest.fn().mockRejectedValue(new Error('DID access error')),
        },
      } as unknown as Agent

      const result = await createDeterministicKeyFromContext(agentWithError, mockCredentialOffer, KeyType.P256)

      // Should still work with fallback from wallet ID
      expect(result).toBe(mockKey)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete end-to-end workflow', async () => {
      const result = await createDeterministicKeyFromContext(mockAgent, mockCredentialOffer, KeyType.P256, 1)

      // Verify all components work together
      expect(mockDeterministicP256.genDerivedMainKeyWithBIP39).toHaveBeenCalledWith(mockBip39Phrase)
      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenCalledWith(
        mockDerivedMainKey,
        'https://example.com',
        'did-123456789abcdef',
        1
      )
      expect(mockDeterministicP256.getPurePKBytes).toHaveBeenCalledWith(mockDomainSpecificKey)
      expect(Key.fromPublicKey).toHaveBeenCalledWith(mockPublicKeyBytes, KeyType.P256)
      expect(result).toBe(mockKey)
    })

    it('should be deterministic with same inputs', async () => {
      // Call function twice with same inputs
      const result1 = await createDeterministicKeyFromContext(mockAgent, mockCredentialOffer, KeyType.P256)
      const result2 = await createDeterministicKeyFromContext(mockAgent, mockCredentialOffer, KeyType.P256)

      // Both should call the same underlying functions with same parameters
      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenCalledTimes(2)
      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenNthCalledWith(
        1,
        mockDerivedMainKey,
        'https://example.com',
        'did-123456789abcdef',
        0
      )
      expect(mockDeterministicP256.genDomainSpecificKeyPair).toHaveBeenNthCalledWith(
        2,
        mockDerivedMainKey,
        'https://example.com',
        'did-123456789abcdef',
        0
      )
      expect(result1).toBe(result2)
    })
  })
})
