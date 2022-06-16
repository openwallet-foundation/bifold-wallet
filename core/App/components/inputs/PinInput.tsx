import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CodeField, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { minPINLength } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface PinInputProps {
  label?: string
  onPinChanged?: (pin: string) => void
  testID?: string
  accessibilityLabel?: string
  autoFocus?: boolean
}

const PinInput: React.FC<PinInputProps> = ({ label, onPinChanged, testID, accessibilityLabel, autoFocus = false }) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  })
  const { t } = useTranslation()

  const { TextTheme, PinInputTheme } = useTheme()
  const style = StyleSheet.create({
    codeField: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    codeFieldRoot: {
      marginBottom: 24,
    },
    cell: {
      width: 40,
      height: 48,
      backgroundColor: PinInputTheme.cell.backgroundColor,
      borderWidth: 2,
      borderRadius: 5,
      borderColor: PinInputTheme.cell.borderColor,
      marginRight: 8,
    },
    focusedCell: {
      borderColor: PinInputTheme.focussedCell.borderColor,
    },
    cellText: {
      ...TextTheme.headingThree,
      color: PinInputTheme.cellText.color,
      textAlign: 'center',
      textAlignVertical: 'center',
      lineHeight: 42,
    },
  })

  return (
    <View>
      {label && <Text style={[TextTheme.label, { marginBottom: 8 }]}>{label}</Text>}
      <View style={[style.codeField]}>
        <CodeField
          {...props}
          value={pin}
          onChangeText={(value: string) => {
            onPinChanged && onPinChanged(value)
            setPin(value)
            if (value.length === minPINLength) {
              Keyboard.dismiss()
            }
          }}
          cellCount={minPINLength}
          keyboardType="numeric"
          textContentType="password"
          rootStyle={style.codeFieldRoot}
          renderCell={({ index, symbol, isFocused }) => {
            let child = ''
            if (symbol) {
              child = showPin ? symbol : '•'
            }
            return (
              <View
                key={index}
                style={[style.cell, isFocused && style.focusedCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <Text
                  style={[style.cellText]}
                  maxFontSizeMultiplier={1}
                  testID={testID ? `${testID}-${index + 1}` : testIdWithKey(`${'PINInput'}-${index + 1}`)}
                  accessible={accessible}
                  accessibilityLabel={`${accessibilityLabel || t('PinEnter.EnterPIN')}-${index + 1}`}
                >
                  {child}
                </Text>
              </View>
            )
          }}
          autoFocus={autoFocus}
        />
        <TouchableOpacity onPress={() => setShowPin(!showPin)} style={[{ marginRight: 8, marginBottom: 32 }]}>
          <Icon color={PinInputTheme.icon.color} name={showPin ? 'visibility-off' : 'visibility'} size={30}></Icon>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PinInput
