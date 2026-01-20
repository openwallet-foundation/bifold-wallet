import React, { useEffect, useState } from 'react'
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { container } from 'tsyringe'
import Clipboard from '@react-native-clipboard/clipboard'
import { BackupService } from '../services/BackupService'

export const BackupWalletScreen = () => {
  const { agent } = useAgent()
  const [mnemonic, setMnemonic] = useState<string>('')
  const [loading, setLoading] = useState(false)
  // Resolve service once
  const [backupService] = useState(() => container.resolve(BackupService))

  useEffect(() => {
    const generated = backupService.generateMnemonic()
    setMnemonic(generated)
  }, [backupService])

  const handleCopy = () => {
    if (mnemonic) {
      Clipboard.setString(mnemonic)
      Alert.alert('Copied', 'Mnemonic phrase copied to clipboard')
    }
  }

  const handleBackup = async () => {
    if (!agent) return
    if (!mnemonic) return

    setLoading(true)
    try {
      // Using mnemonic as the key for backup encryption
      await backupService.exportWallet(agent, mnemonic)
      Alert.alert('Success', 'Wallet backup exported successfully')
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to export wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Backup Your Wallet</Text>
        <Text style={styles.description}>
          Please write down this mnemonic phrase. You will need it to restore your wallet. It is also used to encrypt
          your backup file.
        </Text>

        <View style={styles.mnemonicContainer}>
          <Text style={styles.mnemonic}>{mnemonic}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Backup Now" onPress={handleBackup} disabled={!agent || !mnemonic} />
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
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  mnemonicContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  mnemonic: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  copyButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  copyButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
})
