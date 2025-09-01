import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { ThemedText } from '../components/texts/ThemedText'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import FauxHeader from '../components/misc/FauxHeader'
import { useTheme } from '../contexts/theme'
import { loadMnemonic } from '../services/keychain'
import PINVerify, { PINEntryUsage } from './PINVerify'

const RecoveryPhrase: React.FC = () => {
  const { t } = useTranslation()
  const { ColorPalette, TextTheme } = useTheme()

  const [mnemonic, setMnemonic] = useState<string>('')
  const [showMnemonic, setShowMnemonic] = useState<boolean>(false)
  const [showPinVerification, setShowPinVerification] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPalette.brand.primaryBackground,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    headerText: {
      ...TextTheme.headingThree,
      textAlign: 'center',
      marginBottom: 20,
      color: ColorPalette.grayscale.black,
    },
    warningText: {
      ...TextTheme.normal,
      textAlign: 'center',
      marginBottom: 30,
      color: ColorPalette.semantic.error,
      paddingHorizontal: 10,
    },
    instructionText: {
      ...TextTheme.normal,
      textAlign: 'center',
      marginBottom: 30,
      color: ColorPalette.grayscale.mediumGrey,
    },
    mnemonicContainer: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 8,
      padding: 20,
      marginBottom: 30,
    },
    mnemonicGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    wordContainer: {
      width: '30%',
      backgroundColor: '#FFFFFF', // Force white background
      borderRadius: 6,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#CCCCCC', // Light gray border
      alignItems: 'center',
    },
    wordNumber: {
      fontSize: 10,
      color: '#666666', // Gray text
      textAlign: 'center',
    },
    wordText: {
      fontSize: 14,
      color: '#000000', // Force black text
      textAlign: 'center',
      fontWeight: 'bold',
    },
    buttonContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
  })

  const renderMnemonicWords = () => {
    if (!mnemonic) return null

    const words = mnemonic.split(' ')

    return (
      <View style={styles.mnemonicGrid}>
        {words.map((word, index) => (
          <View key={index} style={styles.wordContainer}>
            <ThemedText style={styles.wordNumber}>{index + 1}</ThemedText>
            <ThemedText style={styles.wordText}>{word}</ThemedText>
          </View>
        ))}
      </View>
    )
  }

  const handleRevealMnemonic = useCallback(() => {
    setShowPinVerification(true)
  }, [])

  const onAuthenticationComplete = useCallback(
    async (status: boolean) => {
      setShowPinVerification(false)

      if (status) {
        setIsLoading(true)
        try {
          const storedMnemonic = await loadMnemonic(t('RecoveryPhrase.Title'), t('RecoveryPhrase.Instructions'))

          if (storedMnemonic && storedMnemonic.length > 0) {
            setMnemonic(storedMnemonic)
            setShowMnemonic(true)
          } else {
            Alert.alert(t('RecoveryPhrase.Error'), t('RecoveryPhrase.NoMnemonicFound'), [{ text: t('Global.Okay') }])
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          Alert.alert(t('RecoveryPhrase.Error'), `${t('RecoveryPhrase.LoadError')} (${errorMessage})`, [
            { text: t('Global.Okay') },
          ])
        } finally {
          setIsLoading(false)
        }
      }
    },
    [t]
  )

  const onCancelAuth = useCallback(() => {
    setShowPinVerification(false)
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        {!showMnemonic ? (
          <>
            <ThemedText style={styles.headerText}>{t('RecoveryPhrase.RevealTitle')}</ThemedText>

            <ThemedText style={styles.warningText}>{t('RecoveryPhrase.SecurityWarning')}</ThemedText>

            <ThemedText style={styles.instructionText}>{t('RecoveryPhrase.Instructions')}</ThemedText>
          </>
        ) : (
          <>
            <ThemedText style={styles.headerText}>{t('RecoveryPhrase.YourRecoveryPhrase')}</ThemedText>

            <ThemedText style={styles.warningText}>{t('Mnemonic.WriteDownWarning')}</ThemedText>

            <View style={styles.mnemonicContainer}>{renderMnemonicWords()}</View>
          </>
        )}
      </View>

      {!showMnemonic && (
        <View style={styles.buttonContainer}>
          <Button
            title={t('RecoveryPhrase.RevealButton')}
            accessibilityLabel={t('RecoveryPhrase.RevealButton')}
            testID="RevealRecoveryPhraseButton"
            buttonType={ButtonType.Primary}
            onPress={handleRevealMnemonic}
            disabled={isLoading}
          />
        </View>
      )}

      <SafeAreaModal
        style={{ backgroundColor: ColorPalette.brand.primaryBackground }}
        visible={showPinVerification}
        transparent={false}
        animationType={'slide'}
        presentationStyle={'fullScreen'}
        statusBarTranslucent={true}
      >
        <SafeAreaView edges={['top']} style={{ backgroundColor: ColorPalette.brand.primary }} />
        <FauxHeader title={t('Screens.EnterPIN')} onBackPressed={onCancelAuth} />
        <PINVerify
          usage={PINEntryUsage.AccessRecoveryPhrase}
          setAuthenticated={onAuthenticationComplete}
          onCancelAuth={onCancelAuth}
        />
      </SafeAreaModal>
    </SafeAreaView>
  )
}

export default RecoveryPhrase
