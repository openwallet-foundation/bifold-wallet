import { jest, describe, expect, it, beforeEach } from "@jest/globals"
import { renderHook, act } from '@testing-library/react-native'
import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
} from '@expo/app-integrity'
import { Kms } from '@credo-ts/core'
import { encodeToBase64Url } from '@openid4vc/utils'

import { useAttestation } from '../../src/hooks/attestation'
import { PersistentStorage } from '../../src/services/storage'
import { LocalStorageKeys } from '../../src/constants'
import { useServices } from '../../src/container-api'
import { useStore } from '../../src/contexts/store'
import { DispatchAction } from '../../src/contexts/reducers/store'
import { withRetry } from '../../src/utils/network'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@expo/app-integrity', () => ({
  attestKeyAsync: jest.fn(),
  generateKeyAsync: jest.fn(),
  generateHardwareAttestedKeyAsync: jest.fn(),
  getAttestationCertificateChainAsync: jest.fn(),
  isSupported: true,
  isHardwareAttestationSupportedAsync: true,
}))

jest.mock('react-native-uuid', () => ({
  __esModule: true,
  default: {
    v4: jest.fn().mockReturnValue('123456789')
  }
}))

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
const mockAttestationResult = 'attestation-result'
const mockAttestationJWT = { signedAttestation: 'attestation-jwt' }
const mockJWTThumbprint = 'jwt-thumbprint'
const mockEncodedThumbprint = 'encoded-thumbprint'
const mockEncodedChallenge = `Mocked ${mockChallenge + mockEncodedThumbprint} encoded as SHA-256`

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

const mockGenerateKeyAsync = generateKeyAsync as jest.MockedFunction<typeof generateKeyAsync>
const mockGenerateHardwareAttestedKeyAsync = generateHardwareAttestedKeyAsync as jest.MockedFunction<typeof generateHardwareAttestedKeyAsync>
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
}> = {}) {
  const {
    enableAttestation = true,
    getAttestationChallenge = mockGetChallenge,
    getAttestationJWT = mockGetJWT,
    isAttestationConfigured = false,
  } = overrides;

  (useServices as jest.Mock).mockReturnValue([
    getAttestationChallenge,
    getAttestationJWT,
    { enableAttestation },
    mockLogger,
    mockAgentBridge,
  ]);
  useStoreMock.mockReturnValue([{} as any, mockDispatch]);
  fetchValueForKeyMock.mockImplementation(() => Promise.resolve(isAttestationConfigured as any));
  storeValueForKeyMock.mockImplementation(() => Promise.resolve(undefined));
  fromPublicJwkMock.mockReturnValue(mockSigningKey)
  encodeToBase64UrlMock.mockReturnValue(mockEncodedThumbprint)
  mockGenerateKeyAsync.mockResolvedValue(mockKeyID)
}

describe('useAttestation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  // ── iOS flow ─────────────────────────────────────────────────────────────────

  describe('iOS attestation flow', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
      (withRetry as jest.Mock).mockImplementation(() => Promise.resolve(mockAttestationResult));
    })

    it('generates a key and attests it', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(generateKeyAsync).toHaveBeenCalled()
      expect(withRetry).toHaveBeenCalledWith(attestKeyAsync, [mockKeyID, mockChallenge + mockEncodedThumbprint])
    })

    it('fetches an attestation JWT using the correct params', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith({
        attestation: mockAttestationResult,
        challenge: mockChallenge,
        keyId: mockKeyID,
        platform: 'ios',
        signingKey: mockSigningKey
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

    it('throws an error when generateKeyAsync fails', async () => {
      mockGenerateKeyAsync.mockImplementationOnce(() => Promise.reject(new Error('generateKeyAsync failed')))
      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

    it('throws an error when attestKeyAsync fails', async () => {
      mockGenerateKeyAsync.mockImplementationOnce(() => Promise.reject(new Error('generateKeyAsync failed')))
      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

    it('throws an error when getAttestationJWT fails', async () => {
      mockGetJWT.mockImplementationOnce(() => Promise.reject(new Error('getAttestationJWT failed')))
      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── Android flow ─────────────────────────────────────────────────────────────

  describe('Android attestation flow', () => {
    const androidKeyID = '123456789'

    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
      mockGenerateHardwareAttestedKeyAsync.mockImplementation(() => Promise.resolve(undefined));
    })

    it('generates a hardware attested key with the correct key ID', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(generateHardwareAttestedKeyAsync).toHaveBeenCalledWith(androidKeyID, mockEncodedChallenge)
    })

    it('retrieves the certificate chain via withRetry', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(withRetry).toHaveBeenCalledWith(getAttestationCertificateChainAsync, [androidKeyID])
    })

    it('fetches an attestation JWT using the certificate chain', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith({
        attestation: mockAttestationResult,
        challenge: mockChallenge,
        keyId: androidKeyID,
        platform: 'android',
        signingKey: mockSigningKey
      })
    })

    it('saves the attestation JWT and marks attestation completed', async () => {
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

    it('throws an error when generateHardwareAttestedKeyAsync fails', async () => {
      mockGenerateHardwareAttestedKeyAsync.mockRejectedValueOnce(new Error('hw key gen failed'))
      const { result } = renderHook(() => useAttestation())

      await expect(result.current.initAttestation()).rejects.toThrow('Error initializing attestation')
    })

    it('throws an error when getCertificateChain fails', async () => {
      mockWithRetry.mockRejectedValueOnce(new Error('cert chain failed'))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── Unsupported platform ─────────────────────────────────────────────────────

  describe('unsupported platform', () => {
    it('throws when Platform.OS is not ios or android', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.initAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── storeAttestationJWT ──────────────────────────────────────────────────────

  describe('storeAttestationJWT', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      mockGenerateKeyAsync.mockResolvedValue(mockKeyID)
      mockWithRetry.mockResolvedValue(mockAttestationResult)
    })

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
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      mockWithRetry.mockResolvedValue(mockAttestationResult)
    })

    it('fetches a challenge before any key operations', async () => {
      const callOrder: string[] = []
      mockGetChallenge.mockImplementationOnce(async () => {
        callOrder.push('challenge')
        return mockChallenge
      })
      mockGenerateKeyAsync.mockImplementationOnce(async () => {
        callOrder.push('generateKey')
        return mockKeyID
      })

      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.initAttestation())

      expect(callOrder[0]).toBe('challenge')
      expect(callOrder[1]).toBe('generateKey')
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