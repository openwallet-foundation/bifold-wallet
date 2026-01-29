/**
 * Mnemonic Display Component
 * 
 * Displays a 12-word BIP39 mnemonic phrase in a secure, user-friendly format.
 * Used during wallet creation and backup flows.
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { useTheme } from '../contexts/theme'

export interface MnemonicDisplayProps {
  /** The 12-word mnemonic phrase (space-separated) */
  mnemonic: string
  /** Optional title */
  title?: string
  /** Optional description/instructions */
  description?: string
  /** Show copy to clipboard button */
  showCopyButton?: boolean
  /** Show security warnings */
  showWarning?: boolean
  /** Require user confirmation before proceeding */
  requireConfirmation?: boolean
  /** Callback when user confirms they've saved the mnemonic */
  onConfirmed?: () => void
  /** Show blur effect until user reveals */
  showBlurEffect?: boolean
  /** Callback when continue button is pressed */
  onContinue?: () => void
}

/**
 * MnemonicDisplay Component
 */
export const MnemonicDisplay: React.FC<MnemonicDisplayProps> = ({
  mnemonic,
  title = 'Your Recovery Phrase',
  description = 'Write down these 12 words in order. You\'ll need them to recover your wallet if you lose access.',
  showCopyButton = true,
  showWarning = true,
  requireConfirmation = true,
  onConfirmed,
  showBlurEffect = false,
  onContinue,
}) => {
  const { ColorPalette, TextTheme } = useTheme()
  const [confirmed, setConfirmed] = useState(false)
  const [revealed, setRevealed] = useState(!showBlurEffect)

  const words = mnemonic.split(' ')

  if (words.length !== 12) {
    console.error('Invalid mnemonic: must be exactly 12 words')
    return null
  }

  const handleCopy = () => {
    Clipboard.setString(mnemonic)
    Alert.alert('Copied', 'Recovery phrase copied to clipboard')
  }

  const handleConfirmChange = (value: boolean) => {
    setConfirmed(value)
    if (value && onConfirmed) {
      onConfirmed()
    }
  }

  const handleContinue = () => {
    if (requireConfirmation && !confirmed) {
      Alert.alert('Confirmation Required', 'Please confirm you have written down your recovery phrase')
      return
    }
    if (onContinue) {
      onContinue()
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    title: {
      ...TextTheme.headingThree,
      color: ColorPalette.brand.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    description: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginBottom: 20,
      textAlign: 'center',
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
    },
    mnemonicContainer: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    mnemonicGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    wordCard: {
      width: '48%',
      backgroundColor: ColorPalette.brand.primaryBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: ColorPalette.grayscale.lightGrey,
    },
    wordNumber: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginRight: 8,
      minWidth: 24,
    },
    word: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primary,
      flex: 1,
    },
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
    },
    revealButton: {
      backgroundColor: ColorPalette.brand.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    revealButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primaryBackground,
    },
    copyButton: {
      backgroundColor: ColorPalette.brand.secondary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    copyButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primaryBackground,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: ColorPalette.brand.primary,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: ColorPalette.brand.primary,
    },
    checkboxLabel: {
      ...TextTheme.normal,
      color: ColorPalette.brand.primary,
      flex: 1,
    },
    continueButton: {
      backgroundColor: ColorPalette.brand.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    continueButtonDisabled: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
    },
    continueButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primaryBackground,
      fontSize: 16,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {showWarning && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ IMPORTANT:</Text>
          <Text style={styles.warningText}>• Write on paper, don't screenshot</Text>
          <Text style={styles.warningText}>• Store in a safe place</Text>
          <Text style={styles.warningText}>• Never share with anyone</Text>
          <Text style={styles.warningText}>• You'll need this to recover your wallet</Text>
        </View>
      )}

      <View style={styles.mnemonicContainer}>
        <View style={styles.mnemonicGrid}>
          {words.map((word, index) => (
            <View key={index} style={styles.wordCard}>
              <Text style={styles.wordNumber}>{index + 1}.</Text>
              <Text style={styles.word}>{word}</Text>
            </View>
          ))}
        </View>

        {!revealed && (
          <View style={styles.blurOverlay}>
            <TouchableOpacity
              style={styles.revealButton}
              onPress={() => setRevealed(true)}
            >
              <Text style={styles.revealButtonText}>👁️ Reveal Recovery Phrase</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showCopyButton && revealed && (
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Text style={styles.copyButtonText}>📋 Copy to Clipboard</Text>
        </TouchableOpacity>
      )}

      {requireConfirmation && revealed && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleConfirmChange(!confirmed)}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={{ color: 'white', fontSize: 16 }}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I have written down my recovery phrase
          </Text>
        </TouchableOpacity>
      )}

      {onContinue && (
        <TouchableOpacity
          style={[
            styles.continueButton,
            requireConfirmation && !confirmed && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={requireConfirmation && !confirmed}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}
