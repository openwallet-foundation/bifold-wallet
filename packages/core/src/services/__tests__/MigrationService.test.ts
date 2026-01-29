/**
 * Unit tests for MigrationService
 * 
 * Tests migration from old wallet format (PIN-based) to new format (mnemonic-based)
 */

import { Agent, WalletConfig } from '@credo-ts/core'
import RNFS from 'react-native-fs'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MigrationService, MigrationError, MigrationStatus, MigrationErrorType, MigrationResult } from '../MigrationService'
import * as KeyDerivation from '../KeyDerivation'
import * as MnemonicStorage from '../MnemonicStorage'
import * as keychain from '../keychain'

// Mock dependencies
jest.mock('react-native-fs')
jest.mock('@react-native-async-storage/async-storage')

// Mock KeyDerivation to avoid ecc library issues
jest.mock('../KeyDerivation', () => ({
  generateWalletMnemonic: jest.fn(),
  isValidMnemonic: jest.fn(),
  deriveMasterSeed: jest.fn(),
  deriveWalletKey: jest.fn(),
  deriveWalletKeyFromMnemonic: jest.fn(),
  generateNewWallet: jest.fn(),
}), { virtual: true })

jest.mock('../MnemonicStorage')
jest.mock('../keychain')

describe('MigrationService', () => {
  let migrationService: MigrationService
  let mockAgent: jest.Mocked<Agent>

  // Test data
  const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const testPin = '123456'
  const newPin = '654321'
  const testWalletId = 'test-wallet-id'
  const testWalletKey = 'a'.repeat(64)

  beforeEach(() => {
    jest.clearAllMocks()

    migrationService = new MigrationService()

    const mockExport = jest.fn().mockResolvedValue(undefined)
    const mockImport = jest.fn().mockResolvedValue(undefined)
    const mockCreate = jest.fn().mockResolvedValue(undefined)
    const mockOpen = jest.fn().mockResolvedValue(undefined)
    const mockClose = jest.fn().mockResolvedValue(undefined)
    const mockGetAllCredentials = jest.fn().mockResolvedValue([])
    const mockGetAllConnections = jest.fn().mockResolvedValue([])
    const mockGetCreatedDids = jest.fn().mockResolvedValue([])
    const mockInitialize = jest.fn().mockResolvedValue(undefined)

    mockAgent = {
      wallet: {
        export: mockExport as any,
        import: mockImport as any,
        create: mockCreate as any,
        open: mockOpen as any,
        close: mockClose as any,
        isInitialized: true,
      },
      credentials: {
        getAll: mockGetAllCredentials as any,
      },
      connections: {
        getAll: mockGetAllConnections as any,
      },
      dids: {
        getCreatedDids: mockGetCreatedDids as any,
      },
      config: {
        walletConfig: {
          id: testWalletId,
        },
      },
      isInitialized: false,
      initialize: mockInitialize as any,
    } as any

    // Setup default mocks
    ;(RNFS.exists as jest.Mock).mockResolvedValue(false)
    ;(RNFS.mkdir as jest.Mock).mockResolvedValue(undefined)
    ;(RNFS.unlink as jest.Mock).mockResolvedValue(undefined)
    ;(RNFS.copyFile as jest.Mock).mockResolvedValue(undefined)
    ;(RNFS.writeFile as jest.Mock).mockResolvedValue(undefined)

    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined)

    // Setup KeyDerivation mocks
    ;(KeyDerivation.generateWalletMnemonic as jest.Mock).mockReturnValue(testMnemonic)
    ;(KeyDerivation.deriveWalletKeyFromMnemonic as jest.Mock).mockReturnValue(testWalletKey)
    ;(KeyDerivation.isValidMnemonic as jest.Mock).mockReturnValue(true)

    // Setup MnemonicStorage mocks
    ;(MnemonicStorage.decryptMnemonicWithoutVerification as jest.Mock).mockResolvedValue(testMnemonic)
    ;(MnemonicStorage.loadMnemonicForBackup as jest.Mock).mockResolvedValue(testMnemonic)
    ;(MnemonicStorage.storeMnemonicPlain as jest.Mock).mockResolvedValue(true)
    ;(MnemonicStorage.encryptMnemonic as jest.Mock).mockResolvedValue({
      ciphertext: 'encrypted',
      iv: 'iv',
      authTag: 'tag',
      salt: 'salt',
      algorithm: 'aes-256-gcm',
      iterations: 100000,
    })
    ;(MnemonicStorage.storeMnemonicInKeychain as jest.Mock).mockResolvedValue(true)

    // Setup keychain mocks
    ;(keychain.loadWalletSecret as jest.Mock).mockResolvedValue({
      key: testWalletKey,
    })
    ;(keychain.deleteWalletSecret as jest.Mock).mockResolvedValue(undefined)
  })

  describe('backupOldWallet', () => {
    it('should backup old wallet with mnemonic-derived key', async () => {
      const backupPath = await migrationService.backupOldWallet(mockAgent)

      // Should return backup path
      expect(backupPath).toContain('old_wallet_backup.db')

      // Should load mnemonic from keychain (no PIN)
      expect(MnemonicStorage.decryptMnemonicWithoutVerification).toHaveBeenCalled()

      // Should derive wallet key from mnemonic
      expect(KeyDerivation.deriveWalletKeyFromMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should export wallet
      expect(mockAgent.wallet.export).toHaveBeenCalledWith(
        expect.objectContaining({
          key: testWalletKey,
        })
      )

      // Should store backup metadata
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('MigrationBackupPath'),
        expect.any(String)
      )
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('MigrationBackupTimestamp'),
        expect.any(String)
      )
    })

    it('should create backup directory', async () => {
      await migrationService.backupOldWallet(mockAgent)

      expect(RNFS.mkdir).toHaveBeenCalled()
    })

    it('should cleanup temp files after backup', async () => {
      await migrationService.backupOldWallet(mockAgent)

      expect(RNFS.unlink).toHaveBeenCalled()
    })

    it('should throw MigrationError if mnemonic not found', async () => {
      ;(MnemonicStorage.decryptMnemonicWithoutVerification as jest.Mock).mockResolvedValue(undefined)

      await expect(
        migrationService.backupOldWallet(mockAgent)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.backupOldWallet(mockAgent)
      ).rejects.toMatchObject({
        type: MigrationErrorType.BACKUP_FAILED,
      })
    })

    it('should throw MigrationError if export fails', async () => {
      (mockAgent.wallet.export as jest.Mock).mockRejectedValue(new Error('Export failed'))

      await expect(
        migrationService.backupOldWallet(mockAgent)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.backupOldWallet(mockAgent)
      ).rejects.toMatchObject({
        type: MigrationErrorType.BACKUP_FAILED,
      })
    })

    it('should throw MigrationError if directory creation fails', async () => {
      ;(RNFS.mkdir as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      await expect(
        migrationService.backupOldWallet(mockAgent)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.backupOldWallet(mockAgent)
      ).rejects.toMatchObject({
        type: MigrationErrorType.BACKUP_FAILED,
      })
    })
  })

  describe('exportOldWalletData', () => {
    it('should export wallet data', async () => {
      // Mock credentials and connections
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([
        { toJSON: () => ({ id: 'cred1' }) },
      ] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([
        { toJSON: () => ({ id: 'conn1' }) },
      ] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([
        { did: 'did:example:123', method: 'key' },
      ] as any)

      const data = await migrationService.exportOldWalletData(mockAgent)

      // Should export credentials
      expect(mockAgent.credentials.getAll).toHaveBeenCalled()

      // Should export connections
      expect(mockAgent.connections.getAll).toHaveBeenCalled()

      // Should export DIDs
      expect(mockAgent.dids.getCreatedDids).toHaveBeenCalled()

      // Should return structured data
      expect(data).toHaveProperty('credentials')
      expect(data).toHaveProperty('connections')
      expect(data).toHaveProperty('dids')
      expect(data).toHaveProperty('metadata')

      expect(data.credentials).toHaveLength(1)
      expect(data.connections).toHaveLength(1)
      expect(data.dids).toHaveLength(1)

      // Should have metadata
      expect(data.metadata.exportedAt).toBeDefined()
      expect(data.metadata.walletId).toBe(testWalletId)
    })

    it('should store export data temporarily', async () => {
      await migrationService.exportOldWalletData(mockAgent)

      expect(RNFS.mkdir).toHaveBeenCalled()
      expect(RNFS.writeFile).toHaveBeenCalled()
    })

    it('should throw MigrationError if export fails', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockRejectedValue(new Error('Export failed'))

      await expect(
        migrationService.exportOldWalletData(mockAgent)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.exportOldWalletData(mockAgent)
      ).rejects.toMatchObject({
        type: MigrationErrorType.EXPORT_FAILED,
      })
    })
  })

  describe('createNewWallet', () => {
    it('should create new wallet with mnemonic-derived key', async () => {
      const config = await migrationService.createNewWallet(
        mockAgent,
        testMnemonic,
        testWalletId
      )

      // Should validate mnemonic
      expect(KeyDerivation.isValidMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should derive wallet key
      expect(KeyDerivation.deriveWalletKeyFromMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should close old wallet
      expect(mockAgent.wallet.close).toHaveBeenCalled()

      // Should delete old wallet files
      expect(RNFS.unlink).toHaveBeenCalled()

      // Should create new wallet
      expect(mockAgent.wallet.create).toHaveBeenCalledWith({
        id: testWalletId,
        key: testWalletKey,
      })

      // Should open new wallet
      expect(mockAgent.wallet.open).toHaveBeenCalledWith({
        id: testWalletId,
        key: testWalletKey,
      })

      // Should return config
      expect(config).toEqual({
        id: testWalletId,
        key: testWalletKey,
      })
    })

    it('should throw MigrationError for invalid mnemonic', async () => {
      ;(KeyDerivation.isValidMnemonic as jest.Mock).mockReturnValue(false)

      await expect(
        migrationService.createNewWallet(mockAgent, 'invalid', testWalletId)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.createNewWallet(mockAgent, 'invalid', testWalletId)
      ).rejects.toMatchObject({
        type: MigrationErrorType.WALLET_CREATION_FAILED,
      })
    })

    it('should handle wallet that does not exist', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(false)

      await migrationService.createNewWallet(mockAgent, testMnemonic, testWalletId)

      // Should not try to delete
      expect(RNFS.unlink).not.toHaveBeenCalled()
    })

    it('should throw MigrationError if wallet creation fails', async () => {
      (mockAgent.wallet.create as jest.Mock).mockRejectedValue(new Error('Create failed'))

      await expect(
        migrationService.createNewWallet(mockAgent, testMnemonic, testWalletId)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.createNewWallet(mockAgent, testMnemonic, testWalletId)
      ).rejects.toMatchObject({
        type: MigrationErrorType.WALLET_CREATION_FAILED,
      })
    })
  })

  describe('importWalletData', () => {
    it('should import wallet data', async () => {
      const data = {
        credentials: [{ id: 'cred1' }],
        connections: [{ id: 'conn1' }],
        dids: [{ did: 'did:example:123', method: 'key' }],
        metadata: {
          exportedAt: Date.now(),
          walletId: testWalletId,
          version: '1.0.0',
        },
      }

      await migrationService.importWalletData(mockAgent, data)

      // Should store import metadata
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })

    it('should throw MigrationError if import fails', async () => {
      const data = {
        credentials: [],
        connections: [],
        dids: [],
        metadata: {
          exportedAt: Date.now(),
          walletId: testWalletId,
          version: '1.0.0',
        },
      }

      ;(AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'))

      await expect(
        migrationService.importWalletData(mockAgent, data)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.importWalletData(mockAgent, data)
      ).rejects.toMatchObject({
        type: MigrationErrorType.IMPORT_FAILED,
      })
    })
  })

  describe('updateKeychain', () => {
    it('should update keychain with plain text mnemonic', async () => {
      await migrationService.updateKeychain(testMnemonic, false)

      // Should store mnemonic in plain text (no PIN encryption)
      expect(MnemonicStorage.storeMnemonicPlain).toHaveBeenCalledWith(testMnemonic)

      // Should delete old wallet secret
      expect(keychain.deleteWalletSecret).toHaveBeenCalled()
    })

    it('should support biometrics flag', async () => {
      await migrationService.updateKeychain(testMnemonic, true)

      expect(MnemonicStorage.storeMnemonicPlain).toHaveBeenCalledWith(testMnemonic)
    })

    it('should throw MigrationError if storing fails', async () => {
      ;(MnemonicStorage.storeMnemonicPlain as jest.Mock).mockRejectedValue(new Error('Storage failed'))

      await expect(
        migrationService.updateKeychain(testMnemonic)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.updateKeychain(testMnemonic)
      ).rejects.toMatchObject({
        type: MigrationErrorType.KEYCHAIN_UPDATE_FAILED,
      })
    })

    it('should throw MigrationError if keychain update fails', async () => {
      ;(keychain.deleteWalletSecret as jest.Mock).mockRejectedValue(new Error('Keychain error'))

      await expect(
        migrationService.updateKeychain(testMnemonic)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.updateKeychain(testMnemonic)
      ).rejects.toMatchObject({
        type: MigrationErrorType.KEYCHAIN_UPDATE_FAILED,
      })
    })
  })

  describe('verifyMigration', () => {
    it('should verify migration success', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([
        { id: 'cred1' },
      ] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([
        { id: 'conn1' },
      ] as any)

      await migrationService.verifyMigration(mockAgent, testMnemonic)

      // Should validate mnemonic
      expect(KeyDerivation.isValidMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should derive wallet key
      expect(KeyDerivation.deriveWalletKeyFromMnemonic).toHaveBeenCalledWith(testMnemonic)

      // Should close and reopen wallet
      expect(mockAgent.wallet.close).toHaveBeenCalled()
      expect(mockAgent.wallet.open).toHaveBeenCalledWith({
        id: testWalletId,
        key: testWalletKey,
      })

      // Should initialize agent
      expect(mockAgent.initialize).toHaveBeenCalled()

      // Should verify data accessibility
      expect(mockAgent.credentials.getAll).toHaveBeenCalled()
      expect(mockAgent.connections.getAll).toHaveBeenCalled()
    })

    it('should throw MigrationError for invalid mnemonic', async () => {
      ;(KeyDerivation.isValidMnemonic as jest.Mock).mockReturnValue(false)

      await expect(
        migrationService.verifyMigration(mockAgent, 'invalid')
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.verifyMigration(mockAgent, 'invalid')
      ).rejects.toMatchObject({
        type: MigrationErrorType.VERIFICATION_FAILED,
      })
    })

    it('should throw MigrationError if key derivation fails', async () => {
      ;(KeyDerivation.deriveWalletKeyFromMnemonic as jest.Mock).mockReturnValue('')

      await expect(
        migrationService.verifyMigration(mockAgent, testMnemonic)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.verifyMigration(mockAgent, testMnemonic)
      ).rejects.toMatchObject({
        type: MigrationErrorType.VERIFICATION_FAILED,
      })
    })

    it('should throw MigrationError if verification fails', async () => {
      (mockAgent.wallet.open as jest.Mock).mockRejectedValue(new Error('Open failed'))

      await expect(
        migrationService.verifyMigration(mockAgent, testMnemonic)
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.verifyMigration(mockAgent, testMnemonic)
      ).rejects.toMatchObject({
        type: MigrationErrorType.VERIFICATION_FAILED,
      })
    })
  })

  describe('cleanup', () => {
    it('should cleanup temporary files', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(true)

      await migrationService.cleanup('/path/to/backup.zip')

      // Should remove temp directory
      expect(RNFS.unlink).toHaveBeenCalled()

      // Should schedule backup deletion
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@BifoldWallet:MigrationBackupDeleteAt',
        expect.any(String)
      )
    })

    it('should not fail if temp directory does not exist', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(false)

      await migrationService.cleanup()

      // Should not throw
      expect(RNFS.unlink).not.toHaveBeenCalled()
    })

    it('should handle cleanup errors gracefully', async () => {
      ;(RNFS.exists as jest.Mock).mockResolvedValue(true)
      ;(RNFS.unlink as jest.Mock).mockRejectedValue(new Error('Delete failed'))

      // Should not throw
      await migrationService.cleanup()
    })
  })

  describe('rollback', () => {
    it('should rollback migration on error', async () => {
      const backupPath = '/path/to/backup.db'

      await migrationService.rollback(mockAgent, backupPath)

      // Should close current wallet
      expect(mockAgent.wallet.close).toHaveBeenCalled()

      // Should delete new wallet files
      expect(RNFS.unlink).toHaveBeenCalled()

      // Should load mnemonic from keychain (no PIN)
      expect(MnemonicStorage.decryptMnemonicWithoutVerification).toHaveBeenCalled()

      // Should import old wallet
      expect(mockAgent.wallet.import).toHaveBeenCalled()

      // Should open restored wallet
      expect(mockAgent.wallet.open).toHaveBeenCalled()

      // Should initialize agent
      expect(mockAgent.initialize).toHaveBeenCalled()

      // Should delete mnemonic from keychain
      expect(MnemonicStorage.deleteMnemonicFromKeychain).toHaveBeenCalled()

      // Should clean up AsyncStorage metadata
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('MigrationBackupPath'),
          expect.stringContaining('MigrationBackupTimestamp'),
          expect.stringContaining('MigrationImportMetadata'),
          expect.stringContaining('MigrationBackupDeleteAt'),
        ])
      )
    })

    it('should throw MigrationError if rollback fails', async () => {
      ;(MnemonicStorage.decryptMnemonicWithoutVerification as jest.Mock).mockResolvedValue(undefined)

      await expect(
        migrationService.rollback(mockAgent, '/path/to/backup.db')
      ).rejects.toThrow(MigrationError)

      await expect(
        migrationService.rollback(mockAgent, '/path/to/backup.db')
      ).rejects.toMatchObject({
        type: MigrationErrorType.ROLLBACK_FAILED,
      })
    })
  })

  describe('migrateWallet (complete flow)', () => {
    it('should complete full migration flow', async () => {
      // Setup mocks
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      const onProgress = jest.fn()

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false,
        onProgress
      )

      // Should return success
      expect(result.success).toBe(true)
      expect(result.mnemonic).toBe(testMnemonic)
      expect(result.backupPath).toBeDefined()

      // Should call progress callbacks
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.BACKING_UP)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.EXPORTING_DATA)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.GENERATING_MNEMONIC)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.CREATING_WALLET)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.IMPORTING_DATA)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.UPDATING_KEYCHAIN)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.VERIFYING)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.CLEANING_UP)
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.COMPLETE)

      // Should not call error callback
      expect(onProgress).not.toHaveBeenCalledWith(MigrationStatus.ERROR)
    })

    it('should rollback on error and return failure', async () => {
      // Mock error during wallet creation
      (mockAgent.wallet.create as jest.Mock).mockRejectedValue(new Error('Create failed'))

      const onProgress = jest.fn()

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false,
        onProgress
      )

      // Should return failure
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.backupPath).toBeDefined()

      // Should call error callback
      expect(onProgress).toHaveBeenCalledWith(MigrationStatus.ERROR)

      // Should not call complete callback
      expect(onProgress).not.toHaveBeenCalledWith(MigrationStatus.COMPLETE)
    })

    it('should support biometrics', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        true // use biometrics
      )

      expect(result.success).toBe(true)

      // Should store with biometrics
      expect(MnemonicStorage.storeMnemonicInKeychain).toHaveBeenCalledWith(
        expect.any(Object),
        true
      )
    })

    it('should handle same PIN for old and new', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        testPin, // same PIN
        false
      )

      expect(result.success).toBe(true)
    })

    it('should generate new mnemonic', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false
      )

      expect(KeyDerivation.generateWalletMnemonic).toHaveBeenCalled()
    })
  })

  describe('MigrationError', () => {
    it('should create error with type and message', () => {
      const originalError = new Error('Original error')
      const error = new MigrationError(
        MigrationErrorType.BACKUP_FAILED,
        'Backup failed',
        originalError
      )

      expect(error).toBeInstanceOf(Error)
      expect(error.type).toBe(MigrationErrorType.BACKUP_FAILED)
      expect(error.message).toBe('Backup failed')
      expect(error.originalError).toBe(originalError)
      expect(error.name).toBe('MigrationError')
    })

    it('should support all error types', () => {
      const types = [
        MigrationErrorType.BACKUP_FAILED,
        MigrationErrorType.EXPORT_FAILED,
        MigrationErrorType.WALLET_CREATION_FAILED,
        MigrationErrorType.IMPORT_FAILED,
        MigrationErrorType.KEYCHAIN_UPDATE_FAILED,
        MigrationErrorType.VERIFICATION_FAILED,
        MigrationErrorType.ROLLBACK_FAILED,
      ]

      types.forEach(type => {
        const error = new MigrationError(type, 'Test')
        expect(error.type).toBe(type)
      })
    })
  })

  describe('Integration tests', () => {
    it('should handle complete migration with rollback', async () => {
      // Setup: migration fails at verification step
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.wallet.open as jest.Mock).mockRejectedValueOnce(new Error('Verification failed'))

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false
      )

      // Should fail
      expect(result.success).toBe(false)
      expect(result.error?.type).toBe(MigrationErrorType.VERIFICATION_FAILED)

      // Should have backup path for rollback
      expect(result.backupPath).toBeDefined()
    })

    it('should handle migration with existing backup', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      // Pre-create backup
      const existingBackup = await migrationService.backupOldWallet(mockAgent)

      // Migration should still work
      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false
      )

      expect(result.success).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty wallet', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false
      )

      expect(result.success).toBe(true)
    })

    // it('should handle wallet with many credentials', async () => {
    //   const mockCredentials = Array.from({ length: 100 }, (_, i) => ({
    //     toJSON: () => ({ id: `cred${i}` }),
    //   }))

    //   (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue(mockCredentials as any)
    //   (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
    //   (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

    //   const result = await migrationService.migrateWallet(
    //     mockAgent,
    //     testPin,
    //     newPin,
    //     false
    //   )

    //   expect(result.success).toBe(true)
    // })

    it('should handle cleanup failure gracefully', async () => {
      (mockAgent.credentials.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.connections.getAll as jest.Mock).mockResolvedValue([] as any)
      (mockAgent.dids.getCreatedDids as jest.Mock).mockResolvedValue([] as any)

      // Cleanup fails but migration should still succeed
      ;(RNFS.unlink as jest.Mock).mockRejectedValue(new Error('Cleanup failed'))

      const result = await migrationService.migrateWallet(
        mockAgent,
        testPin,
        newPin,
        false
      )

      // Should still succeed
      expect(result.success).toBe(true)
    })
  })
})
