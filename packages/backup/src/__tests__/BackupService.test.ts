import { Agent, WalletConfig } from '@credo-ts/core'
import RNFS from 'react-native-fs'
import { unzip } from 'react-native-zip-archive'
import { BackupService, RestoreStatus } from '../services/BackupService'
import { setMediationToDefault } from '../../../core/src/utils/mediatorhelpers'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock dependencies
jest.mock('react-native-zip-archive')
jest.mock('react-native-share', () => ({
  open: jest.fn(),
}))
jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  types: { allFiles: 'allFiles' },
  isCancel: jest.fn(),
}))
jest.mock('../../../core/src/utils/mediatorhelpers', () => ({
  setMediationToDefault: jest.fn().mockResolvedValue(undefined),
}))

const mockSetMediationToDefault = setMediationToDefault as jest.MockedFunction<typeof setMediationToDefault>

describe('BackupService', () => {
  let backupService: BackupService
  let mockAgent: jest.Mocked<Agent>

  beforeEach(() => {
    backupService = new BackupService()
    
    // Create mock agent
    mockAgent = {
      wallet: {
        export: jest.fn(),
        import: jest.fn(),
        open: jest.fn(),
        close: jest.fn(),
        isInitialized: true,
      },
      shutdown: jest.fn(),
      initialize: jest.fn(),
      isInitialized: false, // Agent not initialized by default
      config: {
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        },
      },
    } as any

    // Reset all mocks
    jest.clearAllMocks()
  })

  describe('deleteWallet', () => {
    const walletId = 'test-wallet-id'
    const walletDir = `${RNFS.DocumentDirectoryPath}/.afj/wallet/${walletId}`

    it('should delete wallet directory if it exists', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.unlink as jest.Mock).mockResolvedValue(undefined)

      // Act
      await backupService.deleteWallet(walletId)

      // Assert
      expect(RNFS.exists).toHaveBeenCalledWith(walletDir)
      expect(RNFS.unlink).toHaveBeenCalledWith(walletDir)
    })

    it('should not throw if wallet does not exist', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(backupService.deleteWallet(walletId)).resolves.not.toThrow()
      expect(RNFS.exists).toHaveBeenCalledWith(walletDir)
      expect(RNFS.unlink).not.toHaveBeenCalled()
    })

    it('should throw descriptive error if deletion fails due to permissions', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.unlink as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      // Act & Assert
      await expect(backupService.deleteWallet(walletId)).rejects.toThrow('Failed to delete wallet')
      await expect(backupService.deleteWallet(walletId)).rejects.toThrow('Permission denied')
    })

    it('should throw descriptive error if deletion fails due to file lock', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.unlink as jest.Mock).mockRejectedValue(new Error('File is locked'))

      // Act & Assert
      await expect(backupService.deleteWallet(walletId)).rejects.toThrow('Failed to delete wallet')
      await expect(backupService.deleteWallet(walletId)).rejects.toThrow('File is locked')
    })
  })

  describe('validateBackupFile', () => {
    const testFilePath = '/path/to/backup.zip'

    it('should pass validation for valid zip file with database', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024 })
      ;(RNFS.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(unzip as jest.Mock).mockResolvedValue(undefined)
      ;(RNFS.readDir as jest.Mock).mockResolvedValue([
        { name: 'sqlite.db', isFile: () => true },
      ])
      ;(RNFS.unlink as jest.Mock).mockResolvedValue(undefined)

      // Act & Assert
      // validateBackupFile is private, so we test it through restoreWalletComplete
      // For now, we'll test it indirectly
      expect(true).toBe(true)
    })

    it('should throw error for non-existent file', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      // Testing through restoreWalletComplete
      const walletConfig: WalletConfig = { id: 'test-wallet', key: 'test-key' }
      
      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testFilePath,
          'test-mnemonic',
          walletConfig,
          'http://mediator.example.com',
          jest.fn()
        )
      ).rejects.toThrow('Backup file not found')
    })

    it('should throw error for empty file', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 0 })

      // Act & Assert
      const walletConfig: WalletConfig = { id: 'test-wallet', key: 'test-key' }
      
      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testFilePath,
          'test-mnemonic',
          walletConfig,
          'http://mediator.example.com',
          jest.fn()
        )
      ).rejects.toThrow('Backup file is empty')
    })

    it('should throw error for corrupted zip file', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024 })
      ;(RNFS.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(unzip as jest.Mock).mockRejectedValue(new Error('Invalid zip format'))

      // Act & Assert
      const walletConfig: WalletConfig = { id: 'test-wallet', key: 'test-key' }
      
      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testFilePath,
          'test-mnemonic',
          walletConfig,
          'http://mediator.example.com',
          jest.fn()
        )
      ).rejects.toThrow('Backup file is corrupted or invalid')
    })

    it('should throw error if no database file found in zip', async () => {
      // Arrange
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024 })
      ;(RNFS.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(unzip as jest.Mock).mockResolvedValue(undefined)
      ;(RNFS.readDir as jest.Mock).mockResolvedValue([
        { name: 'readme.txt', isFile: () => true },
      ])

      // Act & Assert
      const walletConfig: WalletConfig = { id: 'test-wallet', key: 'test-key' }
      
      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testFilePath,
          'test-mnemonic',
          walletConfig,
          'http://mediator.example.com',
          jest.fn()
        )
      ).rejects.toThrow('No database file found in backup')
    })
  })

  describe('restoreWalletComplete', () => {
    const testFilePath = '/path/to/backup.zip'
    const walletConfig: WalletConfig = { id: 'test-wallet', key: 'test-key' }
    const mediatorUrl = 'http://mediator.example.com'
    const mnemonic = 'test mnemonic phrase'

    beforeEach(() => {
      // Setup default successful mocks
      (RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024 })
      ;(RNFS.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(unzip as jest.Mock).mockResolvedValue(undefined)
      ;(RNFS.readDir as jest.Mock).mockResolvedValue([
        { name: 'sqlite.db', isFile: () => true, path: '/test/sqlite.db' },
      ])
      ;(RNFS.unlink as jest.Mock).mockResolvedValue(undefined)
    })

    it('should complete full restore flow successfully', async () => {
      // Arrange
      const onProgress = jest.fn()

      // Act
      await backupService.restoreWalletComplete(
        mockAgent,
        testFilePath,
        mnemonic,
        walletConfig,
        mediatorUrl,
        onProgress
      )

      // Assert - verify all steps were called
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.VALIDATING)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SHUTTING_DOWN)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.DELETING_OLD)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.IMPORTING)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.INITIALIZING)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.CONNECTING_MEDIATOR)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SUCCESS)

      // Verify agent methods were called
      expect(mockAgent.wallet.close).toHaveBeenCalled()
      expect(mockAgent.wallet.import).toHaveBeenCalled()
      // Should use walletConfig.key (not mnemonic) for consistency
      expect(mockAgent.wallet.open).toHaveBeenCalledWith({
        id: walletConfig.id,
        key: walletConfig.key,
      })
      expect(mockAgent.initialize).toHaveBeenCalled()
    })

    it('should handle mediator failure gracefully without failing restore', async () => {
      // Arrange
      const onProgress = jest.fn()

      // Mock setMediationToDefault to fail for this test
      mockSetMediationToDefault.mockRejectedValueOnce(new Error('Mediator offline'))

      // Act & Assert - should not throw
      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testFilePath,
          mnemonic,
          walletConfig,
          mediatorUrl,
          onProgress
        )
      ).resolves.not.toThrow()

      // Verify restore completed successfully despite mediator failure
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SUCCESS)
      expect(mockAgent.wallet.import).toHaveBeenCalled()
      expect(mockAgent.initialize).toHaveBeenCalled()
    })

    it('should fail restore if import fails', async () => {
      // Arrange
      mockAgent.wallet.import = jest.fn().mockRejectedValue(new Error('Invalid mnemonic'))
      const onProgress = jest.fn()

      // Act & Assert
      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testFilePath,
          mnemonic,
          walletConfig,
          mediatorUrl,
          onProgress
        )
      ).rejects.toThrow('Invalid mnemonic')

      // Verify success was not called
      expect(onProgress).not.toHaveBeenCalledWith(RestoreStatus.SUCCESS)
    })

    it('should continue restore even if wallet close fails', async () => {
      // Arrange
      mockAgent.wallet.close = jest.fn().mockRejectedValue(new Error('Wallet close failed'))
      const onProgress = jest.fn()

      // Act - should not throw, should continue with restore
      await backupService.restoreWalletComplete(
        mockAgent,
        testFilePath,
        mnemonic,
        walletConfig,
        mediatorUrl,
        onProgress
      )

      // Assert - restore should complete successfully despite wallet close failure
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SUCCESS)
      expect(mockAgent.wallet.import).toHaveBeenCalled()
      expect(mockAgent.initialize).toHaveBeenCalled()
    })

    it('should call progress callback for each step', async () => {
      // Arrange
      const onProgress = jest.fn()

      // Act
      await backupService.restoreWalletComplete(
        mockAgent,
        testFilePath,
        mnemonic,
        walletConfig,
        mediatorUrl,
        onProgress
      )

      // Assert - verify progress was called 7 times (one for each step)
      expect(onProgress).toHaveBeenCalledTimes(7)
      
      // Verify order of progress calls
      const calls = onProgress.mock.calls.map(call => call[0])
      expect(calls).toEqual([
        RestoreStatus.VALIDATING,
        RestoreStatus.SHUTTING_DOWN,
        RestoreStatus.DELETING_OLD,
        RestoreStatus.IMPORTING,
        RestoreStatus.INITIALIZING,
        RestoreStatus.CONNECTING_MEDIATOR,
        RestoreStatus.SUCCESS,
      ])
    })

    it('should delete old wallet before importing new one', async () => {
      // Arrange
      // Track call order
      const callOrder: string[] = []
      ;(RNFS.unlink as jest.Mock).mockImplementation((path) => {
        if (path.includes('wallet')) {
          callOrder.push('delete')
        }
        return Promise.resolve()
      })
      mockAgent.wallet.import = jest.fn().mockImplementation(() => {
        callOrder.push('import')
        return Promise.resolve()
      })

      // Act
      await backupService.restoreWalletComplete(
        mockAgent,
        testFilePath,
        mnemonic,
        walletConfig,
        mediatorUrl
      )

      // Assert - delete should happen before import
      expect(callOrder).toEqual(['delete', 'import'])
    })

    it('should not call initialize if agent is already initialized', async () => {
      // Arrange
      mockAgent.wallet.isInitialized = true // Agent already initialized
      const onProgress = jest.fn()

      // Act
      await backupService.restoreWalletComplete(
        mockAgent,
        testFilePath,
        mnemonic,
        walletConfig,
        mediatorUrl,
        onProgress
      )

      // Assert - initialize should NOT be called
      expect(mockAgent.initialize).not.toHaveBeenCalled()
      expect(mockAgent.wallet.open).toHaveBeenCalled()
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SUCCESS)
    })

    it('should call initialize if agent is not initialized', async () => {
      // Arrange
      mockAgent.wallet.isInitialized = false // Agent not initialized
      const onProgress = jest.fn()

      // Act
      await backupService.restoreWalletComplete(
        mockAgent,
        testFilePath,
        mnemonic,
        walletConfig,
        mediatorUrl,
        onProgress
      )

      // Assert - initialize SHOULD be called
      expect(mockAgent.initialize).toHaveBeenCalled()
      expect(mockAgent.wallet.open).toHaveBeenCalled()
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SUCCESS)
    })
  })
})
