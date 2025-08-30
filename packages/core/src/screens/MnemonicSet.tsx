import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'

import MnemonicDisplay from '../components/misc/MnemonicDisplay'
import KeyboardView from '../components/views/KeyboardView'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { useTheme } from '../contexts/theme'
import { OnboardingStackParams, Screens } from '../types/navigators'
import { generateMnemonicPhrase } from '../utils/mnemonics'
import { storeMnemonic } from '../services/keychain'

const MnemonicSet: React.FC = () => {
  const { ColorPalette } = useTheme()
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()

  const [isLoading, setIsLoading] = useState(false)

  // Generate a new 24-word mnemonic on component load
  const [generatedMnemonic] = useState(() => generateMnemonicPhrase())
  const mnemonicWords = generatedMnemonic.split(' ')

  const handleContinue = async (mnemonic: string) => {
    setIsLoading(true)
    try {
      // Store mnemonic securely using the user's biometry preference
      // After biometrics screen, user may have enabled or disabled biometrics
      const useBiometry = store.preferences.useBiometry
      const success = await storeMnemonic(mnemonic, useBiometry)

      if (!success) {
        throw new Error('Keychain storage returned false')
      }

      // Store the mnemonic completion status
      dispatch({
        type: DispatchAction.DID_SET_MNEMONIC,
      })
      // Navigate to next screen in onboarding flow
      navigation.navigate(Screens.Onboarding)
    } catch (error: any) {
      // Create detailed debug information for the alert
      const debugInfo = [
        `Message: ${error.message || 'unknown'}`,
        `Code: ${error.code || 'unknown'}`,
        `Type: ${error.constructor?.name || 'unknown'}`,
        `Stack: ${error.stack?.split('\n')[0] || 'unknown'}`,
      ].join('\n')

      let errorMessage = 'Failed to securely store your recovery phrase. Please try again.'

      if (error.message.includes('UserCancel')) {
        errorMessage = 'Authentication was cancelled. Your recovery phrase was not saved.'
      } else if (error.message.includes('BiometryNotAvailable')) {
        errorMessage =
          'Biometric authentication is not available. Your recovery phrase was stored with device security.'
      } else if (error.message.includes('BiometryNotEnrolled')) {
        errorMessage = 'Biometric authentication is not set up. Your recovery phrase was stored with device security.'
      } else if (error.message === 'Keychain storage returned false') {
        errorMessage = 'Keychain storage failed. Please check your device security settings and try again.'
      } else {
        // For debugging - include the actual error message
        errorMessage = `DEBUG INFO:\n${debugInfo}\n\nPlease share this with the developer.`
      }

      Alert.alert('Error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    warningContainer: {
      backgroundColor: ColorPalette.notification.warn + '20',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: ColorPalette.notification.warn,
    },
    warningText: {
      fontSize: 14,
      color: ColorPalette.notification.warnText,
      fontWeight: '500',
      textAlign: 'center',
    },
    controlsContainer: {
      marginTop: 20,
    },
  })

  return (
    <KeyboardView keyboardAvoiding={false}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{t('Screens.SetMnemonics')}</Text>

          <MnemonicDisplay
            mnemonicWords={mnemonicWords}
            generatedMnemonic={generatedMnemonic}
            isLoading={isLoading}
            onContinue={handleContinue}
          />
        </View>
      </View>
    </KeyboardView>
  )
}

export default MnemonicSet
