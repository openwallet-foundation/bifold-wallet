import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from '../../../core/src/contexts/theme'
import { testIdWithKey } from '../../../core/src/utils/testable'
import * as MnemonicStorage from '../../../core/src/services/MnemonicStorage'
import { MnemonicDisplay } from '../../../core/src/components/MnemonicDisplay'
import { SettingStackParams, Screens } from '../../../core/src/types/navigators'

type ViewRecoveryPhraseScreenNavigationProp = StackNavigationProp<SettingStackParams, Screens.ViewRecoveryPhrase>

type Step = 'loading' | 'display'

const ViewRecoveryPhraseScreen: React.FC = () => {
  const navigation = useNavigation<ViewRecoveryPhraseScreenNavigationProp>()
  const { ColorPalette, TextTheme } = useTheme()
  
  const [step, setStep] = useState<Step>('loading')
  const [mnemonic, setMnemonic] = useState<string>('')
  const [loading, setLoading] = useState(false)


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    scrollView: {
      padding: 20,
    },
    title: {
      ...TextTheme.headingTwo,
      color: ColorPalette.brand.primary,
      marginBottom: 10,
    },
    description: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginBottom: 30,
      lineHeight: 22,
    },
    warningBox: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      padding: 15,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: ColorPalette.notification.error,
      marginBottom: 30,
    },
    warningText: {
      ...TextTheme.normal,
      color: ColorPalette.notification.error,
      lineHeight: 20,
      marginBottom: 5,
    },
    button: {
      backgroundColor: ColorPalette.brand.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      ...TextTheme.bold,
      color: ColorPalette.grayscale.white,
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
          'Error',
          `Unable to load your recovery phrase. Please make sure you have authenticated with your PIN at least once.\n\nError: ${errorMessage}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        )
      }
    }

    loadMnemonic()
  }, [])

  const handleHide = () => {
    // Clear sensitive data and go back
    setMnemonic('')
    navigation.goBack()
  }

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

  // Step 2: Display Mnemonic
  if (step === 'display' && mnemonic) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Your Recovery Phrase</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ CRITICAL SECURITY WARNING</Text>
            <Text style={styles.warningText}>• Never share your recovery phrase with anyone!</Text>
            <Text style={styles.warningText}>• Anyone with this phrase can access your wallet</Text>
            <Text style={styles.warningText}>• Make sure no one is watching your screen</Text>
            <Text style={styles.warningText}>• Store it securely offline</Text>
          </View>

          <MnemonicDisplay
            mnemonic={mnemonic}
            showCopyButton={true}
            requireConfirmation={false}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleHide}
            accessibilityLabel="Hide recovery phrase button"
            accessibilityHint="Hides the recovery phrase and returns to previous screen"
            testID={testIdWithKey('HideMnemonicButton')}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  return null
}

export { ViewRecoveryPhraseScreen }
export default ViewRecoveryPhraseScreen
