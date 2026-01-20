import React, { useState } from 'react'
import { View, Text, Button, TextInput, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { container } from 'tsyringe'
import { WalletConfig } from '@credo-ts/core'
import { BackupService } from '../services/BackupService'

interface RestoreWalletScreenProps {
  /**
   * Configuration for the new wallet to be created from import.
   * If not provided, a default configuration with a random ID will be used.
   */
  walletConfig?: WalletConfig
  /**
   * Callback when restore is successful
   */
  onRestoreSuccess?: () => void
}

export const RestoreWalletScreen = ({ walletConfig, onRestoreSuccess }: RestoreWalletScreenProps) => {
  const { agent } = useAgent()
  const [mnemonic, setMnemonic] = useState('')
  const [filePath, setFilePath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
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

  const handleRestore = async () => {
    if (!agent) return
    if (!filePath || !mnemonic) {
      Alert.alert('Error', 'Please provide both backup file and mnemonic')
      return
    }

    const targetConfig: WalletConfig = walletConfig || {
      id: 'walletId',
      key: mnemonic,
    }

    setLoading(true)
    try {
      // Note: importWallet uses the agent instance to access the wallet module
      // The new wallet is created on disk but not necessarily opened as the active wallet of this agent
      // depending on how Credo works (usually it just imports).
      await backupService.importWallet(agent, filePath, mnemonic, targetConfig)
      Alert.alert('Success', 'Wallet restored successfully')
      onRestoreSuccess?.()
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to restore wallet')
    } finally {
      setLoading(false)
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
          <ActivityIndicator size="large" color="#0000ff" />
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
})
