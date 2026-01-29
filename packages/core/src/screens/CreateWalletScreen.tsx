import { useAgent } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { MnemonicDisplay } from '../components/MnemonicDisplay'
import { MnemonicVerification } from '../components/MnemonicVerification'
import { ProgressIndicator, StepStatus } from '../components/ProgressIndicator'
import { useTheme } from '../contexts/theme'
import { deriveWalletKeyFromMnemonic, generateWalletMnemonic } from '../services/KeyDerivation'
import { encryptMnemonic, storeMnemonicInKeychain } from '../services/MnemonicStorage'
import { OnboardingStackParams, Screens } from '../types/navigators'

type CreateWalletStep = 'generate' | 'display' | 'verify' | 'creating' | 'pin' | 'complete'

const CreateWalletScreen: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const { ColorPalette, TextTheme } = useTheme()
  const { agent } = useAgent()

  const [step, setStep] = useState<CreateWalletStep>('generate')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [error, setError] = useState<string>('')

  const getStepStatus = (stepId: string): StepStatus => {
    const stepOrder = ['generate', 'display', 'verify', 'creating', 'pin']
    const currentIndex = stepOrder.indexOf(step)
    const stepIndex = stepOrder.indexOf(stepId)

    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'in-progress'
    return 'pending'
  }

  const steps = [
    { label: t('CreateWallet.Steps.Generate'), status: getStepStatus('generate') },
    { label: t('CreateWallet.Steps.Display'), status: getStepStatus('display') },
    { label: t('CreateWallet.Steps.Verify'), status: getStepStatus('verify') },
    { label: t('CreateWallet.Steps.Creating'), status: getStepStatus('creating') },
    { label: t('CreateWallet.Steps.SetPIN'), status: getStepStatus('pin') },
  ]

  const getCurrentStepIndex = () => {
    const stepOrder = ['generate', 'display', 'verify', 'creating', 'pin']
    return stepOrder.indexOf(step)
  }

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
    buttonContainer: {
      marginTop: 24,
      gap: 12,
    },
    button: {
      width: '100%',
    },
    errorText: {
      ...TextTheme.normal,
      color: ColorPalette.semantic.error,
      marginTop: 12,
      textAlign: 'center',
    },
  })

  const handleGenerateMnemonic = () => {
    try {
      const newMnemonic = generateWalletMnemonic()
      setMnemonic(newMnemonic)
      setStep('display')
      setError('')
    } catch (err) {
      setError(t('CreateWallet.Errors.GenerateFailed'))
      console.error('Failed to generate mnemonic:', err)
    }
  }

  const handleMnemonicDisplayed = () => {
    setStep('verify')
  }

  const handleMnemonicVerified = async () => {
    try {
      setStep('creating')

      if (!agent) {
        throw new Error('Agent not initialized')
      }

      // Derive wallet key from mnemonic
      const walletKey = deriveWalletKeyFromMnemonic(mnemonic)

      // Create wallet with derived key
      await agent.wallet.create({
        id: 'main',
        key: walletKey,
      })

      await agent.wallet.open({
        id: 'main',
        key: walletKey,
      })

      await agent.initialize()

      // Navigate to PIN setup
      setStep('pin')
      navigation.navigate(Screens.CreatePIN, {
        mnemonic,
        isCreatingWallet: true,
        setAuthenticated: () => {}, // Placeholder, will be set by PINCreate screen
      })
    } catch (err) {
      setError(t('CreateWallet.Errors.CreateFailed'))
      console.error('Failed to create wallet:', err)
      setStep('verify')
    }
  }

  const handleVerificationFailed = () => {
    Alert.alert(
      t('CreateWallet.VerificationFailed.Title'),
      t('CreateWallet.VerificationFailed.Message'),
      [
        {
          text: t('CreateWallet.VerificationFailed.TryAgain'),
          onPress: () => setStep('display'),
        },
        {
          text: t('CreateWallet.VerificationFailed.Cancel'),
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ]
    )
  }

  const renderStepContent = () => {
    switch (step) {
      case 'generate':
        return (
          <View>
            <Text style={styles.title}>{t('CreateWallet.Generate.Title')}</Text>
            <Text style={styles.description}>{t('CreateWallet.Generate.Description')}</Text>
            <View style={styles.buttonContainer}>
              <Button
                title={t('CreateWallet.Generate.Button')}
                accessibilityLabel={t('CreateWallet.Generate.Button')}
                testID="GenerateMnemonicButton"
                buttonType={ButtonType.Primary}
                onPress={handleGenerateMnemonic}
              />
            </View>
          </View>
        )

      case 'display':
        return (
          <View>
            <Text style={styles.title}>{t('CreateWallet.Display.Title')}</Text>
            <Text style={styles.description}>{t('CreateWallet.Display.Description')}</Text>
            <MnemonicDisplay mnemonic={mnemonic} onConfirmed={handleMnemonicDisplayed} />
          </View>
        )

      case 'verify':
        return (
          <View>
            <Text style={styles.title}>{t('CreateWallet.Verify.Title')}</Text>
            <Text style={styles.description}>{t('CreateWallet.Verify.Description')}</Text>
            <MnemonicVerification
              mnemonic={mnemonic}
              onVerified={handleMnemonicVerified}
              onFailed={handleVerificationFailed}
            />
          </View>
        )

      case 'creating':
        return (
          <View>
            <Text style={styles.title}>{t('CreateWallet.Creating.Title')}</Text>
            <Text style={styles.description}>{t('CreateWallet.Creating.Description')}</Text>
          </View>
        )

      case 'pin':
        // PIN screen is handled by navigation
        return null

      case 'complete':
        return (
          <View>
            <Text style={styles.title}>{t('CreateWallet.Complete.Title')}</Text>
            <Text style={styles.description}>{t('CreateWallet.Complete.Description')}</Text>
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
          <ProgressIndicator steps={steps} currentStep={getCurrentStepIndex()} />
        </View>

        {renderStepContent()}

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  )
}

export default CreateWalletScreen
