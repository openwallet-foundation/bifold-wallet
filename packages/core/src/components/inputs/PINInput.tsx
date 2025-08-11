import React, { useState, forwardRef, Ref, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop, minPINLength, maxPINLength } from '../../constants'
import { useServices, TOKENS } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import InlineErrorText, { InlineMessageProps } from './InlineErrorText'
import { InlineErrorPosition } from '../../types/error'
import { ThemedText } from '../texts/ThemedText'

// adjusting for the spaces between numbers
const cellCount = minPINLength * 2 - 1
const separatedPINCellCount = maxPINLength

interface PINInputProps {
  label?: string
  onPINChanged?: (PIN: string) => void
  testID?: string
  accessibilityLabel?: string
  autoFocus?: boolean
  inlineMessage?: InlineMessageProps
  onSubmitEditing?: () => void
}

const PINInputComponent = (
  { label, onPINChanged, testID, accessibilityLabel, autoFocus = false, inlineMessage, onSubmitEditing }: PINInputProps,
  ref: Ref<TextInput>
) => {
  const [enableSeparatedInput, showHidePinButton] = useServices([TOKENS.SEPARATED_INPUT, TOKENS.SHOW_HIDE_PIN_BUTTON])

  const { PINInputTheme, SeparatedPINInputTheme } = useTheme()

  const theme = enableSeparatedInput ? SeparatedPINInputTheme : PINInputTheme

  const [PIN, setPIN] = useState('')
  const [showPIN, setShowPIN] = useState(showHidePinButton ? true : false)
  const { t } = useTranslation()
  const cellHeight = 48

  // including spaces to prevent screen reader from reading the PIN as a single number
  // filling with bullets when masked to prevent screen reader from reading the actual PIN
  // and to have the proper appearance when the PIN is masked
  const displayValue = useMemo(() => {
    if (showPIN) {
      return PIN
    } else {
      return '●'.repeat(PIN.length)
    }
  }, [PIN, showPIN])

  const onChangeText = (value: string) => {
    const cleanValue = value.replaceAll(' ', '')
    // typed new characters
    if (cleanValue.length > PIN.length) {
      // add new characters to the actual PIN
      const newChars = cleanValue.slice(PIN.length)
      const newPIN = PIN + newChars.replace(/●/g, '')
      setPIN(newPIN)
      onPINChanged && onPINChanged(newPIN)
      // characters were removed
    } else if (cleanValue.length < displayValue.replaceAll(' ', '').length) {
      // remove same number of characters from actual PIN
      const newPIN = PIN.slice(0, cleanValue.length)
      setPIN(newPIN)
      onPINChanged && onPINChanged(newPIN)
    }
  }

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: displayValue,
    setValue: onChangeText,
  })

  const allyLabel = useMemo(() => {
    return showPIN ? accessibilityLabel : t('PINCreate.Masked')
  }, [accessibilityLabel, showPIN, t])

  const style = StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginBottom: 24,
    },
    codeFieldContainer: {
      width: '100%',
    },
    cell: {
      height: cellHeight,
      paddingHorizontal: 8,
      backgroundColor: PINInputTheme.cell.backgroundColor,
      borderColor: 'white',
      borderWidth: 1,
      flex: 1,
      margin: 6,
      borderRadius: 4,
    },
    cellText: {
      color: PINInputTheme.cellText.color,
      textAlign: 'center',
      lineHeight: cellHeight,
    },
    hideIcon: {
      paddingHorizontal: 10,
    },
  })

  const content = () => (
    <View style={theme.labelAndFieldContainer}>
      <View style={style.codeFieldContainer}>
        <CodeField
          {...props}
          testID={testID}
          accessibilityLabel={allyLabel}
          accessibilityRole={'text'}
          accessible
          value={displayValue}
          rootStyle={theme.codeFieldRoot}
          onChangeText={onChangeText}
          cellCount={enableSeparatedInput ? separatedPINCellCount : cellCount}
          keyboardType="number-pad"
          textContentType="password"
          renderCell={({ index, symbol, isFocused }) => {
            let child: React.ReactNode | string = ''
            // skip spaces
            if (symbol && symbol !== ' ') {
              child = symbol
            } else if (isFocused) {
              child = <Cursor />
            }
            return (
              <View key={index} style={style.cell} onLayout={getCellOnLayoutHandler(index)}>
                <ThemedText variant="headingThree" style={style.cellText} maxFontSizeMultiplier={1}>
                  {child}
                </ThemedText>
              </View>
            )
          }}
          autoFocus={autoFocus}
          ref={ref}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      {showHidePinButton && (
        <TouchableOpacity
          style={style.hideIcon}
          accessibilityLabel={showPIN ? t('PINCreate.Hide') : t('PINCreate.Show')}
          accessibilityRole={'button'}
          testID={showPIN ? testIdWithKey('Hide') : testIdWithKey('Show')}
          onPress={() => setShowPIN(!showPIN)}
          hitSlop={hitSlop}
        >
          <Icon color={PINInputTheme.icon.color} name={showPIN ? 'visibility-off' : 'visibility'} size={30} />
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={style.container}>
      {label && (
        <ThemedText variant="label" style={{ marginBottom: 8 }}>
          {label}
        </ThemedText>
      )}
      {inlineMessage?.config.position === InlineErrorPosition.Above ? (
        <InlineErrorText
          message={inlineMessage.message}
          inlineType={inlineMessage.inlineType}
          config={inlineMessage.config}
        />
      ) : null}
      {content()}
      {inlineMessage?.config.position === InlineErrorPosition.Below ? (
        <InlineErrorText
          message={inlineMessage.message}
          inlineType={inlineMessage.inlineType}
          config={inlineMessage.config}
        />
      ) : null}
    </View>
  )
}

const PINInput = forwardRef<TextInput, PINInputProps>(PINInputComponent)

export default PINInput
