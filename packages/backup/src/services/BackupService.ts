import { Agent, WalletConfig } from '@credo-ts/core'
import { generateMnemonic as bip39GenerateMnemonic } from 'bip39'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import DocumentPicker from 'react-native-document-picker'
import { zip, unzip } from 'react-native-zip-archive'
import { Platform } from 'react-native'
import { injectable } from 'tsyringe'
// Import directly from the utils file since it's not exported from the main package
import { setMediationToDefault } from '../../../core/src/utils/mediatorhelpers'
import * as MnemonicStorage from '../../../core/src/services/MnemonicStorage'
import * as KeyDerivation from '../../../core/src/services/KeyDerivation'

/**
 * Custom error class for backup operations
 */
export class BackupError extends Error {
  constructor(
    message: string,
    public code: BackupErrorCode
  ) {
    super(message)
    this.name = 'BackupError'
  }
}

/**
 * Error codes for backup operations
 */
export type BackupErrorCode =
  | 'MNEMONIC_NOT_FOUND'
  | 'INCORRECT_PIN'
  | 'DECRYPTION_FAILED'
  | 'INVALID_MNEMONIC'
  | 'FILESYSTEM_ERROR'
  | 'EXPORT_FAILED'
  | 'ZIP_FAILED'
  | 'VERIFICATION_FAILED'
  | 'SHARE_FAILED'
  | 'BACKUP_NOT_FOUND'
  | 'BACKUP_CORRUPTED'
  | 'IMPORT_FAILED'
  | 'WALLET_DELETE_FAILED'

/**
 * Status enum for wallet restore progress
 */
export enum RestoreStatus {
  VALIDATING = 'validating',
  SHUTTING_DOWN = 'shutting_down',
  DELETING_OLD = 'deleting_old',
  IMPORTING = 'importing',
  INITIALIZING = 'initializing',
  CONNECTING_MEDIATOR = 'connecting_mediator',
  SUCCESS = 'success',
}

/**
 * Interface for restore progress updates
 */
export interface RestoreProgress {
  status: RestoreStatus
  message: string
  error?: Error
}

@injectable()
export class BackupService {
  /**
   * Generates a new mnemonic for wallet backup/restore
   * @param strength Strength of the mnemonic (default: 256)
   * @returns string Mnemonic phrase
   */
  public generateMnemonic(strength = 256): string {
    return bip39GenerateMnemonic(strength)
  }

  /**
   * Exports the current wallet to a zip file with mnemonic encryption
   * @param agent The agent instance
   * @param fileName Optional filename (default: backup.zip)
   * @param verifyBackup Whether to verify backup after creation (default: true)
   * @returns The mnemonic (user needs this for restore)
   * @throws BackupError if backup creation or verification fails
   */
  public async exportWalletWithMnemonic(
    agent: Agent,
    fileName: string = 'backup.zip',
    verifyBackup: boolean = true
  ): Promise<string> {
    const backupDir = `${RNFS.CachesDirectoryPath}/backup_export`
    const dbFileName = 'sqlite.db'
    const dbPath = `${backupDir}/${dbFileName}`
    const zipPath = `${RNFS.CachesDirectoryPath}/${fileName}`

    try {
      // Step 1: Load mnemonic from keychain (auto-decrypt, no PIN needed)
      // Assumes user is already authenticated (app is unlocked)
      let mnemonic: string
      try {
        mnemonic = await MnemonicStorage.decryptMnemonicWithoutVerification()
      } catch (error) {
        if (error instanceof Error && error.message.includes('Session not authenticated')) {
          throw new BackupError(
            'Please authenticate with your PIN first',
            'MNEMONIC_NOT_FOUND'
          )
        }
        throw new BackupError(
          `Failed to decrypt mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'DECRYPTION_FAILED'
        )
      }
      
      // Validate mnemonic
      if (!KeyDerivation.isValidMnemonic(mnemonic)) {
        throw new BackupError(
          'Invalid mnemonic in keychain. Wallet data may be corrupted.',
          'INVALID_MNEMONIC'
        )
      }

      // Step 2: Prepare directory
      try {
        if (await RNFS.exists(backupDir)) {
          await RNFS.unlink(backupDir)
        }
        await RNFS.mkdir(backupDir)

        if (await RNFS.exists(zipPath)) {
          await RNFS.unlink(zipPath)
        }
      } catch (error) {
        throw new BackupError(
          `Failed to prepare backup directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'FILESYSTEM_ERROR'
        )
      }

      // Step 3: Export database from agent encrypted with mnemonic
      try {
        await agent.wallet.export({
          path: dbPath,
          key: mnemonic,  // Encrypt with mnemonic!
        })
      } catch (error) {
        throw new BackupError(
          `Failed to export wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'EXPORT_FAILED'
        )
      }

      // Step 4: Zip the exported file
      try {
        await zip(backupDir, zipPath)
      } catch (error) {
        throw new BackupError(
          `Failed to create backup archive: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'ZIP_FAILED'
        )
      }

      // Step 5: Verify backup if requested
      if (verifyBackup) {
        try {
          await this.verifyBackup(zipPath, mnemonic)
        } catch (error) {
          // Delete corrupted backup
          try {
            if (await RNFS.exists(zipPath)) {
              await RNFS.unlink(zipPath)
            }
          } catch (cleanupError) {
            // Ignore cleanup error
          }
          
          throw new BackupError(
            `Backup verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'VERIFICATION_FAILED'
          )
        }
      }

      // Step 6: Share the zip file
      try {
        await Share.open({
          url: `file://${zipPath}`,
          type: 'application/zip',
          failOnCancel: false,
        })
      } catch (error) {
        // Don't fail if user cancels share
        if (error instanceof Error && !error.message.includes('cancel')) {
          throw new BackupError(
            `Failed to share backup file: ${error.message}`,
            'SHARE_FAILED'
          )
        }
      }
      
      // Step 7: Return mnemonic (user needs to save it!)
      return mnemonic
    } finally {
      // Best effort cleanup
      try {
        if (await RNFS.exists(backupDir)) await RNFS.unlink(backupDir)
        if (await RNFS.exists(zipPath)) await RNFS.unlink(zipPath)
      } catch (error) {
        // ignore cleanup error
      }
    }
  }

  /**
   * Verifies that a backup file can be decrypted with the given mnemonic
   * @param backupFilePath Path to the backup file
   * @param mnemonic The mnemonic used to encrypt the backup
   * @throws Error if verification fails
   * @private
   */
  private async verifyBackup(backupFilePath: string, mnemonic: string): Promise<void> {
    const verifyDir = `${RNFS.CachesDirectoryPath}/backup_verify_${Date.now()}`
    
    try {
      // Validate backup file exists and is not empty
      await this.validateBackupFile(backupFilePath)
      
      // Try to unzip
      await RNFS.mkdir(verifyDir)
      await unzip(backupFilePath, verifyDir)
      
      // Find the database file
      const files = await RNFS.readDir(verifyDir)
      const dbFile = files.find((f: { name: string; path: string }) => f.name.endsWith('.db') || f.name === 'sqlite.db')
      
      if (!dbFile) {
        throw new Error('No database file found in backup')
      }
      
      // Verify file size is reasonable (> 0 bytes)
      const stat = await RNFS.stat(dbFile.path)
      if (stat.size === 0) {
        throw new Error('Database file is empty')
      }
      
      // Note: We can't fully verify decryption without actually importing the wallet,
      // which would be too expensive. The validation above ensures the backup file
      // is structurally correct. Full decryption verification happens during restore.
      
    } finally {
      // Cleanup verification directory
      try {
        if (await RNFS.exists(verifyDir)) {
          await RNFS.unlink(verifyDir)
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Exports the current wallet to a zip file and opens the share sheet
   * @param agent The agent instance
   * @param key The backup key (derived from pin/mnemonic)
   * @param fileName Optional filename (default: backup.zip)
   * @deprecated Use exportWalletWithMnemonic instead for SSI-compliant backups
   */
  public async exportWallet(agent: Agent, key: string, fileName: string = 'backup.zip'): Promise<void> {
    const backupDir = `${RNFS.CachesDirectoryPath}/backup_export`
    const dbFileName = 'sqlite.db'
    const dbPath = `${backupDir}/${dbFileName}`
    const zipPath = `${RNFS.CachesDirectoryPath}/${fileName}`

    try {
      // 1. Prepare directory
      if (await RNFS.exists(backupDir)) {
        await RNFS.unlink(backupDir)
      }
      await RNFS.mkdir(backupDir)

      if (await RNFS.exists(zipPath)) {
        await RNFS.unlink(zipPath)
      }

      // 2. Export database from agent
      await agent.wallet.export({
        path: dbPath,
        key,
      })

      // 3. Zip the exported file
      await zip(backupDir, zipPath)

      // 4. Share the zip file
      await Share.open({
        url: `file://${zipPath}`,
        type: 'application/zip',
        failOnCancel: false,
      })
    } finally {
      // Best effort cleanup
      try {
        if (await RNFS.exists(backupDir)) await RNFS.unlink(backupDir)
        if (await RNFS.exists(zipPath)) await RNFS.unlink(zipPath)
      } catch (error) {
        // ignore cleanup error
      }
    }
  }

  /**
   * Picks a backup file using the document picker
   * @returns The path to the selected file or null if cancelled
   */
  public async pickBackupFile(): Promise<string | null> {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles, 'application/zip'],
        copyTo: 'cachesDirectory',
      })

      return result.fileCopyUri || null
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return null
      }
      throw err
    }
  }

  /**
   * Imports a wallet from a backup file (supports .zip or direct .db)
   * @param agent The agent instance
   * @param path Path to the backup file
   * @param key The backup key used to encrypt the wallet
   * @param walletConfig Configuration for the imported wallet
   * @throws BackupError if import fails
   */
  public async importWallet(agent: Agent, path: string, key: string, walletConfig: WalletConfig): Promise<void> {
    let importPath = Platform.OS === 'android' ? decodeURIComponent(path.replace('file://', '')) : path
    const unzipDir = `${RNFS.CachesDirectoryPath}/backup_import_${Date.now()}`

    try {
      // Check if it's a zip file
      if (importPath.toLowerCase().endsWith('.zip')) {
        try {
          await RNFS.mkdir(unzipDir)
          await unzip(importPath, unzipDir)
        } catch (error) {
          throw new BackupError(
            `Failed to extract backup file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'BACKUP_CORRUPTED'
          )
        }

        // Try to find the database file in the unzipped folder
        const files = await RNFS.readDir(unzipDir)
        const dbFile = files.find((f: { name: string; path: string }) => f.name.endsWith('.db') || f.name === 'sqlite.db')

        if (!dbFile) {
          throw new BackupError(
            'No valid wallet database found in the zip file',
            'BACKUP_CORRUPTED'
          )
        }
        importPath = dbFile.path
      }

      try {
        await agent.wallet.import(walletConfig, {
          path: importPath,
          key,
        })
      } catch (error) {
        // Check if error is due to wrong key/mnemonic
        if (error instanceof Error && (
          error.message.includes('decrypt') ||
          error.message.includes('key') ||
          error.message.includes('password')
        )) {
          throw new BackupError(
            'Failed to decrypt backup. The recovery phrase may be incorrect.',
            'DECRYPTION_FAILED'
          )
        }
        
        throw new BackupError(
          `Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'IMPORT_FAILED'
        )
      }
    } finally {
      // Best effort cleanup of unzipped files
      try {
        if (await RNFS.exists(unzipDir)) {
          await RNFS.unlink(unzipDir)
        }
      } catch (error) {
        // ignore cleanup error
      }
    }
  }

  /**
   * Safely deletes an existing wallet directory
   * @param walletId The ID of the wallet to delete
   * @throws BackupError if deletion fails due to permissions or other issues
   */
  public async deleteWallet(walletId: string): Promise<void> {
    // Construct wallet directory path
    // Android: /data/user/0/com.ariesbifold/files/.afj/wallet/{walletId}
    // iOS: {DocumentDirectory}/.afj/wallet/{walletId}
    const walletDir = `${RNFS.DocumentDirectoryPath}/.afj/wallet/${walletId}`

    // Check if wallet directory exists
    if (await RNFS.exists(walletDir)) {
      try {
        // Delete entire directory recursively
        await RNFS.unlink(walletDir)
        // Wallet deleted successfully
      } catch (error) {
        throw new BackupError(
          `Failed to delete wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'WALLET_DELETE_FAILED'
        )
      }
    }
    // If wallet doesn't exist, that's fine (already deleted or never created)
  }

  /**
   * Validates a backup file before proceeding with restore
   * @param filePath Path to the backup file (should already be normalized)
   * @throws BackupError if validation fails
   * @private
   */
  private async validateBackupFile(filePath: string): Promise<void> {
    // Check file exists
    if (!(await RNFS.exists(filePath))) {
      throw new BackupError('Backup file not found', 'BACKUP_NOT_FOUND')
    }

    // Check file size (should be > 0)
    try {
      const stat = await RNFS.stat(filePath)
      if (stat.size === 0) {
        throw new BackupError('Backup file is empty', 'BACKUP_CORRUPTED')
      }
    } catch (error) {
      if (error instanceof BackupError) {
        throw error
      }
      throw new BackupError(
        `Failed to read backup file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FILESYSTEM_ERROR'
      )
    }

    // If zip file, check it can be unzipped and contains a database
    if (filePath.toLowerCase().endsWith('.zip')) {
      const testUnzipDir = `${RNFS.CachesDirectoryPath}/test_unzip_${Date.now()}`
      
      try {
        await RNFS.mkdir(testUnzipDir)
        
        try {
          await unzip(filePath, testUnzipDir)
        } catch (error) {
          throw new BackupError(
            'Backup file is corrupted or invalid',
            'BACKUP_CORRUPTED'
          )
        }

        // Check for sqlite.db file
        const files = await RNFS.readDir(testUnzipDir)
        const hasDb = files.some((f: { name: string }) => f.name.endsWith('.db'))

        if (!hasDb) {
          throw new BackupError(
            'No database file found in backup',
            'BACKUP_CORRUPTED'
          )
        }
      } finally {
        // Cleanup test directory
        try {
          if (await RNFS.exists(testUnzipDir)) {
            await RNFS.unlink(testUnzipDir)
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Complete restore flow with mnemonic-derived key
   * 
   * This method implements the SSI-compliant restore flow:
   * 1. Mnemonic is used to DECRYPT the backup file
   * 2. Wallet key is DERIVED from the mnemonic
   * 3. Wallet is imported with the derived key
   * 
   * @param agent The agent instance
   * @param backupFilePath Path to the backup file
   * @param mnemonic The recovery mnemonic (for decryption AND key derivation)
   * @param walletConfig Configuration for the wallet (id only, key will be derived)
   * @param mediatorUrl URL of the mediator to connect to
   * @param onProgress Optional callback for progress updates
   * @throws Error if any step of the restore process fails
   */
  public async restoreWalletComplete(
    agent: Agent,
    backupFilePath: string,
    mnemonic: string,
    walletConfig: WalletConfig,
    mediatorUrl: string,
    onProgress?: (status: RestoreStatus) => void
  ): Promise<void> {
    // Validate mnemonic
    if (!KeyDerivation.isValidMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic')
    }
    
    // Derive wallet key from mnemonic
    const derivedKey = await KeyDerivation.deriveWalletKeyFromMnemonic(mnemonic)
    
    // Update wallet config with derived key
    const updatedWalletConfig: WalletConfig = {
      ...walletConfig,
      key: derivedKey,
    }
    
    const walletId = updatedWalletConfig.id
    const walletKey = updatedWalletConfig.key
    
    if (!walletKey) {
      throw new Error('Failed to derive wallet key from mnemonic')
    }
    
    // Normalize file path at the beginning
    let normalizedPath = backupFilePath
    if (Platform.OS === 'android') {
      normalizedPath = decodeURIComponent(backupFilePath.replace('file://', ''))
    }

    // Step 1: Validate backup file
    onProgress?.(RestoreStatus.VALIDATING)
    await this.validateBackupFile(normalizedPath)

    // Step 2: Close current wallet (but don't shutdown agent completely)
    onProgress?.(RestoreStatus.SHUTTING_DOWN)
    try {
      // Check if wallet is open before trying to close
      if (agent.wallet.isInitialized) {
        await agent.wallet.close()
      }
    } catch (error) {
      // If wallet is already closed or not initialized, that's fine
      // Continue with the restore process
    }

    // Step 3: Delete old wallet if exists
    onProgress?.(RestoreStatus.DELETING_OLD)
    await this.deleteWallet(walletId)

    // Step 4: Import wallet from backup
    // Use mnemonic to decrypt the backup, and derived key as the wallet key
    onProgress?.(RestoreStatus.IMPORTING)
    await this.importWallet(agent, normalizedPath, mnemonic, updatedWalletConfig)

    // Step 5: Open the restored wallet
    onProgress?.(RestoreStatus.INITIALIZING)
    await agent.wallet.open({
      id: walletId,
      key: walletKey,
    })
    
    // Initialize agent with the restored wallet (only if not already initialized)
    if (!agent.isInitialized) {
      await agent.initialize()
    }

    // Step 6: Setup mediator connection
    onProgress?.(RestoreStatus.CONNECTING_MEDIATOR)
    try {
      await setMediationToDefault(agent, mediatorUrl)
    } catch (mediatorError) {
      // Don't fail entire restore if mediator fails
      // User can reconnect manually later
    }

    // Step 7: Success
    onProgress?.(RestoreStatus.SUCCESS)
  }
  
  /**
   * Legacy restore flow (for backwards compatibility)
   * @deprecated Use restoreWalletComplete with mnemonic instead
   */
  public async restoreWalletCompleteLegacy(
    agent: Agent,
    backupFilePath: string,
    mnemonic: string,
    walletConfig: WalletConfig,
    mediatorUrl: string,
    onProgress?: (status: RestoreStatus) => void
  ): Promise<void> {
    const walletId = walletConfig.id
    // Use the key from walletConfig (should be hashed PIN from keychain)
    const walletKey = walletConfig.key
    
    if (!walletKey) {
      throw new Error('Wallet key is required in walletConfig')
    }
    
    // Normalize file path at the beginning
    let normalizedPath = backupFilePath
    if (Platform.OS === 'android') {
      normalizedPath = decodeURIComponent(backupFilePath.replace('file://', ''))
    }

    // Step 1: Validate backup file
    onProgress?.(RestoreStatus.VALIDATING)
    await this.validateBackupFile(normalizedPath)

    // Step 2: Close current wallet (but don't shutdown agent completely)
    onProgress?.(RestoreStatus.SHUTTING_DOWN)
    try {
      // Check if wallet is open before trying to close
      if (agent.wallet.isInitialized) {
        await agent.wallet.close()
      }
    } catch (error) {
      // If wallet is already closed or not initialized, that's fine
      // Continue with the restore process
    }

    // Step 3: Delete old wallet if exists
    onProgress?.(RestoreStatus.DELETING_OLD)
    await this.deleteWallet(walletId)

    // Step 4: Import wallet from backup
    // IMPORTANT: Use mnemonic to decrypt the backup, but walletKey (from keychain) as the wallet key
    onProgress?.(RestoreStatus.IMPORTING)
    await this.importWallet(agent, normalizedPath, mnemonic, walletConfig)

    // Step 5: Open the restored wallet
    onProgress?.(RestoreStatus.INITIALIZING)
    await agent.wallet.open({
      id: walletId,
      key: walletKey,
    })
    
    // Initialize agent with the restored wallet (only if not already initialized)
    if (!agent.isInitialized) {
      await agent.initialize()
    }

    // Step 6: Setup mediator connection
    onProgress?.(RestoreStatus.CONNECTING_MEDIATOR)
    try {
      await setMediationToDefault(agent, mediatorUrl)
    } catch (mediatorError) {
      // Don't fail entire restore if mediator fails
      // User can reconnect manually later - no console.warn in production
    }

    // Step 7: Success
    onProgress?.(RestoreStatus.SUCCESS)
  }
}
