import React, { useState, forwardRef, Ref, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop, minPINLength } from '../../constants'
import { useServices, TOKENS } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import InlineErrorText, { InlineMessageProps } from './InlineErrorText'
import { InlineErrorPosition } from '../../types/error'
import { ThemedText } from '../texts/ThemedText'

// adjusting for the spaces between numbers
const cellCount = minPINLength * 2 - 1
const separatedPINCellCount = 6

interface PINInputProps {
  label?: string
  onPINChanged?: (PIN: string) => void
  testID?: string
  accessibilityLabel?: string
  autoFocus?: boolean
  inlineMessage?: InlineMessageProps
  onSubmitEditing?: (...args: any[]) => void
}

const PINInputComponent = (
  {
    label,
    onPINChanged,
    testID,
    accessibilityLabel,
    autoFocus = false,
    inlineMessage,
    onSubmitEditing = () => {},
  }: PINInputProps,
  ref: Ref<TextInput>
) => {
  const [{ PINScreensConfig }] = useServices([TOKENS.CONFIG])

  const { PINInputTheme, SeparatedPINInputTheme, ColorPalette } = useTheme()

  const theme = PINScreensConfig.useNewPINDesign ? SeparatedPINInputTheme : PINInputTheme

  const [PIN, setPIN] = useState('')
  const [showPIN, setShowPIN] = useState(PINScreensConfig.useNewPINDesign ? true : false)
  const { t } = useTranslation()
  const cellHeight = 48

  // including spaces to prevent screen reader from reading the PIN as a single number
  // filling with bullets when masked to prevent screen reader from reading the actual PIN
  // and to have the proper appearance when the PIN is masked
  const displayValue = useMemo(() => {
    if (showPIN) {
      return PINScreensConfig.useNewPINDesign ? PIN : PIN.split('').join(' ')
    } else {
      return PINScreensConfig.useNewPINDesign ? '●'.repeat(PIN.length) : '●'.repeat(PIN.length).split('').join(' ')
    }
  }, [PIN, showPIN, PINScreensConfig])

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
      flex: 1,
    },
    cell: {
      ...theme.cell,
      borderColor:
        inlineMessage && PINScreensConfig.useNewPINDesign ? ColorPalette.semantic.error : theme.cell.borderColor,
    },
    cellText: {
      color: theme.cellText.color,
      textAlign: 'center',
      lineHeight: cellHeight,
    },
    hideIcon: {
      paddingLeft: PINScreensConfig.useNewPINDesign ? 2 : 10,
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
          cellCount={PINScreensConfig.useNewPINDesign ? separatedPINCellCount : cellCount}
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
          onSubmitEditing={(e) => {
            onSubmitEditing(e?.nativeEvent?.text ?? '')
          }}
        />
      </View>
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
    </View>
  )

  return (
    <View style={style.container}>
      {label && (
        <ThemedText variant={PINScreensConfig.useNewPINDesign ? 'labelTitle' : 'label'} style={{ marginBottom: 8 }}>
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
