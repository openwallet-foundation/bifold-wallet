import React, { useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { container } from 'tsyringe'
import { BackupService } from '../services/BackupService'
import { MnemonicDisplay } from '../../../core/src/components/MnemonicDisplay'
import { useTheme } from '../../../core/src/contexts/theme'
import * as MnemonicStorage from '../../../core/src/services/MnemonicStorage'

type BackupStep = 'loading' | 'display' | 'exporting'

export const BackupWalletScreen = () => {
  const { agent } = useAgent()
  const { ColorPalette, TextTheme } = useTheme()
  const [step, setStep] = useState<BackupStep>('loading')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [loading, setLoading] = useState(false)
  // Resolve service once
  const [backupService] = useState(() => container.resolve(BackupService))

  // Load mnemonic directly on mount - no PIN required
  useEffect(() => {
    const loadMnemonic = async () => {
      try {
        const recoveryMnemonic = await MnemonicStorage.decryptMnemonicWithoutVerification()
        setMnemonic(recoveryMnemonic)
        setStep('display')
      } catch (error) {
        const errorMessage = (error as Error).message || 'Failed to load mnemonic'
        Alert.alert(
          'Backup Error',
          `Unable to load your recovery phrase. Please make sure you have authenticated with your PIN at least once.\n\nError: ${errorMessage}`,
          [{ text: 'OK', onPress: () => { } }]
        )
      }
    }

    loadMnemonic()
  }, [])

  const handleDownloadBackup = async () => {
    if (!agent) {
      Alert.alert('Error', 'Agent not initialized')
      return
    }

    setLoading(true)
    setStep('exporting')

    try {
      // Export wallet and create backup file
      await backupService.exportWalletWithMnemonic(agent)
      
      Alert.alert(
        'Backup Created',
        'Your backup file has been created. Please save it in a secure location.',
        [{ text: 'OK', onPress: () => setStep('display') }]
      )
    } catch (error) {
      const errorMessage = (error as Error).message || 'Failed to export wallet'
      Alert.alert('Backup Failed', errorMessage)
      setStep('display')
    } finally {
      setLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    scrollViewContent: {
      padding: 20,
    },
    warningBox: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderLeftWidth: 4,
      borderLeftColor: ColorPalette.notification.infoBorder,
      padding: 16,
      marginBottom: 20,
      borderRadius: 8,
    },
    warningTitle: {
      ...TextTheme.bold,
      color: ColorPalette.notification.infoText,
      marginBottom: 8,
    },
    warningText: {
      ...TextTheme.normal,
      color: ColorPalette.notification.infoText,
      marginBottom: 4,
      lineHeight: 20,
    },
    downloadButton: {
      backgroundColor: ColorPalette.brand.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    downloadButtonDisabled: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
    },
    downloadButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primaryBackground,
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginTop: 16,
      textAlign: 'center',
    },
  })

  // Step 1: Loading (initial mnemonic load)
  if (step === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ColorPalette.brand.primary} />
          <Text style={styles.loadingText}>Loading your recovery phrase...</Text>
        </View>
      </View>
    )
  }

  // Step 2: Exporting (creating backup file)
  if (step === 'exporting') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ColorPalette.brand.primary} />
          <Text style={styles.loadingText}>Creating backup file...</Text>
          <Text style={[styles.loadingText, { marginTop: 8 }]}>
            This may take a few moments
          </Text>
        </View>
      </View>
    )
  }

  // Step 3: Display Mnemonic + Download Button
  if (step === 'display' && mnemonic) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
        <MnemonicDisplay
          mnemonic={mnemonic}
          title="Save Your Recovery Phrase"
          description="Copy this recovery phrase and download your backup file. You need BOTH to restore your wallet on a new device."
          showCopyButton={true}
          showWarning={true}
          requireConfirmation={false}
          showBlurEffect={true}
        />

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ BACKUP FILE REQUIRED</Text>
          <Text style={styles.warningText}>
            You must download the backup file below. Without it, you cannot restore your wallet even with the recovery phrase.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, loading && styles.downloadButtonDisabled]}
          onPress={handleDownloadBackup}
          disabled={loading}
        >
          <Text style={styles.downloadButtonText}>
            {loading ? 'Creating Backup...' : 'Download Backup File'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  return null
}
