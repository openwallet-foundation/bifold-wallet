import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import MnemonicDisplay from '../components/misc/MnemonicDisplay'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { useTheme } from '../contexts/theme'
import { generateMnemonicPhrase } from '../utils/mnemonics'

const MnemonicSet: React.FC = () => {
  const { ColorPalette } = useTheme()
  const { t } = useTranslation()
  const [, dispatch] = useStore()

  const [hasSeenMnemonic, setHasSeenMnemonic] = useState(false)
  const [currentMnemonic, setCurrentMnemonic] = useState<string>('')
  const [isRevealed, setIsRevealed] = useState(false)

  // Generate a new 24-word mnemonic on component load
  const [generatedMnemonic] = useState(() => generateMnemonicPhrase())
  const mnemonicWords = generatedMnemonic.split(' ')

  const handleMnemonicRevealed = useCallback(() => {
    setHasSeenMnemonic(true)
    setIsRevealed(true)
    if (!currentMnemonic) {
      setCurrentMnemonic(generatedMnemonic)
    }
  }, [generatedMnemonic, currentMnemonic])

  const handleMnemonicSet = useCallback((importedMnemonic: string) => {
    setCurrentMnemonic(importedMnemonic)
    setHasSeenMnemonic(true)
    setIsRevealed(true)
  }, [])

  const handleContinue = useCallback(() => {
    // Store the mnemonic (generated or imported) in the app state
    dispatch({
      type: DispatchAction.DID_SET_MNEMONIC,
      payload: [{ didSetMnemonic: true, mnemonic: currentMnemonic }],
    })
  }, [dispatch, currentMnemonic])

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
      padding: 20,
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
    continueButton: {
      backgroundColor: ColorPalette.brand.primary,
      padding: 16,
      borderRadius: 8,
      marginTop: 20,
    },
    continueButtonDisabled: {
      backgroundColor: ColorPalette.grayscale.mediumGrey,
      opacity: 0.5,
    },
    continueButtonText: {
      color: ColorPalette.grayscale.white,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Screens.SetMnemonics')}</Text>

      <MnemonicDisplay
        mnemonicWords={mnemonicWords}
        onReveal={handleMnemonicRevealed}
        onMnemonicSet={handleMnemonicSet}
      />

      {isRevealed && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{t('Mnemonic.WriteDownWarning')}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.continueButton, !hasSeenMnemonic && styles.continueButtonDisabled]}
        onPress={handleContinue}
        activeOpacity={0.7}
        disabled={!hasSeenMnemonic}
      >
        <Text style={styles.continueButtonText}>{t('Global.Continue')}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default MnemonicSet
