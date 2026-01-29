/**
 * Unit tests for BackupService
 * 
 * Tests backup and restore functionality with mnemonic encryption
 */

import { Agent, WalletConfig } from '@credo-ts/core'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import DocumentPicker from 'react-native-document-picker'
import { zip, unzip } from 'react-native-zip-archive'
import { BackupService, BackupError, RestoreStatus } from '../BackupService'
import * as MnemonicStorage from '../../../../core/src/services/MnemonicStorage'
import * as KeyDerivation from '../../../../core/src/services/KeyDerivation'

// Mock dependencies
jest.mock('react-native-fs')
jest.mock('react-native-share')
jest.mock('react-native-document-picker')
jest.mock('react-native-zip-archive')
jest.mock('../../../../core/src/services/MnemonicStorage')
jest.mock('../../../../core/src/services/KeyDerivation')
jest.mock('../../../../core/src/utils/mediatorhelpers', () => ({
  setMediationToDefault: jest.fn().mockResolvedValue(undefined),
}))

describe('BackupService', () => {
  let backupService: BackupService
  let mockAgent: jest.Mocked<Agent>
  
  // Test data
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const testPin = '123456'
  const wrongPin = '654321'
  const testWalletKey = 'a'.repeat(64) // 64 hex characters
  const testWalletId = 'test-wallet-id'
  
  const mockEncryptedMnemonic: MnemonicStorage.EncryptedMnemonic = {
    ciphertext: 'encrypted-data',
    iv: 'iv-data',
    authTag: 'auth-tag',
    salt: 'salt-data',
    algorithm: 'aes-256-gcm',
    iterations: 100000,
  }

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()
    
    // Create service instance
    backupService = new BackupService()
    
    // Create mock agent
    mockAgent = {
      wallet: {
        export: jest.fn().mockResolvedValue(undefined),
        import: jest.fn().mockResolvedValue(undefined),
        open: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined),
        isInitialized: true,
      },
      isInitialized: false,
      initialize: jest.fn().mockResolvedValue(undefined),
    } as any
    
    // Setup default mocks
    ;(RNFS.exists as jest.Mock).mockResolvedValue(false)
    ;(RNFS.mkdir as jest.Mock).mockResolvedValue(undefined)
    ;(RNFS.unlink as jest.Mock).mockResolvedValue(undefined)
    ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 1024 })
    ;(RNFS.readDir as jest.Mock).mockResolvedValue([
      { name: 'sqlite.db', path: '/path/to/sqlite.db' },
    ])
    ;(zip as jest.Mock).mockResolvedValue(undefined)
    ;(unzip as jest.Mock).mockResolvedValue(undefined)
    ;(Share.open as jest.Mock).mockResolvedValue(undefined)
    
    // Setup MnemonicStorage mocks
    ;(MnemonicStorage.loadMnemonicFromKeychain as jest.Mock).mockResolvedValue(mockEncryptedMnemonic)
    ;(MnemonicStorage.decryptMnemonic as jest.Mock).mockResolvedValue(testMnemonic)
    
    // Setup KeyDerivation mocks
    ;(KeyDerivation.isValidMnemonic as jest.Mock).mockReturnValue(true)
    ;(KeyDerivation.deriveWalletKeyFromMnemonic as jest.Mock).mockReturnValue(testWalletKey)
  })

  describe('exportWalletWithMnemonic', () => {
    it('should export wallet with mnemonic encryption', async () => {
      const mnemonic = await backupService.exportWalletWithMnemonic(mockAgent, testPin)

      // Should return mnemonic
      expect(mnemonic).toBe(testMnemonic)

      // Should load mnemonic from keychain
      expect(MnemonicStorage.loadMnemonicFromKeychain).toHaveBeenCalled()

      // Should decrypt with PIN
      expect(MnemonicStorage.decryptMnemonic).toHaveBeenCalledWith(mockEncryptedMnemonic, testPin)

      // Should validate mnemonic
      expect(KeyDerivation.isValidMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should export wallet with mnemonic as key
      expect(mockAgent.wallet.export).toHaveBeenCalledWith(
        expect.objectContaining({
          key: testMnemonic,
        })
      )

      // Should create zip file
      expect(zip).toHaveBeenCalled()

      // Should share backup file
      expect(Share.open).toHaveBeenCalled()
    })

    it('should verify backup by default', async () => {
      await backupService.exportWalletWithMnemonic(mockAgent, testPin)

      // Should unzip for verification
      expect(unzip).toHaveBeenCalled()

      // Should read directory to check for db file
      expect(RNFS.readDir).toHaveBeenCalled()
    })

    it('should skip verification if requested', async () => {
      await backupService.exportWalletWithMnemonic(mockAgent, testPin, 'backup.zip', false)

      // Should not unzip for verification
      expect(unzip).not.toHaveBeenCalled()
    })

    it('should throw BackupError if no mnemonic in keychain', async () => {
      ;(MnemonicStorage.loadMnemonicFromKeychain as jest.Mock).mockResolvedValue(undefined)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toMatchObject({
        code: 'MNEMONIC_NOT_FOUND',
      })
    })

    it('should throw BackupError with INCORRECT_PIN for wrong PIN', async () => {
      ;(MnemonicStorage.decryptMnemonic as jest.Mock).mockRejectedValue(
        new Error('Incorrect PIN')
      )

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, wrongPin)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, wrongPin)
      ).rejects.toMatchObject({
        code: 'INCORRECT_PIN',
      })
    })

    it('should throw BackupError if mnemonic is invalid', async () => {
      ;(KeyDerivation.isValidMnemonic as jest.Mock).mockReturnValue(false)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toMatchObject({
        code: 'INVALID_MNEMONIC',
      })
    })

    it('should throw BackupError if wallet export fails', async () => {
      (mockAgent.wallet.export as jest.Mock).mockRejectedValue(new Error('Export failed'))

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toMatchObject({
        code: 'EXPORT_FAILED',
      })
    })

    it('should throw BackupError if zip creation fails', async () => {
      ;(zip as jest.Mock).mockRejectedValue(new Error('Zip failed'))

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toMatchObject({
        code: 'ZIP_FAILED',
      })
    })

    it('should throw BackupError if verification fails', async () => {
      // Mock verification failure (no db file found)
      ;(RNFS.readDir as jest.Mock).mockResolvedValue([
        { name: 'other-file.txt', path: '/path/to/other-file.txt' },
      ])

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toMatchObject({
        code: 'VERIFICATION_FAILED',
      })
    })

    it('should cleanup temporary files on success', async () => {
      await backupService.exportWalletWithMnemonic(mockAgent, testPin)

      // Should cleanup backup directory and zip file
      expect(RNFS.unlink).toHaveBeenCalled()
    })

    it('should cleanup temporary files on error', async () => {
      (mockAgent.wallet.export as jest.Mock).mockRejectedValue(new Error('Export failed'))

      await expect(
        backupService.exportWalletWithMnemonic(mockAgent, testPin)
      ).rejects.toThrow()

      // Should still cleanup
      expect(RNFS.unlink).toHaveBeenCalled()
    })

    it('should not fail if share is cancelled', async () => {
      ;(Share.open as jest.Mock).mockRejectedValue(new Error('User cancelled'))

      // Should not throw
      const mnemonic = await backupService.exportWalletWithMnemonic(mockAgent, testPin)
      expect(mnemonic).toBe(testMnemonic)
    })
  })

  describe('restoreWalletComplete', () => {
    const testWalletConfig: WalletConfig = {
      id: testWalletId,
      key: testWalletKey,
    }
    const testBackupPath = '/path/to/backup.zip'
    const testMediatorUrl = 'https://mediator.example.com'

    beforeEach(() => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(true)
    })

    it('should restore wallet with mnemonic-derived key', async () => {
      const onProgress = jest.fn()

      await backupService.restoreWalletComplete(
        mockAgent,
        testBackupPath,
        testMnemonic,
        testWalletConfig,
        testMediatorUrl,
        onProgress
      )

      // Should validate mnemonic
      expect(KeyDerivation.isValidMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should derive wallet key from mnemonic
      expect(KeyDerivation.deriveWalletKeyFromMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should call progress callbacks
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.VALIDATING)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SHUTTING_DOWN)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.DELETING_OLD)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.IMPORTING)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.INITIALIZING)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.CONNECTING_MEDIATOR)
      expect(onProgress).toHaveBeenCalledWith(RestoreStatus.SUCCESS)

      // Should close wallet
      expect(mockAgent.wallet.close).toHaveBeenCalled()

      // Should import wallet with mnemonic as key
      expect(mockAgent.wallet.import).toHaveBeenCalledWith(
        expect.objectContaining({
          id: testWalletId,
          key: testWalletKey,
        }),
        expect.objectContaining({
          key: testMnemonic,
        })
      )

      // Should open wallet with derived key
      expect(mockAgent.wallet.open).toHaveBeenCalledWith({
        id: testWalletId,
        key: testWalletKey,
      })
    })

    it('should throw error for invalid mnemonic', async () => {
      ;(KeyDerivation.isValidMnemonic as jest.Mock).mockReturnValue(false)

      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testBackupPath,
          'invalid mnemonic',
          testWalletConfig,
          testMediatorUrl
        )
      ).rejects.toThrow('Invalid mnemonic')
    })

    it('should validate backup file before restore', async () => {
      await backupService.restoreWalletComplete(
        mockAgent,
        testBackupPath,
        testMnemonic,
        testWalletConfig,
        testMediatorUrl
      )

      // Should check file exists
      expect(RNFS.exists).toHaveBeenCalled()

      // Should check file size
      expect(RNFS.stat).toHaveBeenCalled()
    })

    it('should throw BackupError if backup file not found', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(false)

      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testBackupPath,
          testMnemonic,
          testWalletConfig,
          testMediatorUrl
        )
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testBackupPath,
          testMnemonic,
          testWalletConfig,
          testMediatorUrl
        )
      ).rejects.toMatchObject({
        code: 'BACKUP_NOT_FOUND',
      })
    })

    it('should throw BackupError if backup file is empty', async () => {
      ;(RNFS.stat as jest.Mock).mockResolvedValue({ size: 0 })

      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testBackupPath,
          testMnemonic,
          testWalletConfig,
          testMediatorUrl
        )
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.restoreWalletComplete(
          mockAgent,
          testBackupPath,
          testMnemonic,
          testWalletConfig,
          testMediatorUrl
        )
      ).rejects.toMatchObject({
        code: 'BACKUP_CORRUPTED',
      })
    })

    it('should delete old wallet before restore', async () => {
      await backupService.restoreWalletComplete(
        mockAgent,
        testBackupPath,
        testMnemonic,
        testWalletConfig,
        testMediatorUrl
      )

      // Should delete wallet directory
      expect(RNFS.unlink).toHaveBeenCalled()
    })

    it('should handle wallet already closed', async () => {
      mockAgent.wallet.isInitialized = false

      // Should not throw
      await backupService.restoreWalletComplete(
        mockAgent,
        testBackupPath,
        testMnemonic,
        testWalletConfig,
        testMediatorUrl
      )

      // Should still complete restore
      expect(mockAgent.wallet.import).toHaveBeenCalled()
    })

    it('should initialize agent if not initialized', async () => {
      mockAgent.isInitialized = false

      await backupService.restoreWalletComplete(
        mockAgent,
        testBackupPath,
        testMnemonic,
        testWalletConfig,
        testMediatorUrl
      )

      // Should initialize agent
      expect(mockAgent.initialize).toHaveBeenCalled()
    })

    it('should not fail if mediator connection fails', async () => {
      const { setMediationToDefault } = require('../../../../core/src/utils/mediatorhelpers')
      setMediationToDefault.mockRejectedValue(new Error('Mediator error'))

      // Should not throw
      await backupService.restoreWalletComplete(
        mockAgent,
        testBackupPath,
        testMnemonic,
        testWalletConfig,
        testMediatorUrl
      )

      // Should still complete restore
      expect(mockAgent.wallet.open).toHaveBeenCalled()
    })
  })

  describe('importWallet', () => {
    const testWalletConfig: WalletConfig = {
      id: testWalletId,
      key: testWalletKey,
    }
    const testBackupPath = '/path/to/backup.zip'

    it('should import wallet from zip file', async () => {
      await backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)

      // Should unzip file
      expect(unzip).toHaveBeenCalled()

      // Should find db file
      expect(RNFS.readDir).toHaveBeenCalled()

      // Should import wallet
      expect(mockAgent.wallet.import).toHaveBeenCalledWith(
        testWalletConfig,
        expect.objectContaining({
          key: testMnemonic,
        })
      )
    })

    it('should import wallet from direct db file', async () => {
      const dbPath = '/path/to/sqlite.db'

      await backupService.importWallet(mockAgent, dbPath, testMnemonic, testWalletConfig)

      // Should not unzip
      expect(unzip).not.toHaveBeenCalled()

      // Should import directly
      expect(mockAgent.wallet.import).toHaveBeenCalled()
    })

    it('should throw BackupError if no db file in zip', async () => {
      ;(RNFS.readDir as jest.Mock).mockResolvedValue([
        { name: 'other-file.txt', path: '/path/to/other-file.txt' },
      ])

      await expect(
        backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)
      ).rejects.toMatchObject({
        code: 'BACKUP_CORRUPTED',
      })
    })

    it('should throw BackupError if unzip fails', async () => {
      ;(unzip as jest.Mock).mockRejectedValue(new Error('Unzip failed'))

      await expect(
        backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)
      ).rejects.toMatchObject({
        code: 'BACKUP_CORRUPTED',
      })
    })

    it('should throw BackupError with DECRYPTION_FAILED for wrong mnemonic', async () => {
      (mockAgent.wallet.import as jest.Mock).mockRejectedValue(new Error('Failed to decrypt'))

      await expect(
        backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)
      ).rejects.toMatchObject({
        code: 'DECRYPTION_FAILED',
      })
    })

    it('should cleanup temporary files', async () => {
      await backupService.importWallet(mockAgent, testBackupPath, testMnemonic, testWalletConfig)

      // Should cleanup unzip directory
      expect(RNFS.unlink).toHaveBeenCalled()
    })
  })

  describe('deleteWallet', () => {
    it('should delete wallet directory', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(true)

      await backupService.deleteWallet(testWalletId)

      // Should check if directory exists
      expect(RNFS.exists).toHaveBeenCalled()

      // Should delete directory
      expect(RNFS.unlink).toHaveBeenCalled()
    })

    it('should not fail if wallet does not exist', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(false)

      // Should not throw
      await backupService.deleteWallet(testWalletId)

      // Should not try to delete
      expect(RNFS.unlink).not.toHaveBeenCalled()
    })

    it('should throw BackupError if deletion fails', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.unlink as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      await expect(
        backupService.deleteWallet(testWalletId)
      ).rejects.toThrow(BackupError)

      await expect(
        backupService.deleteWallet(testWalletId)
      ).rejects.toMatchObject({
        code: 'WALLET_DELETE_FAILED',
      })
    })
  })

  describe('pickBackupFile', () => {
    it('should pick backup file using document picker', async () => {
      const mockResult = {
        fileCopyUri: '/path/to/backup.zip',
        uri: 'content://backup.zip',
        name: 'backup.zip',
        type: 'application/zip',
      }
      ;(DocumentPicker.pickSingle as jest.Mock).mockResolvedValue(mockResult)

      const result = await backupService.pickBackupFile()

      expect(result).toBe(mockResult.fileCopyUri)
      expect(DocumentPicker.pickSingle).toHaveBeenCalled()
    })

    it('should return null if user cancels', async () => {
      ;(DocumentPicker.pickSingle as jest.Mock).mockRejectedValue(
        DocumentPicker.isCancel(new Error('Cancelled'))
      )
      ;(DocumentPicker.isCancel as jest.Mock).mockReturnValue(true)

      const result = await backupService.pickBackupFile()

      expect(result).toBeNull()
    })

    it('should throw error if picker fails', async () => {
      ;(DocumentPicker.pickSingle as jest.Mock).mockRejectedValue(new Error('Picker error'))
      ;(DocumentPicker.isCancel as jest.Mock).mockReturnValue(false)

      await expect(backupService.pickBackupFile()).rejects.toThrow('Picker error')
    })
  })

  describe('generateMnemonic', () => {
    it('should generate a valid mnemonic', () => {
      const mnemonic = backupService.generateMnemonic()

      expect(typeof mnemonic).toBe('string')
      expect(mnemonic.split(' ')).toHaveLength(12)
    })

    it('should generate different mnemonics', () => {
      const mnemonic1 = backupService.generateMnemonic()
      const mnemonic2 = backupService.generateMnemonic()

      expect(mnemonic1).not.toBe(mnemonic2)
    })
  })

  describe('BackupError', () => {
    it('should create error with code', () => {
      const error = new BackupError('Test error', 'MNEMONIC_NOT_FOUND')

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('MNEMONIC_NOT_FOUND')
      expect(error.name).toBe('BackupError')
    })

    it('should support all error codes', () => {
      const codes: Array<BackupError['code']> = [
        'MNEMONIC_NOT_FOUND',
        'INCORRECT_PIN',
        'DECRYPTION_FAILED',
        'INVALID_MNEMONIC',
        'FILESYSTEM_ERROR',
        'EXPORT_FAILED',
        'ZIP_FAILED',
        'VERIFICATION_FAILED',
        'SHARE_FAILED',
        'BACKUP_NOT_FOUND',
        'BACKUP_CORRUPTED',
        'IMPORT_FAILED',
        'WALLET_DELETE_FAILED',
      ]

      codes.forEach(code => {
        const error = new BackupError('Test', code)
        expect(error.code).toBe(code)
      })
    })
  })
})
