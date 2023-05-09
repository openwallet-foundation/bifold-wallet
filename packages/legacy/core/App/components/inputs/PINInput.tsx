import React, { useState, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field'
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
    const cellHeight = 48

    const style = StyleSheet.create({
      container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        flex: 1,
        marginBottom: 24,
      },
      labelAndFieldContainer: {
        flexGrow: 1,
      },
      codeFieldRoot: {
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 4,
        justifyContent: 'flex-start',
        backgroundColor: PINInputTheme.cell.backgroundColor,
      },
      cell: {
        height: cellHeight,
        paddingHorizontal: 2,
        backgroundColor: PINInputTheme.cell.backgroundColor,
      },
      cellText: {
        ...TextTheme.headingThree,
        color: PINInputTheme.cellText.color,
        textAlign: 'center',
        lineHeight: cellHeight,
      },
      hideIcon: {
        flexShrink: 1,
        marginVertical: 10,
        paddingHorizontal: 10,
      },
    })

    return (
      <View style={style.container}>
        <View style={style.labelAndFieldContainer}>
          {label && <Text style={[TextTheme.label, { marginBottom: 8 }]}>{label}</Text>}
          <CodeField
            {...props}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            accessible
            value={PIN}
            rootStyle={style.codeFieldRoot}
            onChangeText={(value: string) => {
              onPINChanged && onPINChanged(value)
              setPIN(value)
            }}
            cellCount={minPINLength}
            keyboardType="numeric"
            textContentType="password"
            renderCell={({ index, symbol, isFocused }) => {
              let child: Element | string = ''
              if (symbol) {
                child = showPIN ? symbol : '●'
              } else if (isFocused) {
                child = <Cursor />
              }
              return (
                <View key={index} style={style.cell} onLayout={getCellOnLayoutHandler(index)}>
                  <Text style={style.cellText} maxFontSizeMultiplier={1}>
                    {child}
                  </Text>
                </View>
              )
            }}
            autoFocus={autoFocus}
            ref={ref}
          />
        </View>
        <View style={style.hideIcon}>
          <TouchableOpacity
            accessibilityLabel={showPIN ? t('PINCreate.Hide') : t('PINCreate.Show')}
            testID={showPIN ? testIdWithKey('Hide') : testIdWithKey('Show')}
            onPress={() => setShowPIN(!showPIN)}
          >
            <Icon color={PINInputTheme.icon.color} name={showPIN ? 'visibility-off' : 'visibility'} size={30}></Icon>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
)

export default PINInput
