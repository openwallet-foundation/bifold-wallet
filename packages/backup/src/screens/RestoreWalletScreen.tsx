/**
 * RestoreWalletScreen (Settings)
 *
 * Complete SSI-compliant wallet restore flow from Settings menu.
 *
 * Flow:
 * 1. Select backup file (optional - can skip for mnemonic-only restore)
 * 2. Enter 12-word recovery phrase with autocomplete
 * 3. Restore wallet with progress indicator
 * 4. Store mnemonic in keychain (no PIN required)
 *
 * Features:
 * - File picker for backup file selection
 * - MnemonicInput component with BIP39 validation
 * - Paste from clipboard support
 * - Progress indicator showing restore steps
 * - Direct mnemonic storage in keychain (PIN-independent)
 * - Comprehensive error handling
 */

import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { container } from 'tsyringe'
import Clipboard from '@react-native-clipboard/clipboard'
import type { StackScreenProps } from '@react-navigation/stack'

import { useTheme } from '../../../core/src/contexts/theme'
import { useStore } from '../../../core/src/contexts/store'
import { MnemonicInput } from '../../../core/src/components/MnemonicInput'
import { ProgressIndicator, createSteps } from '../../../core/src/components/ProgressIndicator'
import Button, { ButtonType } from '../../../core/src/components/buttons/Button'
import { isValidMnemonic, deriveWalletKeyFromMnemonic } from '../../../core/src/services/KeyDerivation'
import { storeMnemonicPlain } from '../../../core/src/services/MnemonicStorage'
import { BackupService, RestoreStatus } from '../services/BackupService'
import { SettingStackParams, Screens } from '../../../core/src/types/navigators'
import { testIdWithKey } from '../../../core/src/utils/testable'

type RestoreStep = 'file' | 'mnemonic' | 'restoring' | 'complete'

type Props = StackScreenProps<SettingStackParams, Screens.RestoreWallet>

export const RestoreWalletScreen: React.FC<Props> = ({ navigation }) => {
  const { ColorPalette, TextTheme } = useTheme()
  const { agent } = useAgent()
  const [store] = useStore()
  const [backupService] = useState(() => container.resolve(BackupService))

  const [step, setStep] = useState<RestoreStep>('file')
  const [backupFilePath, setBackupFilePath] = useState<string>('')
  const [words, setWords] = useState<string[]>(Array(12).fill(''))
  const [error, setError] = useState<string>('')
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatus | null>(null)

  const stepLabels = ['Select File', 'Enter Mnemonic', 'Complete']
  const currentStepIndex = stepLabels.indexOf(
    step === 'file' ? 'Select File' :
    step === 'mnemonic' ? 'Enter Mnemonic' :
    step === 'restoring' ? 'Enter Mnemonic' : // Show restoring in mnemonic step
    'Complete'
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
      setRestoreStatus(null)

      // Validate agent is available
      if (!agent) {
        throw new Error('Agent not initialized. Please restart the app and try again.')
      }

      // Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)

      // Get mediator URL from app configuration
      const mediatorUrl = store.preferences.selectedMediator

      if (backupFilePath) {
        // Restore from backup file with mnemonic
        // Re-validate agent before calling backup service
        if (!agent) {
          throw new Error('Agent not initialized. Please restart the app and try again.')
        }

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
        // Re-validate agent before wallet operations
        if (!agent) {
          throw new Error('Agent not initialized. Please restart the app and try again.')
        }

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

      // Store mnemonic in keychain (no PIN required for SSI-compliant restore)
      await storeMnemonicPlain(mnemonic)

      // Mark restore as complete
      setStep('complete')

      // Show success message
      Alert.alert(
        'Success',
        'Wallet restored successfully! Your recovery phrase has been stored securely.',
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
    } catch (err) {
      // Provide specific error messages based on failure type
      let errorMessage = 'Failed to restore wallet. Please try again.'

      if (err instanceof Error) {
        const errorLower = err.message.toLowerCase()

        if (errorLower.includes('agent')) {
          errorMessage = 'Agent initialization failed. Please restart the app and try again.'
        } else if (errorLower.includes('wallet') || errorLower.includes('decrypt')) {
          errorMessage = 'Failed to decrypt wallet. Please check your recovery phrase and try again.'
        } else if (errorLower.includes('backup') || errorLower.includes('file')) {
          errorMessage = 'Failed to read backup file. Please check the file and try again.'
        } else if (errorLower.includes('mediator') || errorLower.includes('connection')) {
          errorMessage = 'Failed to connect to mediator. Please check your network connection and try again.'
        } else if (errorLower.includes('mnemonic') || errorLower.includes('invalid')) {
          errorMessage = 'Invalid recovery phrase. Please check and try again.'
        }
      }

      setError(errorMessage)
      console.error('Failed to restore wallet:', err)

      // Clean up partial state on error
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

      case 'complete':
        return (
          <View>
            <Text style={styles.title}>Restore Complete</Text>
            <Text style={styles.description}>
              Your wallet has been restored successfully! Your recovery phrase has been stored securely and is ready to use.
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
