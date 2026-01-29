/**
 * Mnemonic Input Component
 * 
 * Allows users to input a 12-word BIP39 mnemonic phrase for wallet restoration.
 * Features auto-complete, validation, and paste support.
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { validateMnemonic } from 'bip39'
import { useTheme } from '../contexts/theme'

// BIP39 wordlist (first 100 words for autocomplete demo)
const BIP39_WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb',
  'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse',
  'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action',
  'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address',
  'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair',
  'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim',
  'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  // ... (in production, import full BIP39 wordlist)
]

export interface MnemonicInputProps {
  /** Current words array (12 elements) */
  words: string[]
  /** Callback when words change */
  onChange: (words: string[]) => void
  /** Show autocomplete suggestions */
  showAutocomplete?: boolean
  /** Auto-focus first field */
  autoFocus?: boolean
  /** Callback when all words are valid */
  onComplete?: (mnemonic: string) => void
}

/**
 * MnemonicInput Component
 */
export const MnemonicInput: React.FC<MnemonicInputProps> = ({
  words,
  onChange,
  showAutocomplete = true,
  autoFocus = true,
  onComplete,
}) => {
  const { ColorPalette, TextTheme } = useTheme()
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRefs = useRef<Array<TextInput | null>>([])

  useEffect(() => {
    // Check if all words are valid
    if (words.every(w => w.length > 0)) {
      const mnemonic = words.join(' ')
      if (validateMnemonic(mnemonic) && onComplete) {
        onComplete(mnemonic)
      }
    }
  }, [words, onComplete])

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words]
    newWords[index] = value.toLowerCase().trim()
    onChange(newWords)

    // Update autocomplete suggestions
    if (showAutocomplete && value.length > 0) {
      const matches = BIP39_WORDLIST.filter(word =>
        word.startsWith(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }

    // Auto-focus next field if word is valid
    if (BIP39_WORDLIST.includes(value.toLowerCase()) && index < 11) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    if (focusedIndex !== null) {
      const newWords = [...words]
      newWords[focusedIndex] = suggestion
      onChange(newWords)
      setSuggestions([])

      // Auto-focus next field
      if (focusedIndex < 11) {
        inputRefs.current[focusedIndex + 1]?.focus()
      }
    }
  }

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString()
      const pastedWords = text.trim().split(/\s+/)

      if (pastedWords.length === 12) {
        // Validate all words
        const allValid = pastedWords.every(word =>
          BIP39_WORDLIST.includes(word.toLowerCase())
        )

        if (allValid) {
          onChange(pastedWords.map(w => w.toLowerCase()))
          Alert.alert('Success', 'Recovery phrase pasted successfully')
        } else {
          Alert.alert('Invalid Words', 'Some words are not in the BIP39 wordlist')
        }
      } else {
        Alert.alert('Invalid Format', 'Please paste exactly 12 words')
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard')
    }
  }

  const isWordValid = (word: string): boolean => {
    return word.length > 0 && BIP39_WORDLIST.includes(word.toLowerCase())
  }

  const getMnemonicStatus = (): 'empty' | 'incomplete' | 'invalid' | 'valid' => {
    if (words.every(w => w.length === 0)) return 'empty'
    if (words.some(w => w.length === 0)) return 'incomplete'
    
    const mnemonic = words.join(' ')
    return validateMnemonic(mnemonic) ? 'valid' : 'invalid'
  }

  const status = getMnemonicStatus()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    inputGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    inputContainer: {
      width: '48%',
      marginBottom: 12,
    },
    inputLabel: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginBottom: 4,
      fontSize: 12,
    },
    input: {
      ...TextTheme.normal,
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: ColorPalette.grayscale.lightGrey,
      color: ColorPalette.brand.primary,
    },
    inputFocused: {
      borderColor: ColorPalette.brand.primary,
    },
    inputValid: {
      borderColor: ColorPalette.notification.success,
    },
    inputInvalid: {
      borderColor: ColorPalette.notification.error,
    },
    suggestionsContainer: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 8,
      marginTop: -8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: ColorPalette.grayscale.lightGrey,
      maxHeight: 150,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: ColorPalette.grayscale.lightGrey,
    },
    suggestionText: {
      ...TextTheme.normal,
      color: ColorPalette.brand.primary,
    },
    pasteButton: {
      backgroundColor: ColorPalette.brand.secondary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    pasteButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primaryBackground,
    },
    statusContainer: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    statusEmpty: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
    },
    statusIncomplete: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
    },
    statusInvalid: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
    },
    statusValid: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
    },
    statusText: {
      ...TextTheme.normal,
      textAlign: 'center',
    },
    statusTextEmpty: {
      color: ColorPalette.grayscale.mediumGrey,
    },
    statusTextIncomplete: {
      color: ColorPalette.notification.infoText,
    },
    statusTextInvalid: {
      color: ColorPalette.notification.errorText,
    },
    statusTextValid: {
      color: ColorPalette.notification.successText,
    },
  })

  const getStatusMessage = (): string => {
    switch (status) {
      case 'empty':
        return 'Enter your 12-word recovery phrase'
      case 'incomplete':
        return `${words.filter(w => w.length > 0).length}/12 words entered`
      case 'invalid':
        return '❌ Invalid recovery phrase (checksum failed)'
      case 'valid':
        return '✅ Valid recovery phrase'
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
        <Text style={styles.pasteButtonText}>📋 Paste from Clipboard</Text>
      </TouchableOpacity>

      <View style={styles.inputGrid}>
        {words.map((word, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Word {index + 1}</Text>
            <TextInput
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.input,
                focusedIndex === index && styles.inputFocused,
                word.length > 0 && isWordValid(word) && styles.inputValid,
                word.length > 0 && !isWordValid(word) && styles.inputInvalid,
              ]}
              value={word}
              onChangeText={value => handleWordChange(index, value)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => {
                setFocusedIndex(null)
                setSuggestions([])
              }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              placeholder={`Word ${index + 1}`}
              placeholderTextColor={ColorPalette.grayscale.mediumGrey}
            />
          </View>
        ))}
      </View>

      {suggestions.length > 0 && focusedIndex !== null && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View
        style={[
          styles.statusContainer,
          status === 'empty' && styles.statusEmpty,
          status === 'incomplete' && styles.statusIncomplete,
          status === 'invalid' && styles.statusInvalid,
          status === 'valid' && styles.statusValid,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            status === 'empty' && styles.statusTextEmpty,
            status === 'incomplete' && styles.statusTextIncomplete,
            status === 'invalid' && styles.statusTextInvalid,
            status === 'valid' && styles.statusTextValid,
          ]}
        >
          {getStatusMessage()}
        </Text>
      </View>
    </View>
  )
}
