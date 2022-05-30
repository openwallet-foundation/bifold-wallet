import React, { useState } from 'react'
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CodeField, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'

const CELL_COUNT = 6

interface PinInputProps {
  label?: string
  onPinChanged?: (pin: string) => void
}

const PinInput: React.FC<PinInputProps> = ({ label, onPinChanged }) => {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  })

  const { ColorPallet, TextTheme } = useTheme()
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
      backgroundColor: ColorPallet.grayscale.darkGrey,
      borderWidth: 2,
      borderRadius: 5,
      borderColor: ColorPallet.grayscale.darkGrey,
      marginRight: 8,
    },
    focusedCell: {
      borderColor: ColorPallet.grayscale.lightGrey,
    },
    cellText: {
      ...TextTheme.headingThree,
      color: ColorPallet.grayscale.white,
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
            if (value.length === 6) {
              Keyboard.dismiss()
            }
          }}
          cellCount={CELL_COUNT}
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
                <Text style={[style.cellText]} maxFontSizeMultiplier={1}>
                  {child}
                </Text>
              </View>
            )
          }}
          autoFocus
        />
        <TouchableOpacity onPress={() => setShowPin(!showPin)} style={[{ marginRight: 8, marginBottom: 32 }]}>
          <Icon color="white" name={showPin ? 'visibility-off' : 'visibility'} size={30}></Icon>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PinInput
