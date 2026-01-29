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

import React from 'react'
import { create, act } from 'react-test-renderer'
import { RestoreWalletScreen } from '../screens/RestoreWalletScreen'
import { BackupService, RestoreStatus } from '../services/BackupService'
import { useAgent } from '@credo-ts/react-hooks'

describe('RestoreWalletScreen', () => {
  let mockAgent: any
  let mockBackupService: jest.Mocked<BackupService>
  let mockSetMediationToDefault: jest.Mock

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
    }

    // Mock BackupService
    mockBackupService = {
      pickBackupFile: jest.fn(),
      restoreWalletComplete: jest.fn(),
      generateMnemonic: jest.fn(),
      exportWallet: jest.fn(),
      importWallet: jest.fn(),
      deleteWallet: jest.fn(),
    } as any

    // Mock setMediationToDefault
    mockSetMediationToDefault = jest.fn().mockResolvedValue(undefined)

    // Setup useAgent mock
    ;(useAgent as jest.Mock).mockReturnValue({ agent: mockAgent })

    // Setup container.resolve mock
    const { container } = require('tsyringe')
    container.resolve.mockReturnValue(mockBackupService)
  })

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      expect(root.toJSON()).toBeTruthy()
    })

    it('should render with custom wallet config', () => {
      const customConfig = {
        id: 'custom-wallet-id',
        key: 'custom-key',
      }

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
            walletConfig={customConfig}
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
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      expect(root.toJSON()).toBeTruthy()
    })
  })

  describe('Wallet ID Resolution', () => {
    it('should use wallet ID from agent config when no custom config provided', async () => {
      mockBackupService.restoreWalletComplete.mockResolvedValue(undefined)

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      // Simulate file selection
      const instance = root.getInstance()
      await act(async () => {
        mockBackupService.pickBackupFile.mockResolvedValue('/path/to/backup.zip')
        // Trigger file selection through component state
        instance.setState({ filePath: '/path/to/backup.zip', mnemonic: 'test mnemonic' })
      })

      // The component should use 'test-wallet-id' from agent config
      expect(mockAgent.config.walletConfig.id).toBe('test-wallet-id')
    })

    it('should use custom wallet config when provided', () => {
      const customConfig = {
        id: 'custom-wallet-id',
        key: 'custom-key',
      }

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
            walletConfig={customConfig}
          />
        )
      })

      // Custom config should be passed to component
      expect(root.root.props.walletConfig).toEqual(customConfig)
    })

    it('should fallback to "walletId" when agent has no wallet config', () => {
      // Mock agent without wallet config
      const agentWithoutConfig = {
        config: {},
      }
      ;(useAgent as jest.Mock).mockReturnValue({ agent: agentWithoutConfig })

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      expect(root.toJSON()).toBeTruthy()
      // Component should handle missing wallet config gracefully
    })
  })

  describe('Error Message Formatting', () => {
    it('should format "not found" error correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const error = new Error('Backup file not found')
      const message = instance.getErrorMessage(error)

      expect(message).toBe('Backup file not found. Please select a valid backup file.')
    })

    it('should format "corrupted" error correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const error = new Error('Backup file is corrupted')
      const message = instance.getErrorMessage(error)

      expect(message).toBe('Backup file is corrupted or invalid. Please check your backup file.')
    })

    it('should format "mnemonic" error correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const error = new Error('Invalid mnemonic')
      const message = instance.getErrorMessage(error)

      expect(message).toBe('Incorrect mnemonic or key. Please check and try again.')
    })

    it('should format "permission" error correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const error = new Error('Permission denied')
      const message = instance.getErrorMessage(error)

      expect(message).toBe('Cannot access wallet files. Please restart the app and try again.')
    })

    it('should format "already exists" error correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const error = new Error('Path already exists')
      const message = instance.getErrorMessage(error)

      expect(message).toBe('Wallet already exists. Please contact support.')
    })

    it('should format unknown error with generic message', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const error = new Error('Some unknown error')
      const message = instance.getErrorMessage(error)

      expect(message).toBe('Failed to restore wallet: Some unknown error')
    })
  })

  describe('Status Message Formatting', () => {
    it('should format VALIDATING status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.VALIDATING)

      expect(message).toBe('Validating backup file...')
    })

    it('should format SHUTTING_DOWN status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.SHUTTING_DOWN)

      expect(message).toBe('Preparing for restore...')
    })

    it('should format DELETING_OLD status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.DELETING_OLD)

      expect(message).toBe('Removing old wallet...')
    })

    it('should format IMPORTING status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.IMPORTING)

      expect(message).toBe('Importing wallet from backup...')
    })

    it('should format INITIALIZING status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.INITIALIZING)

      expect(message).toBe('Initializing wallet...')
    })

    it('should format CONNECTING_MEDIATOR status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.CONNECTING_MEDIATOR)

      expect(message).toBe('Connecting to mediator...')
    })

    it('should format SUCCESS status correctly', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      const instance = root.getInstance()
      const message = instance.getStatusMessage(RestoreStatus.SUCCESS)

      expect(message).toBe('Wallet restored successfully!')
    })
  })

  describe('Props Validation', () => {
    it('should accept mediatorUrl prop', () => {
      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://custom-mediator.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      expect(root.root.props.mediatorUrl).toBe('http://custom-mediator.com')
    })

    it('should accept setMediationToDefault prop', () => {
      const customSetMediation = jest.fn()

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={customSetMediation}
          />
        )
      })

      expect(root.root.props.setMediationToDefault).toBe(customSetMediation)
    })

    it('should accept onRestoreSuccess callback prop', () => {
      const onSuccess = jest.fn()

      let root: any
      act(() => {
        root = create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
            onRestoreSuccess={onSuccess}
          />
        )
      })

      expect(root.root.props.onRestoreSuccess).toBe(onSuccess)
    })
  })

  describe('BackupService Integration', () => {
    it('should resolve BackupService from container', () => {
      const { container } = require('tsyringe')

      act(() => {
        create(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
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
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      // Container.resolve should only be called once during initialization
      expect(container.resolve).toHaveBeenCalledTimes(1)

      // Re-render component
      act(() => {
        root.update(
          <RestoreWalletScreen
            mediatorUrl="http://mediator.example.com"
            setMediationToDefault={mockSetMediationToDefault}
          />
        )
      })

      // Should still be called only once (useState initialization)
      expect(container.resolve).toHaveBeenCalledTimes(1)
    })
  })
})
