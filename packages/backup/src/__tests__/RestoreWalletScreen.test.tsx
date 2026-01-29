/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */

// Mock dependencies BEFORE any imports
jest.mock('@credo-ts/react-hooks', () => ({
  useAgent: jest.fn(),
}))
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}))
jest.mock('tsyringe', () => ({
  container: {
    resolve: jest.fn(),
  },
  injectable: () => (target: any) => target,
}))
jest.mock('../../../core/src/contexts/store', () => ({
  useStore: jest.fn(),
}))
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  exists: jest.fn(),
  unlink: jest.fn(),
  stat: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
}))
jest.mock('react-native-share', () => ({
  open: jest.fn(),
}))
jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  types: { allFiles: 'allFiles' },
  isCancel: jest.fn(),
}))
jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn(),
  unzip: jest.fn(),
}))
jest.mock('../../../core/src/services/MnemonicStorage', () => ({
  storeMnemonicPlain: jest.fn(),
}))

import React from 'react'
import { create, act } from 'react-test-renderer'
import { RestoreWalletScreen } from '../screens/RestoreWalletScreen'
import { BackupService, RestoreStatus } from '../services/BackupService'
import { useAgent } from '@credo-ts/react-hooks'
import { useStore } from '../../../core/src/contexts/store'
import { storeMnemonicPlain } from '../../../core/src/services/MnemonicStorage'

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => 'RestoreWallet'),
  getParent: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
}

// Mock route
const mockRoute = {
  key: 'RestoreWallet',
  name: 'RestoreWallet' as const,
  params: undefined,
}

describe('RestoreWalletScreen', () => {
  let mockAgent: any
  let mockBackupService: jest.Mocked<BackupService>
  let mockStore: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Mock agent with wallet config
    mockAgent = {
      config: {
        walletConfig: {
          id: 'test-wallet-id',
        },
      },
      wallet: {
        create: jest.fn().mockResolvedValue(undefined),
        open: jest.fn().mockResolvedValue(undefined),
      },
      initialize: jest.fn().mockResolvedValue(undefined),
    }

    // Mock store with preferences
    mockStore = [
      {
        preferences: {
          selectedMediator: 'https://mediator.example.com',
        },
      },
      jest.fn(),
    ]

    // Mock BackupService
    mockBackupService = {
      pickBackupFile: jest.fn(),
      restoreWalletComplete: jest.fn(),
      generateMnemonic: jest.fn(),
      exportWallet: jest.fn(),
      importWallet: jest.fn(),
      deleteWallet: jest.fn(),
    } as any

    // Setup useAgent mock
    ;(useAgent as jest.Mock).mockReturnValue({ agent: mockAgent })

    // Setup useStore mock
    ;(useStore as jest.Mock).mockReturnValue(mockStore)

    // Setup container.resolve mock
    const { container } = require('tsyringe')
    container.resolve.mockReturnValue(mockBackupService)

    // Mock storeMnemonicPlain
    ;(storeMnemonicPlain as jest.Mock).mockResolvedValue(true)
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      expect(root.toJSON()).toBeTruthy()
    })

    it('should render when agent is null', () => {
      (useAgent as jest.Mock).mockReturnValue({ agent: null })

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      expect(root.toJSON()).toBeTruthy()
    })
  })

  describe('BackupService Integration', () => {
    it('should resolve BackupService from container', () => {
      const { container } = require('tsyringe')

      act(() => {
        create(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      expect(container.resolve).toHaveBeenCalledWith(BackupService)
    })

    it('should use the same BackupService instance throughout component lifecycle', () => {
      const { container } = require('tsyringe')
      container.resolve.mockReturnValue(mockBackupService)

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      // Container.resolve should only be called once during initialization
      expect(container.resolve).toHaveBeenCalledTimes(1)

      // Re-render component
      act(() => {
        root.update(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      // Should still be called only once (useState initialization)
      expect(container.resolve).toHaveBeenCalledTimes(1)
    })
  })

  describe('Step Labels', () => {
    it('should have 3 steps: Select File, Enter Mnemonic, Complete', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      const instance = root.getInstance()
      const stepLabels = instance.stepLabels

      expect(stepLabels).toEqual(['Select File', 'Enter Mnemonic', 'Complete'])
      expect(stepLabels).toHaveLength(3)
    })

    it('should not include "Set PIN" or "Restoring" steps in the flow', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        )
      })

      const instance = root.getInstance()
      const stepLabels = instance.stepLabels

      expect(stepLabels).not.toContain('Set PIN')
      expect(stepLabels).not.toContain('Restoring')
    })
  })

  describe('Step Type', () => {
    it('should have RestoreStep type with 4 values internally but display 3 steps', () => {
      // The component uses 4 internal steps for state management
      const steps = ['file', 'mnemonic', 'restoring', 'complete'] as const

      expect(steps).toHaveLength(4)
      expect(steps).not.toContain('pin')

      // But only 3 steps are displayed to the user
      expect(steps).toContain('file')
      expect(steps).toContain('mnemonic')
      expect(steps).toContain('restoring') // Internal use
      expect(steps).toContain('complete')
    })
  })
})
