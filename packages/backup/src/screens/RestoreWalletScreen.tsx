/**
 * RestoreWalletScreen (Settings)
 * 
 * Complete SSI-compliant wallet restore flow from Settings menu.
 * 
 * Flow:
 * 1. Select backup file (optional - can skip for mnemonic-only restore)
 * 2. Enter 12-word recovery phrase with autocomplete
 * 3. Restore wallet with progress indicator
 * 4. Setup new PIN for the restored wallet
 * 5. Store encrypted mnemonic in keychain
 * 
 * Features:
 * - File picker for backup file selection
 * - MnemonicInput component with BIP39 validation
 * - Paste from clipboard support
 * - Progress indicator showing restore steps
 * - PIN setup after successful restore
 * - Comprehensive error handling
 */

import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { container } from 'tsyringe'
import Clipboard from '@react-native-clipboard/clipboard'
import type { StackScreenProps } from '@react-navigation/stack'

import { useTheme } from '../../../core/src/contexts/theme'
import { MnemonicInput } from '../../../core/src/components/MnemonicInput'
import { ProgressIndicator, createSteps } from '../../../core/src/components/ProgressIndicator'
import Button, { ButtonType } from '../../../core/src/components/buttons/Button'
import { isValidMnemonic, deriveWalletKeyFromMnemonic } from '../../../core/src/services/KeyDerivation'
import { BackupService, RestoreStatus } from '../services/BackupService'
import { SettingStackParams, Screens } from '../../../core/src/types/navigators'
import { testIdWithKey } from '../../../core/src/utils/testable'

type RestoreStep = 'file' | 'mnemonic' | 'restoring' | 'pin' | 'complete'

type Props = StackScreenProps<SettingStackParams, Screens.RestoreWallet>

export const RestoreWalletScreen: React.FC<Props> = ({ navigation }) => {
  const { ColorPalette, TextTheme } = useTheme()
  const { agent } = useAgent()
  const [backupService] = useState(() => container.resolve(BackupService))

  const [step, setStep] = useState<RestoreStep>('file')
  const [backupFilePath, setBackupFilePath] = useState<string>('')
  const [words, setWords] = useState<string[]>(Array(12).fill(''))
  const [error, setError] = useState<string>('')
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus | null>(null)

  const stepLabels = ['Select File', 'Enter Mnemonic', 'Restoring', 'Set PIN']
  const currentStepIndex = stepLabels.indexOf(
    step === 'file' ? 'Select File' :
    step === 'mnemonic' ? 'Enter Mnemonic' :
    step === 'restoring' ? 'Restoring' :
    'Set PIN'
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    progressContainer: {
      marginBottom: 24,
    },
    title: {
      ...TextTheme.headingTwo,
      color: ColorPalette.brand.primary,
      marginBottom: 16,
    },
    description: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginBottom: 24,
      lineHeight: 22,
    },
    fileInfoContainer: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    fileInfoText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.darkGrey,
    },
    buttonContainer: {
      marginTop: 24,
      gap: 12,
    },
    pasteButton: {
      alignSelf: 'center',
      marginTop: 16,
    },
    pasteButtonText: {
      ...TextTheme.normal,
      color: ColorPalette.brand.link,
      textDecorationLine: 'underline',
    },
    errorText: {
      ...TextTheme.normal,
      color: ColorPalette.semantic.error,
      marginTop: 12,
      textAlign: 'center',
    },
    restoreProgressContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    restoreProgressText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginTop: 16,
      textAlign: 'center',
    },
  })

  const getRestoreStatusMessage = (status: RestoreStatus): string => {
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

  const handleSelectFile = async () => {
    try {
      const path = await backupService.pickBackupFile()
      if (path) {
        setBackupFilePath(path)
        setStep('mnemonic')
        setError('')
      }
    } catch (err) {
      setError('Failed to select backup file. Please try again.')
      console.error('Failed to pick file:', err)
    }
  }

  const handleSkipFile = () => {
    // Allow user to proceed with just mnemonic (for mnemonic-only restore)
    setStep('mnemonic')
    setError('')
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString()
      if (clipboardContent) {
        const pastedWords = clipboardContent.trim().split(/\s+/)
        if (pastedWords.length === 12) {
          setWords(pastedWords.map(w => w.toLowerCase()))
        } else {
          Alert.alert(
            'Invalid Format',
            'Please paste exactly 12 words separated by spaces.'
          )
        }
      }
    } catch (err) {
      console.error('Failed to paste from clipboard:', err)
    }
  }

  const handleMnemonicComplete = async (mnemonic: string) => {
    try {
      // Validate mnemonic
      if (!isValidMnemonic(mnemonic)) {
        setError('Invalid recovery phrase. Please check and try again.')
        return
      }

      setStep('restoring')
      setError('')

      if (!agent) {
        throw new Error('Agent not initialized')
      }

      // Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)

      // Get mediator URL from config (or use default)
      const mediatorUrl = 'https://mediator.example.com' // TODO: Get from config

      if (backupFilePath) {
        // Restore from backup file with mnemonic
        await backupService.restoreWalletComplete(
          agent,
          backupFilePath,
          mnemonic,
          {
            id: 'main',
            key: walletKey,
          },
          mediatorUrl,
          (status) => {
            setRestoreStatus(status)
          }
        )
      } else {
        // Mnemonic-only restore: Create new wallet with derived key
        await agent.wallet.create({
          id: 'main',
          key: walletKey,
        })

        await agent.wallet.open({
          id: 'main',
          key: walletKey,
        })

        await agent.initialize()
      }

      // Navigate to PIN setup
      setStep('pin')
      
      // Navigate to PINCreate screen with mnemonic
      navigation.navigate(Screens.CreatePIN, {
        setAuthenticated: () => {
          // After PIN is set, complete the restore
          setStep('complete')
          Alert.alert(
            'Success',
            'Wallet restored successfully! You can now use your new PIN to access the wallet.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to settings
                  navigation.goBack()
                }
              }
            ]
          )
        },
        mnemonic: mnemonic,
        isRestoringWallet: true,
      })
    } catch (err) {
      setError('Failed to restore wallet. Please check your recovery phrase and try again.')
      console.error('Failed to restore wallet:', err)
      setStep('mnemonic')
      setRestoreStatus(null)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'file':
        return (
          <View>
            <Text style={styles.title}>Select Backup File</Text>
            <Text style={styles.description}>
              Select your wallet backup file (.zip) or skip this step if you only have your recovery phrase.
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                title="Select Backup File"
                accessibilityLabel="Select Backup File"
                testID={testIdWithKey('SelectBackupFileButton')}
                buttonType={ButtonType.Primary}
                onPress={handleSelectFile}
              />
              <Button
                title="Skip (Mnemonic Only)"
                accessibilityLabel="Skip File Selection"
                testID={testIdWithKey('SkipFileSelectionButton')}
                buttonType={ButtonType.Secondary}
                onPress={handleSkipFile}
              />
            </View>
          </View>
        )

      case 'mnemonic':
        return (
          <View>
            <Text style={styles.title}>Enter Recovery Phrase</Text>
            <Text style={styles.description}>
              Enter your 12-word recovery phrase to restore your wallet.
            </Text>
            
            {backupFilePath && (
              <View style={styles.fileInfoContainer}>
                <Text style={styles.fileInfoText}>
                  Backup file: {backupFilePath.split('/').pop()}
                </Text>
              </View>
            )}

            <MnemonicInput
              words={words}
              onChange={setWords}
              onComplete={handleMnemonicComplete}
              showAutocomplete={true}
              autoFocus={true}
            />

            <TouchableOpacity
              style={styles.pasteButton}
              onPress={handlePasteFromClipboard}
              accessibilityLabel="Paste from Clipboard"
              testID={testIdWithKey('PasteFromClipboardButton')}
            >
              <Text style={styles.pasteButtonText}>
                📋 Paste from Clipboard
              </Text>
            </TouchableOpacity>
          </View>
        )

      case 'restoring':
        return (
          <View>
            <Text style={styles.title}>Restoring Wallet</Text>
            <Text style={styles.description}>
              Please wait while we restore your wallet. This may take a few moments.
            </Text>
            <View style={styles.restoreProgressContainer}>
              <ActivityIndicator size="large" color={ColorPalette.brand.primary} />
              {restoreStatus && (
                <Text style={styles.restoreProgressText}>
                  {getRestoreStatusMessage(restoreStatus)}
                </Text>
              )}
            </View>
          </View>
        )

      case 'pin':
        // PIN screen is handled by navigation
        return null

      case 'complete':
        return (
          <View>
            <Text style={styles.title}>Restore Complete</Text>
            <Text style={styles.description}>
              Your wallet has been restored successfully. You can now use your new PIN to access the wallet.
            </Text>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.progressContainer}>
          <ProgressIndicator
            steps={createSteps(stepLabels, currentStepIndex)}
            currentStep={currentStepIndex}
            showNumbers={true}
            compact={false}
          />
        </View>

        {renderStepContent()}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  )
}
