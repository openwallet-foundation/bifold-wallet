import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../../contexts/theme'
import { validateMnemonicPhrase } from '../../utils/mnemonics'

type MnemonicMode = 'generate' | 'import'

interface MnemonicDisplayProps {
  mnemonicWords: string[]
  onReveal?: () => void
  onMnemonicSet?: (mnemonic: string) => void
}

const MnemonicDisplay: React.FC<MnemonicDisplayProps> = ({ mnemonicWords, onReveal, onMnemonicSet }) => {
  const { ColorPalette } = useTheme()
  const { t } = useTranslation()
  const [mode, setMode] = useState<MnemonicMode>('generate')
  const [isRevealed, setIsRevealed] = useState(false)
  const [importedMnemonic, setImportedMnemonic] = useState('')
  const [isValidMnemonic, setIsValidMnemonic] = useState(false)

  const handleReveal = useCallback(() => {
    setIsRevealed(true)
    onReveal?.()
  }, [onReveal])

  const handleModeSwitch = useCallback((newMode: MnemonicMode) => {
    setMode(newMode)
    setIsRevealed(false)
    setImportedMnemonic('')
    setIsValidMnemonic(false)
  }, [])

  const handleImportedMnemonicChange = useCallback(
    (text: string) => {
      setImportedMnemonic(text)

      // Use the proper validation function
      const isValid = validateMnemonicPhrase(text)
      setIsValidMnemonic(isValid)

      if (isValid) {
        onMnemonicSet?.(text.trim())
        onReveal?.()
      }
    },
    [onMnemonicSet, onReveal]
  )

  const getDisplayWords = useCallback(() => {
    if (mode === 'import' && importedMnemonic) {
      return importedMnemonic.trim().split(/\s+/)
    }
    return mnemonicWords
  }, [mode, importedMnemonic, mnemonicWords])

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPalette.grayscale.white,
      borderRadius: 12,
      padding: 16,
      minHeight: 200,
      marginVertical: 20,
    },
    modeSelector: {
      flexDirection: 'row',
      marginBottom: 20,
      borderRadius: 8,
      backgroundColor: ColorPalette.grayscale.lightGrey,
      padding: 4,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
      minHeight: 36,
    },
    modeButtonActive: {
      backgroundColor: ColorPalette.brand.primary,
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: ColorPalette.grayscale.darkGrey,
    },
    modeButtonTextActive: {
      color: ColorPalette.grayscale.white,
    },
    contentContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 160,
    },
    revealButton: {
      backgroundColor: ColorPalette.brand.primary,
      padding: 16,
      borderRadius: 8,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    revealButtonText: {
      color: ColorPalette.grayscale.white,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginRight: 8,
    },
    importContainer: {
      width: '100%',
    },
    importLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
      textAlign: 'center',
    },
    importTextInput: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: ColorPalette.grayscale.mediumGrey,
    },
    importTextInputValid: {
      borderColor: ColorPalette.semantic.success,
    },
    validationText: {
      fontSize: 12,
      marginTop: 8,
      textAlign: 'center',
    },
    validationSuccess: {
      color: ColorPalette.semantic.success,
    },
    validationError: {
      color: ColorPalette.semantic.error,
    },
    wordGrid: {
      width: '100%',
    },
    wordRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    wordItem: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
      borderRadius: 6,
      padding: 8,
      minWidth: 70,
      alignItems: 'center',
    },
    wordNumber: {
      fontSize: 10,
      color: ColorPalette.grayscale.mediumGrey,
      marginBottom: 2,
    },
    wordText: {
      fontSize: 12,
      fontWeight: '500',
    },
    warningText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      color: ColorPalette.grayscale.mediumGrey,
    },
  })

  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'generate' && styles.modeButtonActive]}
          onPress={() => handleModeSwitch('generate')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeButtonText, mode === 'generate' && styles.modeButtonTextActive]}>Generate New</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'import' && styles.modeButtonActive]}
          onPress={() => handleModeSwitch('import')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modeButtonText, mode === 'import' && styles.modeButtonTextActive]}>Import Existing</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {mode === 'generate' ? (
        <View style={styles.contentContainer}>
          {!isRevealed ? (
            <>
              <Text style={styles.warningText}>{t('Mnemonic.RevealWarning')}</Text>
              <TouchableOpacity style={styles.revealButton} onPress={handleReveal} activeOpacity={0.7}>
                <Text style={styles.revealButtonText}>{t('Mnemonic.RevealButton')}</Text>
                <Icon name="visibility" size={20} color={ColorPalette.grayscale.white} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.wordGrid}>
              {Array.from({ length: Math.ceil(mnemonicWords.length / 4) }, (_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.wordRow}>
                  {Array.from({ length: 4 }, (_, colIndex) => {
                    const wordIndex = rowIndex * 4 + colIndex
                    const word = mnemonicWords[wordIndex]
                    if (!word) return <View key={`empty-${wordIndex}`} style={{ minWidth: 70 }} />
                    return (
                      <View key={`word-${wordIndex}`} style={styles.wordItem}>
                        <Text style={styles.wordNumber}>{wordIndex + 1}</Text>
                        <Text style={styles.wordText}>{word}</Text>
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.importContainer}>
          <Text style={styles.importLabel}>Enter your 12 or 24 word recovery phrase:</Text>
          <TextInput
            style={[styles.importTextInput, isValidMnemonic && styles.importTextInputValid]}
            value={importedMnemonic}
            onChangeText={handleImportedMnemonicChange}
            placeholder="Enter words separated by spaces..."
            placeholderTextColor={ColorPalette.grayscale.mediumGrey}
            multiline
            numberOfLines={6}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
          />
          {importedMnemonic.length > 0 && (
            <Text style={[styles.validationText, isValidMnemonic ? styles.validationSuccess : styles.validationError]}>
              {isValidMnemonic
                ? `✓ Valid ${importedMnemonic.trim().split(/\s+/).length} word mnemonic`
                : `❌ Please enter exactly 12 or 24 words (currently ${
                    importedMnemonic.trim().split(/\s+/).length
                  } words)`}
            </Text>
          )}

          {isValidMnemonic && (
            <View style={styles.wordGrid}>
              {Array.from({ length: Math.ceil(getDisplayWords().length / 4) }, (_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.wordRow}>
                  {Array.from({ length: 4 }, (_, colIndex) => {
                    const wordIndex = rowIndex * 4 + colIndex
                    const word = getDisplayWords()[wordIndex]
                    if (!word) return <View key={`empty-${wordIndex}`} style={{ minWidth: 70 }} />
                    return (
                      <View key={`word-${wordIndex}`} style={styles.wordItem}>
                        <Text style={styles.wordNumber}>{wordIndex + 1}</Text>
                        <Text style={styles.wordText}>{word}</Text>
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default MnemonicDisplay
