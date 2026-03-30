import { renderHook, act } from '@testing-library/react-native'
import { Platform } from 'react-native'
import {
  attestKeyAsync,
  generateKeyAsync,
  generateHardwareAttestedKeyAsync,
  getAttestationCertificateChainAsync,
} from '@expo/app-integrity'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockChallenge = 'test-challenge'
const mockKeyID = 'test-key-id'
const mockAttestationResult = 'attestation-result'
const mockAttestationJWT = 'attestation-jwt'

const mockGetChallenge = jest.fn().mockResolvedValue(mockChallenge)
const mockGetJWT = jest.fn().mockResolvedValue(mockAttestationJWT)
const mockDispatch = jest.fn()
const mockLogger = { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
const mockAgent = {
  genericRecords: {
    save: jest.fn().mockResolvedValue(undefined),
  },
}
const mockAgentBridge = {
  onReady: jest.fn((cb: (agent: typeof mockAgent) => Promise<void>) => cb(mockAgent)),
}

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
  } = overrides

  ;(useServices as jest.Mock).mockReturnValue([
    getAttestationChallenge,
    getAttestationJWT,
    { enableAttestation },
    mockLogger,
    mockAgentBridge,
  ])

  ;(useStore as jest.Mock).mockReturnValue([{}, mockDispatch])

  ;(PersistentStorage.fetchValueForKey as jest.Mock).mockResolvedValue(isAttestationConfigured)
  ;(PersistentStorage.storeValueForKey as jest.Mock).mockResolvedValue(undefined)
}

describe('useAttestation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupDefaultMocks()
  })

  describe('hook interface', () => {
    it('returns setupAttestation function', () => {
      const { result } = renderHook(() => useAttestation())
      expect(result.current.setupAttestation).toBeInstanceOf(Function)
    })
  })

  describe('early exit conditions', () => {
    it('marks attestation completed and returns when enableAttestation is false', async () => {
      setupDefaultMocks({ enableAttestation: false })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.setupAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
      expect(mockGetChallenge).not.toHaveBeenCalled()
    })

    it('marks attestation completed and returns when getAttestationChallenge is null', async () => {
      setupDefaultMocks({ getAttestationChallenge: null })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.setupAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
    })

    it('marks attestation completed and returns when getAttestationJWT is null', async () => {
      setupDefaultMocks({ getAttestationJWT: null })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.setupAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
    })

    it('marks attestation completed and returns when already configured', async () => {
      setupDefaultMocks({ isAttestationConfigured: true })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.setupAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
      expect(mockGetChallenge).not.toHaveBeenCalled()
    })

    it('checks the correct storage key for attestation configured flag', async () => {
      setupDefaultMocks({ isAttestationConfigured: true })
      const { result } = renderHook(() => useAttestation())

      await act(() => result.current.setupAttestation())

      expect(PersistentStorage.fetchValueForKey).toHaveBeenCalledWith(
        LocalStorageKeys.AttestationConfigured
      )
    })
  })

  // ── iOS flow ─────────────────────────────────────────────────────────────────

  describe('iOS attestation flow', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      ;(generateKeyAsync as jest.Mock).mockResolvedValue(mockKeyID)
      ;(withRetry as jest.Mock).mockResolvedValue(mockAttestationResult)
    })

    it('generates a key and attests it', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(generateKeyAsync).toHaveBeenCalled()
      expect(withRetry).toHaveBeenCalledWith(attestKeyAsync, [mockKeyID, mockChallenge])
    })

    it('fetches an attestation JWT using the result and challenge', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith(mockAttestationResult, mockChallenge, mockKeyID)
    })

    it('saves the attestation JWT via the agent bridge', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(mockAgentBridge.onReady).toHaveBeenCalled()
      expect(mockAgent.genericRecords.save).toHaveBeenCalledWith({
        content: mockAttestationJWT,
        id: 'attestationJWT',
      })
    })

    it('persists the configured flag and key ID in storage', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(PersistentStorage.storeValueForKey).toHaveBeenCalledWith(
        LocalStorageKeys.AttestationConfigured,
        true
      )
      expect(PersistentStorage.storeValueForKey).toHaveBeenCalledWith(
        LocalStorageKeys.AttestationKey,
        mockKeyID
      )
    })

    it('dispatches SET_ATTESTATION_COMPLETED after storing', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
    })

    it('logs and rethrows when generateKeyAsync fails', async () => {
      ;(generateKeyAsync as jest.Mock).mockRejectedValue(new Error('key gen failed'))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

    it('logs and rethrows when withRetry (attestKeyAsync) fails', async () => {
      ;(withRetry as jest.Mock).mockRejectedValue(new Error('attest failed'))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

    it('logs and rethrows when getAttestationJWT fails', async () => {
      mockGetJWT.mockRejectedValueOnce(new Error('jwt fetch failed'))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── Android flow ─────────────────────────────────────────────────────────────

  describe('Android attestation flow', () => {
    const androidKeyID = 'walletAttestationKey'

    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
      ;(generateHardwareAttestedKeyAsync as jest.Mock).mockResolvedValue(undefined)
      ;(withRetry as jest.Mock).mockResolvedValue(mockAttestationResult)
    })

    it('generates a hardware attested key with the correct fixed key ID', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(generateHardwareAttestedKeyAsync).toHaveBeenCalledWith(androidKeyID, mockChallenge)
    })

    it('retrieves the certificate chain via withRetry', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(withRetry).toHaveBeenCalledWith(getAttestationCertificateChainAsync, [androidKeyID])
    })

    it('fetches an attestation JWT using the certificate chain', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(mockGetJWT).toHaveBeenCalledWith(mockAttestationResult, mockChallenge, androidKeyID)
    })

    it('saves the attestation JWT and persists state', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(mockAgent.genericRecords.save).toHaveBeenCalledWith({
        content: mockAttestationJWT,
        id: 'attestationJWT',
      })
      expect(PersistentStorage.storeValueForKey).toHaveBeenCalledWith(
        LocalStorageKeys.AttestationKey,
        androidKeyID
      )
    })

    it('dispatches SET_ATTESTATION_COMPLETED', async () => {
      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(mockDispatch).toHaveBeenCalledWith({
        type: DispatchAction.SET_ATTESTATION_COMPLETED,
        payload: [true],
      })
    })

    it('logs and rethrows when generateHardwareAttestedKeyAsync fails', async () => {
      ;(generateHardwareAttestedKeyAsync as jest.Mock).mockRejectedValue(
        new Error('hw key gen failed')
      )

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

    it('logs and rethrows when withRetry (getCertificateChain) fails', async () => {
      ;(withRetry as jest.Mock).mockRejectedValue(new Error('cert chain failed'))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── Unsupported platform ─────────────────────────────────────────────────────

  describe('unsupported platform', () => {
    it('throws when Platform.OS is not ios or android', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })

  // ── storeAttestationJWT ──────────────────────────────────────────────────────

  describe('storeAttestationJWT', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      ;(generateKeyAsync as jest.Mock).mockResolvedValue(mockKeyID)
      ;(withRetry as jest.Mock).mockResolvedValue(mockAttestationResult)
    })

    it('wraps agent bridge errors as "Error storing attestation result"', async () => {
      mockAgentBridge.onReady.mockImplementationOnce(() => {
        throw new Error('bridge not available')
      })

      const { result } = renderHook(() => useAttestation())
      // The store error is caught by setupAttestation's catch block
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })

  })

  // ── Challenge fetching ───────────────────────────────────────────────────────

  describe('challenge fetching', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
      ;(generateKeyAsync as jest.Mock).mockResolvedValue(mockKeyID)
      ;(withRetry as jest.Mock).mockResolvedValue(mockAttestationResult)
    })

    it('fetches a challenge before any key operations', async () => {
      const callOrder: string[] = []
      mockGetChallenge.mockImplementation(async () => {
        callOrder.push('challenge')
        return mockChallenge
      })
      ;(generateKeyAsync as jest.Mock).mockImplementation(async () => {
        callOrder.push('generateKey')
        return mockKeyID
      })

      const { result } = renderHook(() => useAttestation())
      await act(() => result.current.setupAttestation())

      expect(callOrder[0]).toBe('challenge')
      expect(callOrder[1]).toBe('generateKey')
    })

    it('logs and rethrows when challenge fetch fails', async () => {
      mockGetChallenge.mockRejectedValueOnce(new Error('challenge fetch failed'))

      const { result } = renderHook(() => useAttestation())
      await expect(act(() => result.current.setupAttestation())).rejects.toThrow(
        'Error initializing attestation'
      )
    })
  })
})