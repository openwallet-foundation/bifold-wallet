/**
 * Mnemonic Verification Component
 * 
 * Verifies that the user has correctly written down their recovery phrase
 * by asking them to select 3 random words from multiple choice options.
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { useTheme } from '../contexts/theme'

export interface MnemonicVerificationProps {
  /** The 12-word mnemonic phrase (space-separated) */
  mnemonic: string
  /** Number of words to verify (default: 3) */
  wordsToVerify?: number
  /** Maximum number of attempts (default: 3) */
  maxAttempts?: number
  /** Callback when verification succeeds */
  onVerified: () => void
  /** Callback when verification fails (max attempts reached) */
  onFailed?: () => void
  /** Callback when user goes back */
  onBack?: () => void
}

interface VerificationQuestion {
  position: number
  correctWord: string
  options: string[]
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Generate verification questions
 */
function generateQuestions(
  mnemonic: string,
  count: number
): VerificationQuestion[] {
  const words = mnemonic.split(' ')
  
  // Select random positions
  const positions = shuffle(Array.from({ length: 12 }, (_, i) => i))
    .slice(0, count)
    .sort((a, b) => a - b)

  // BIP39 wordlist sample for generating wrong options
  const bip39Words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb',
    'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse',
    'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action',
    'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address',
    'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair',
    'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim',
    'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  ]

  return positions.map(pos => {
    const correctWord = words[pos]
    
    // Generate 3 wrong options
    const wrongOptions = bip39Words
      .filter(w => w !== correctWord && !words.includes(w))
      .slice(0, 3)
    
    // Combine and shuffle
    const options = shuffle([correctWord, ...wrongOptions])

    return {
      position: pos,
      correctWord,
      options,
    }
  })
}

/**
 * MnemonicVerification Component
 */
export const MnemonicVerification: React.FC<MnemonicVerificationProps> = ({
  mnemonic,
  wordsToVerify = 3,
  maxAttempts = 3,
  onVerified,
  onFailed,
  onBack,
}) => {
  const { ColorPalette, TextTheme } = useTheme()
  const [questions, setQuestions] = useState<VerificationQuestion[]>([])
  const [selectedWords, setSelectedWords] = useState<Record<number, string>>({})
  const [attempts, setAttempts] = useState(maxAttempts)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    // Generate questions on mount
    setQuestions(generateQuestions(mnemonic, wordsToVerify))
  }, [mnemonic, wordsToVerify])

  const handleSelectWord = (position: number, word: string) => {
    setSelectedWords(prev => ({
      ...prev,
      [position]: word,
    }))
  }

  const handleVerify = () => {
    setIsVerifying(true)

    // Check if all words are correct
    const allCorrect = questions.every(
      q => selectedWords[q.position] === q.correctWord
    )

    if (allCorrect) {
      // Success!
      Alert.alert(
        'Verification Successful',
        'You have correctly verified your recovery phrase.',
        [{ text: 'Continue', onPress: onVerified }]
      )
    } else {
      // Wrong answer
      const newAttempts = attempts - 1
      setAttempts(newAttempts)

      if (newAttempts <= 0) {
        // Max attempts reached
        Alert.alert(
          'Verification Failed',
          'You have reached the maximum number of attempts. Please review your recovery phrase again.',
          [
            {
              text: 'Review Phrase',
              onPress: () => {
                if (onFailed) {
                  onFailed()
                } else if (onBack) {
                  onBack()
                }
              },
            },
          ]
        )
      } else {
        // Allow retry
        Alert.alert(
          'Incorrect',
          `Please try again. ${newAttempts} attempt${newAttempts > 1 ? 's' : ''} remaining.`,
          [
            {
              text: 'Try Again',
              onPress: () => {
                setSelectedWords({})
                setIsVerifying(false)
              },
            },
          ]
        )
      }
    }
  }

  const isComplete = Object.keys(selectedWords).length === questions.length

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
      marginBottom: 24,
      textAlign: 'center',
    },
    questionContainer: {
      marginBottom: 24,
    },
    questionText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primary,
      fontSize: 16,
      marginBottom: 12,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    option: {
      width: '48%',
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: ColorPalette.grayscale.lightGrey,
      alignItems: 'center',
    },
    selectedOption: {
      borderColor: ColorPalette.brand.primary,
      backgroundColor: ColorPalette.brand.highlight,
    },
    optionText: {
      ...TextTheme.normal,
      color: ColorPalette.brand.primary,
    },
    verifyButton: {
      backgroundColor: ColorPalette.brand.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    verifyButtonDisabled: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
    },
    verifyButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primaryBackground,
      fontSize: 16,
    },
    attemptsText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      textAlign: 'center',
      marginTop: 16,
    },
    attemptsWarning: {
      color: ColorPalette.notification.errorText,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Verify Recovery Phrase</Text>
      <Text style={styles.description}>
        Select the correct words to verify you wrote them down.
      </Text>

      {questions.map((question, index) => (
        <View key={question.position} style={styles.questionContainer}>
          <Text style={styles.questionText}>
            What is word #{question.position + 1}?
          </Text>
          <View style={styles.optionsContainer}>
            {question.options.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  selectedWords[question.position] === option && styles.selectedOption,
                ]}
                onPress={() => handleSelectWord(question.position, option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.verifyButton,
          (!isComplete || isVerifying) && styles.verifyButtonDisabled,
        ]}
        onPress={handleVerify}
        disabled={!isComplete || isVerifying}
      >
        <Text style={styles.verifyButtonText}>Verify</Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.attemptsText,
          attempts <= 1 && styles.attemptsWarning,
        ]}
      >
        Attempts remaining: {attempts}
      </Text>
    </ScrollView>
  )
}
