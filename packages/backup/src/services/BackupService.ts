import { Agent, WalletConfig } from '@credo-ts/core'
import { generateMnemonic as bip39GenerateMnemonic } from 'bip39'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import DocumentPicker from 'react-native-document-picker'
import { zip, unzip } from 'react-native-zip-archive'
import { Platform } from 'react-native'
import { injectable } from 'tsyringe'

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
   * Exports the current wallet to a zip file and opens the share sheet
   * @param agent The agent instance
   * @param key The backup key (derived from pin/mnemonic)
   * @param fileName Optional filename (default: backup.zip)
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
   */
  public async importWallet(agent: Agent, path: string, key: string, walletConfig: WalletConfig): Promise<void> {
    let importPath = Platform.OS === 'android' ? decodeURIComponent(path.replace('file://', '')) : path
    const unzipDir = `${RNFS.CachesDirectoryPath}/backup_import_${Date.now()}`

    try {
      // Check if it's a zip file
      if (importPath.toLowerCase().endsWith('.zip')) {
        await RNFS.mkdir(unzipDir)
        await unzip(importPath, unzipDir)

        // Try to find the database file in the unzipped folder
        const files = await RNFS.readDir(unzipDir)
        const dbFile = files.find((f: any) => f.name.endsWith('.db') || f.name === 'sqlite.db')

        if (!dbFile) {
          throw new Error('No valid wallet database found in the zip file')
        }
        importPath = dbFile.path
      }

      await agent.wallet.import(walletConfig, {
        path: importPath,
        key,
      })
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
}
