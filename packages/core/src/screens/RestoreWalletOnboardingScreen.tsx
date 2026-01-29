import { useAgent } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import DocumentPicker from 'react-native-document-picker'

import Button, { ButtonType } from '../components/buttons/Button'
import { MnemonicInput } from '../components/MnemonicInput'
import { ProgressIndicator } from '../components/ProgressIndicator'
import { useTheme } from '../contexts/theme'
import { deriveWalletKeyFromMnemonic, isValidMnemonic } from '../services/KeyDerivation'
import { OnboardingStackParams } from '../types/navigators'

type RestoreStep = 'file' | 'mnemonic' | 'restoring' | 'pin' | 'complete'

const RestoreWalletOnboardingScreen: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const { ColorPalette, TextTheme } = useTheme()
  const { agent } = useAgent()

  const [step, setStep] = useState<RestoreStep>('file')
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [backupFilePath, setBackupFilePath] = useState<string>('')
  const [mnemonicWords, setMnemonicWords] = useState<string[]>(Array(12).fill(''))
  const [error, setError] = useState<string>('')

  const stepLabels = [
    t('RestoreWallet.Steps.SelectFile'),
    t('RestoreWallet.Steps.EnterMnemonic'),
    t('RestoreWallet.Steps.Restoring'),
    t('RestoreWallet.Steps.SetPIN'),
  ]

  const steps = stepLabels.map((label, index) => {
    let status: 'pending' | 'in-progress' | 'complete' | 'error' = 'pending'
    
    if (index < currentStepIndex) {
      status = 'complete'
    } else if (index === currentStepIndex) {
      status = error ? 'error' : 'in-progress'
    }
    
    return { label, status }
  })

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
  })

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.zip, DocumentPicker.types.allFiles],
      })

      if (result && result[0]) {
        setBackupFilePath(result[0].uri)
        setStep('mnemonic')
        setCurrentStepIndex(1)
        setError('')
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        setError(t('RestoreWallet.Errors.FilePickerFailed') as string)
        console.error('Failed to pick file:', err)
      }
    }
  }

  const handleSkipFile = () => {
    // Allow user to proceed with just mnemonic (for mnemonic-only restore)
    setStep('mnemonic')
    setCurrentStepIndex(1)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString()
      if (clipboardContent) {
        const words = clipboardContent.trim().split(/\s+/)
        if (words.length === 12) {
          setMnemonicWords(words)
        } else {
          Alert.alert(
            t('RestoreWallet.PasteError.Title') as string,
            t('RestoreWallet.PasteError.InvalidFormat') as string
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
        setError(t('RestoreWallet.Errors.InvalidMnemonic') as string)
        return
      }

      setStep('restoring')
      setCurrentStepIndex(2)
      setError('')

      if (!agent) {
        throw new Error('Agent not initialized')
      }

      // Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)

      if (backupFilePath) {
        // Restore from backup file
        // TODO: Implement backup restore service integration
        // await backupService.restoreWalletComplete(agent, backupFilePath, mnemonic, ...)
        
        // For now, just create a new wallet with the derived key
        await agent.wallet.create({
          id: 'main',
          key: walletKey,
        })
      } else {
        // Create new wallet with mnemonic-derived key (mnemonic-only restore)
        await agent.wallet.create({
          id: 'main',
          key: walletKey,
        })
      }

      await agent.wallet.open({
        id: 'main',
        key: walletKey,
      })

      await agent.initialize()

      // Navigate to PIN setup
      setStep('pin')
      setCurrentStepIndex(3)
      navigation.navigate('PINCreate' as any, {
        mnemonic,
        isRestoringWallet: true,
      } as any)
    } catch (err) {
      setError(t('RestoreWallet.Errors.RestoreFailed') as string)
      console.error('Failed to restore wallet:', err)
      setStep('mnemonic')
      setCurrentStepIndex(1)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 'file':
        return (
          <View>
            <Text style={styles.title}>{t('RestoreWallet.File.Title')}</Text>
            <Text style={styles.description}>{t('RestoreWallet.File.Description')}</Text>
            <View style={styles.buttonContainer}>
              <Button
                title={t('RestoreWallet.File.SelectButton')}
                accessibilityLabel={t('RestoreWallet.File.SelectButton')}
                testID="SelectBackupFileButton"
                buttonType={ButtonType.Primary}
                onPress={handleSelectFile}
              />
              <Button
                title={t('RestoreWallet.File.SkipButton')}
                accessibilityLabel={t('RestoreWallet.File.SkipButton')}
                testID="SkipFileSelectionButton"
                buttonType={ButtonType.Secondary}
                onPress={handleSkipFile}
              />
            </View>
          </View>
        )

      case 'mnemonic':
        return (
          <View>
            <Text style={styles.title}>{t('RestoreWallet.Mnemonic.Title')}</Text>
            <Text style={styles.description}>{t('RestoreWallet.Mnemonic.Description')}</Text>
            
            {backupFilePath && (
              <View style={styles.fileInfoContainer}>
                <Text style={styles.fileInfoText}>
                  {t('RestoreWallet.Mnemonic.FileSelected')}: {backupFilePath.split('/').pop()}
                </Text>
              </View>
            )}

            <MnemonicInput 
              words={mnemonicWords} 
              onChange={setMnemonicWords} 
              onComplete={handleMnemonicComplete}
            />

            <TouchableOpacity
              style={styles.pasteButton}
              onPress={handlePasteFromClipboard}
              accessibilityLabel={t('RestoreWallet.Mnemonic.PasteButton')}
              testID="PasteFromClipboardButton"
            >
              <Text style={styles.pasteButtonText}>
                {t('RestoreWallet.Mnemonic.PasteButton')}
              </Text>
            </TouchableOpacity>
          </View>
        )

      case 'restoring':
        return (
          <View>
            <Text style={styles.title}>{t('RestoreWallet.Restoring.Title')}</Text>
            <Text style={styles.description}>{t('RestoreWallet.Restoring.Description')}</Text>
          </View>
        )

      case 'pin':
        // PIN screen is handled by navigation
        return null

      case 'complete':
        return (
          <View>
            <Text style={styles.title}>{t('RestoreWallet.Complete.Title')}</Text>
            <Text style={styles.description}>{t('RestoreWallet.Complete.Description')}</Text>
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
          <ProgressIndicator steps={steps} currentStep={currentStepIndex} />
        </View>

        {renderStepContent()}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  )
}

export default RestoreWalletOnboardingScreen
