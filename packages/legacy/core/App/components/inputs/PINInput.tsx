import React, { useState, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CodeField, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { minPINLength } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface PINInputProps {
  label?: string
  onPINChanged?: (PIN: string) => void
  testID?: string
  accessibilityLabel?: string
  autoFocus?: boolean
}

// TODO:(jl) Would be great if someone can figure out the proper type for
// ref below.
const PINInput: React.FC<PINInputProps & React.RefAttributes<HTMLInputElement | undefined>> = forwardRef(
  ({ label, onPINChanged, testID, accessibilityLabel, autoFocus = false }, ref: any) => {
    // const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false
    const [PIN, setPIN] = useState('')
    const [showPIN, setShowPIN] = useState(false)
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
      value: PIN,
      setValue: setPIN,
    })
    const { t } = useTranslation()
    const { TextTheme, PINInputTheme } = useTheme()

    const style = StyleSheet.create({
      codeField: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        marginBottom: 24,
      },
      cell: {
        width: 40,
        height: 48,
        backgroundColor: PINInputTheme.cell.backgroundColor,
        borderWidth: 2,
        borderRadius: 5,
        borderColor: PINInputTheme.cell.borderColor,
        marginRight: 8,
      },
      focusedCell: {
        borderColor: PINInputTheme.focussedCell.borderColor,
      },
      cellText: {
        ...TextTheme.headingThree,
        color: PINInputTheme.cellText.color,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 42,
      },
    })

    return (
      <View style={[style.codeField]}>
        <View>
          {label && <Text style={[TextTheme.label, { marginBottom: 8 }]}>{label}</Text>}
          <CodeField
            {...props}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            accessible
            value={PIN}
            onChangeText={(value: string) => {
              onPINChanged && onPINChanged(value)
              setPIN(value)
            }}
            cellCount={minPINLength}
            keyboardType="numeric"
            textContentType="password"
            renderCell={({ index, symbol, isFocused }) => {
              let child = ''
              if (symbol) {
                child = showPIN ? symbol : '•'
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
            autoFocus={autoFocus}
            ref={ref}
          />
        </View>
        <TouchableOpacity
          accessibilityLabel={showPIN ? t('PINCreate.Hide') : t('PINCreate.Show')}
          testID={showPIN ? testIdWithKey('Hide') : testIdWithKey('Show')}
          onPress={() => setShowPIN(!showPIN)}
          style={[{ marginLeft: 'auto', marginRight: 'auto', marginVertical: 10 }]}
        >
          <Icon color={PINInputTheme.icon.color} name={showPIN ? 'visibility-off' : 'visibility'} size={30}></Icon>
        </TouchableOpacity>
      </View>
    )
  }
)

export default PINInput
