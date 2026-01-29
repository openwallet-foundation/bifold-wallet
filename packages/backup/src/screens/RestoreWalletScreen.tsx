import React, { useState } from 'react'
import { View, Text, Button, TextInput, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { container } from 'tsyringe'
import { WalletConfig } from '@credo-ts/core'
import { BackupService, RestoreStatus } from '../services/BackupService'
import { loadWalletSecret } from '../../../core/src/services/keychain'

interface RestoreWalletScreenProps {
  /**
   * Configuration for the new wallet to be created from import.
   * If not provided, a default configuration with a random ID will be used.
   */
  walletConfig?: WalletConfig
  /**
   * URL of the mediator to connect to after restore
   */
  mediatorUrl: string
  /**
   * Callback when restore is successful
   */
  onRestoreSuccess?: () => void
}

export const RestoreWalletScreen = ({ walletConfig, mediatorUrl, onRestoreSuccess }: RestoreWalletScreenProps) => {
  const { agent } = useAgent()
  const [mnemonic, setMnemonic] = useState('')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus | null>(null)
  const [backupService] = useState(() => container.resolve(BackupService))

  const handlePickFile = async () => {
    try {
      const path = await backupService.pickBackupFile()
      if (path) {
        setFilePath(path)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file')
    }
  }

  const getStatusMessage = (status: RestoreStatus): string => {
    const messages = {
      [RestoreStatus.VALIDATING]: 'Validating backup file...',
      [RestoreStatus.SHUTTING_DOWN]: 'Preparing for restore...',
      [RestoreStatus.DELETING_OLD]: 'Removing old wallet...',
      [RestoreStatus.IMPORTING]: 'Importing wallet from backup...',
      [RestoreStatus.INITIALIZING]: 'Initializing wallet...',
      [RestoreStatus.CONNECTING_MEDIATOR]: 'Connecting to mediator...',
      [RestoreStatus.SUCCESS]: 'Wallet restored successfully!',
    }
    return messages[status] || 'Processing...'
  }

  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase()

    if (message.includes('not found')) {
      return 'Backup file not found. Please select a valid backup file.'
    }
    if (message.includes('corrupted') || message.includes('invalid')) {
      return 'Backup file is corrupted or invalid. Please check your backup file.'
    }
    if (message.includes('mnemonic') || message.includes('key')) {
      return 'Incorrect mnemonic or key. Please check and try again.'
    }
    if (message.includes('permission')) {
      return 'Cannot access wallet files. Please restart the app and try again.'
    }
    if (message.includes('already exists')) {
      return 'Wallet already exists. Please contact support.'
    }

    // Generic error
    return `Failed to restore wallet: ${error.message}`
  }

  const handleRestore = async () => {
    if (!agent) return
    if (!filePath || !mnemonic) {
      Alert.alert('Error', 'Please provide both backup file and mnemonic')
      return
    }

    setLoading(true)

    try {
      // Load existing wallet secret from keychain (reuse existing PIN)
      const walletSecret = await loadWalletSecret()
      
      if (!walletSecret) {
        Alert.alert('Error', 'Could not load wallet credentials. Please ensure you have set up your wallet.')
        setLoading(false)
        return
      }

      // Use wallet secret from keychain (same PIN as before)
      const targetConfig: WalletConfig = walletConfig || {
        id: walletSecret.id,      // 'walletId' from keychain
        key: walletSecret.key,    // Hashed PIN from keychain (NOT mnemonic!)
      }

      // Use new complete restore method
      await backupService.restoreWalletComplete(
        agent,
        filePath,
        mnemonic,        // Used only for decrypting the backup file
        targetConfig,    // Wallet config with hashed PIN from keychain
        mediatorUrl,
        (status) => {
          setRestoreStatus(status)
        }
      )

      Alert.alert('Success', 'Wallet restored successfully. You can now use your existing PIN to access the wallet.')
      onRestoreSuccess?.()
    } catch (error) {
      const errorMessage = getErrorMessage(error as Error)
      Alert.alert('Error', errorMessage)
    } finally {
      setLoading(false)
      setRestoreStatus(null)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Restore Wallet</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Backup File</Text>
          <View style={styles.fileRow}>
            <Text style={styles.filePath} numberOfLines={1} ellipsizeMode="middle">
              {filePath || 'No file selected'}
            </Text>
            <Button title="Select File" onPress={handlePickFile} />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mnemonic / Key</Text>
          <TextInput
            style={styles.input}
            value={mnemonic}
            onChangeText={setMnemonic}
            placeholder="Enter mnemonic phrase"
            multiline
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        {loading ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            {restoreStatus && (
              <Text style={styles.progressText}>{getStatusMessage(restoreStatus)}</Text>
            )}
          </View>
        ) : (
          <Button title="Restore Wallet" onPress={handleRestore} disabled={!agent || !filePath || !mnemonic} />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  filePath: {
    flex: 1,
    marginRight: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#333',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  progressText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
})
