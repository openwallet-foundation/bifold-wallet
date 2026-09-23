import { jest, describe, expect, it, beforeEach } from "@jest/globals"
import { renderHook, act } from '@testing-library/react-native'
import { Platform } from 'react-native'
import { Kms } from '@credo-ts/core'
import { encodeToBase64Url } from '@openid4vc/utils'

import { useAttestation } from '../../src/hooks/attestation'
import { PersistentStorage } from '../../src/services/storage'
import { LocalStorageKeys } from '../../src/constants'
import { useServices } from '../../src/container-api'
import { useStore } from '../../src/contexts/store'
import { DispatchAction } from '../../src/contexts/reducers/store'
import { withRetry } from '../../src/utils/network'
import { AttestationResult } from '../../src/types/attestation'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@openid4vc/utils', () => ({
  encodeToBase64Url: jest.fn()
}))

jest.mock('../../src/services/storage', () => ({
  PersistentStorage: {
    fetchValueForKey: jest.fn(),
    storeValueForKey: jest.fn(),
  },
}))

jest.mock('../../src/container-api', () => ({
  useServices: jest.fn(),
  TOKENS: {
    FN_ATTESTATION_GET_CHALLENGE: 'FN_ATTESTATION_GET_CHALLENGE',
    FN_ATTESTATION_GET_JWT: 'FN_ATTESTATION_GET_JWT',
    CONFIG: 'CONFIG',
    UTIL_LOGGER: 'UTIL_LOGGER',
    UTIL_AGENT_BRIDGE: 'UTIL_AGENT_BRIDGE',
    ATTESTATION_PROVIDER: 'ATTESTATION_PROVIDER',
  },
}))

jest.mock('../../src/contexts/store', () => ({
  useStore: jest.fn(),
}))

jest.mock('../../src/utils/network', () => ({
  withRetry: jest.fn(),
}))

const mockAgent = {
  kms: {
    createKeyForSignatureAlgorithm: jest.fn(() => Promise.resolve(mockPublicJwk)),
  },
  genericRecords: {
    save: jest.fn(() => Promise.resolve()),
    findById: jest.fn(),
  },
}

jest.mock('@credo-ts/core', () => {
  const actual: { Kms: any } = jest.requireActual('@credo-ts/core')
  return {
    ...actual,
    Kms: {
      ...actual.Kms,
      PublicJwk: {
        ...actual.Kms.PublicJwk,
        fromPublicJwk: jest.fn(), // explicit override after spread
      },
    },
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockChallenge = 'test-challenge'
const mockKeyID = 'test-key-id'
const mockAttestationJWT = { signedAttestation: 'attestation-jwt' }
const mockJWTThumbprint = 'jwt-thumbprint'
const mockEncodedThumbprint = 'encoded-thumbprint'
const boundChallenge = mockChallenge + mockEncodedThumbprint

const appleResult: AttestationResult = {
  kind: 'apple-app-attest',
  keyId: mockKeyID,
  attestation: 'apple-attestation-blob',
}
const androidKeyResult: AttestationResult = {
  kind: 'android-key-attestation',
  keyId: mockKeyID,
  certificateChain: ['cert-leaf', 'cert-root'],
}

const mockGetJwkThumbprint = jest.fn().mockReturnValue(mockJWTThumbprint)
const mockGetChallenge = jest.fn().mockResolvedValue(mockChallenge as never)
const mockGetJWT = jest.fn().mockResolvedValue(mockAttestationJWT as never)
const mockDispatch = jest.fn()
const mockLogger = { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
const mockPublicJwk = { publicJwk: { kty: 'EC', crv: 'P-256' } }
const mockSigningKey = { getJwkThumbprint: mockGetJwkThumbprint }
const mockAgentBridge = {
  onReady: jest.fn((cb: (agent: typeof mockAgent) => Promise<void>) => cb(mockAgent)),
}

const mockIsSupported = jest.fn()
const mockAttest = jest.fn()
const mockProvider = { isSupported: mockIsSupported, attest: mockAttest }

const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>
const encodeToBase64UrlMock = encodeToBase64Url as jest.MockedFunction<typeof encodeToBase64Url>
const fromPublicJwkMock = Kms.PublicJwk.fromPublicJwk as jest.MockedFunction<typeof Kms.PublicJwk.fromPublicJwk>
const useStoreMock = useStore as jest.MockedFunction<typeof useStore>
const fetchValueForKeyMock = PersistentStorage.fetchValueForKey as jest.MockedFunction<typeof PersistentStorage.fetchValueForKey>
const storeValueForKeyMock = PersistentStorage.storeValueForKey as jest.MockedFunction<typeof PersistentStorage.storeValueForKey>

function setupDefaultMocks(overrides: Partial<{
  enableAttestation: boolean
  getAttestationChallenge: jest.Mock | null
  getAttestationJWT: jest.Mock | null
  isAttestationConfigured: boolean
  attestationResult: AttestationResult
  isSupported: boolean
}> = {}) {
  const {
    enableAttestation = true,
    getAttestationChallenge = mockGetChallenge,
    getAttestationJWT = mockGetJWT,
    isAttestationConfigured = false,
    attestationResult = appleResult,
    isSupported = true,
  } = overrides;

  (useServices as jest.Mock).mockReturnValue([
    getAttestationChallenge,
    getAttestationJWT,
    { enableAttestation },
    mockLogger,
    mockAgentBridge,
    mockProvider,
  ]);
  useStoreMock.mockReturnValue([{} as any, mockDispatch]);
  fetchValueForKeyMock.mockImplementation(() => Promise.resolve(isAttestationConfigured as any));
  storeValueForKeyMock.mockImplementation(() => Promise.resolve(undefined));
  fromPublicJwkMock.mockReturnValue(mockSigningKey)
  encodeToBase64UrlMock.mockReturnValue(mockEncodedThumbprint)
  mockIsSupported.mockImplementation(() => Promise.resolve(isSupported) as any)
  mockAttest.mockImplementation(() => Promise.resolve(attestationResult) as any)
  // Run the real function so the binding in the hook is exercised.
  mockWithRetry.mockImplementation((fn: any, args: any) => fn(...args))
}

describe('useAttestation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
    setupDefaultMocks()
  })

  describe('hook interface', () => {
    it('returns initAttestation function', () => {
      const { result } = renderHook(() => useAttestation())
      expect(result.current.initAttestation).toBeInstanceOf(Function)
    })
  })

  describe('Early exit conditions', () => {
    it('marks attestation completed and returns when enableAttestation is false', async () => {
      setupDefaultMocks({ enableAttestation: false })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.initAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
      expect(mockGetChallenge).not.toHaveBeenCalled()
      expect(mockAttest).not.toHaveBeenCalled()
    })

    it('marks attestation completed and returns when already configured', async () => {
      setupDefaultMocks({ isAttestationConfigured: true })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.initAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
      expect(mockGetChallenge).not.toHaveBeenCalled()
    })

    it('checks the correct storage key for attestation configured flag', async () => {
      setupDefaultMocks({ isAttestationConfigured: true })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.initAttestation())

      expect(PersistentStorage.fetchValueForKey).toHaveBeenCalledWith(
        LocalStorageKeys.AttestationConfigured
      )
    })
  })

  // ── Provider delegation ──────────────────────────────────────────────────────

  describe('provider delegation', () => {
    it('checks support before attesting', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockIsSupported).toHaveBeenCalled()
      expect(mockAttest).toHaveBeenCalled()
    })

    it('attests over the challenge concatenated with the key thumbprint, via withRetry', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(withRetry).toHaveBeenCalledWith(expect.any(Function), [boundChallenge])
      expect(mockAttest).toHaveBeenCalledWith(boundChallenge)
    })

    it('throws when the provider reports the device is unsupported', async () => {
      setupDefaultMocks({ isSupported: false })
      const { result } = renderHook(() => useAttestation())

      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
      expect(mockAttest).not.toHaveBeenCalled()
    })

    it('throws when the provider fails to attest', async () => {
      mockAttest.mockImplementationOnce(() => Promise.reject(new Error('attest failed')) as any)
      const { result } = renderHook(() => useAttestation())

      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

    it('preserves `this` for providers implemented as classes', async () => {
      class ClassProvider {
        private secret = 'bound'
        async isSupported() { return true }
        async attest(): Promise<AttestationResult> {
          // Throws a TypeError if `this` was lost when the method was passed to withRetry.
          return { kind: 'apple-app-attest', keyId: this.secret, attestation: 'blob' }
        }
      }
      setupDefaultMocks();
      (useServices as jest.Mock).mockReturnValue([
        mockGetChallenge, mockGetJWT, { enableAttestation: true },
        mockLogger, mockAgentBridge, new ClassProvider(),
      ])

      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith(expect.objectContaining({ keyId: 'bound' }))
    })
  })

  // ── Result mapping per attestation kind ──────────────────────────────────────

  describe('result mapping', () => {
    it('sends the raw attestation for apple-app-attest', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith({
        attestation: appleResult.attestation,
        attestationKind: 'apple-app-attest',
        challenge: mockChallenge,
        keyId: mockKeyID,
        platform: 'ios',
        signingKey: mockSigningKey,
      })
    })

    it('sends the certificate chain for android-key-attestation', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
      setupDefaultMocks({ attestationResult: androidKeyResult })
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith({
        attestation: androidKeyResult.certificateChain,
        attestationKind: 'android-key-attestation',
        challenge: mockChallenge,
        keyId: mockKeyID,
        platform: 'android',
        signingKey: mockSigningKey,
      })
    })

    it('stores the attestation JWT and marks the attestation process as completed', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockAgent.genericRecords.save).toHaveBeenCalledWith(
        { content: { attestationJwt: mockAttestationJWT.signedAttestation }, id: 'walletAttestStorage' }
      )
      expect(PersistentStorage.storeValueForKey).toHaveBeenCalledWith(
        LocalStorageKeys.AttestationConfigured,
        true
      )
      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
    })

    it('throws an error when getAttestationJWT fails', async () => {
      mockGetJWT.mockImplementationOnce(() => Promise.reject(new Error('getAttestationJWT failed')))
      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── storeAttestationJWT ──────────────────────────────────────────────────────

  describe('storeAttestationJWT', () => {
    it('wraps agent bridge errors as "Error storing attestation result"', async () => {
      mockAgentBridge.onReady.mockImplementationOnce(() => {
        throw new Error('bridge not available')
      })

      const { result } = renderHook(() => useAttestation())
      // The store error is caught by initAttestation's catch block
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── Challenge fetching ───────────────────────────────────────────────────────

  describe('challenge fetching', () => {
    it('fetches a challenge before any attestation operations', async () => {
      const callOrder: string[] = []
      mockGetChallenge.mockImplementationOnce(async () => {
        callOrder.push('challenge')
        return mockChallenge
      })
      mockAttest.mockImplementationOnce((() => {
        callOrder.push('attest')
        return Promise.resolve(appleResult)
      }) as any)

      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(callOrder[0]).toBe('challenge')
      expect(callOrder[1]).toBe('attest')
    })

    it('logs and rethrows when challenge fetch fails', async () => {
      mockGetChallenge.mockImplementationOnce(() => Promise.reject(new Error('challenge fetch failed')))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })
})
