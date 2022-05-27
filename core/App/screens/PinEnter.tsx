import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard, StyleSheet, Text, View, Image } from 'react-native'
import { CodeField, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { TouchableOpacity } from 'react-native-gesture-handler'
import * as Keychain from 'react-native-keychain'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const CELL_COUNT = 6

interface PinEnterProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
}

const PinEnter: React.FC<PinEnterProps> = ({ setAuthenticated }) => {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: pin,
    setValue: setPin,
  })
  const style = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      margin: 20,
    },
    codeField: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    codeFieldRoot: {
      marginVertical: 40,
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
      lineHeight: 46,
      color: ColorPallet.grayscale.white,
      textAlign: 'center',
    },
  })

  const checkPin = async (pin: string) => {
    const keychainEntry = await Keychain.getGenericPassword({ service: 'passcode' })
    if (keychainEntry && JSON.stringify(pin) === keychainEntry.password) {
      setAuthenticated(true)
    } else {
      Alert.alert(t('PinEnter.IncorrectPin'))
    }
  }

  return (
    <SafeAreaView style={[style.container]}>
      <Image
        source={Assets.img.logoLarge.src}
        style={{
          height: Assets.img.logoLarge.height,
          width: Assets.img.logoLarge.width,
          resizeMode: Assets.img.logoLarge.resizeMode,
          alignSelf: 'center',
          marginBottom: 20,
        }}
      />

      <Text style={[TextTheme.normal, { alignSelf: 'center' }]}>Please enter your PIN</Text>
      <View style={[style.codeField]}>
        <CodeField
          {...props}
          value={pin}
          onChangeText={(v: string) => {
            setPin(v)
            if (v.length === 6) {
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
              child = showPin ? symbol : '\u00B7'
            }
            return (
              <View
                key={index}
                style={[style.cell, isFocused && style.focusedCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <Text style={[style.cellText, !showPin && { fontSize: 72, lineHeight: 60 }]}>{child}</Text>
              </View>
            )
          }}
          autoFocus
        />
        <TouchableOpacity onPress={() => setShowPin(!showPin)} style={[{ marginRight: 8 }]}>
          <Icon color="white" name={showPin ? 'visibility-off' : 'visibility'} size={30}></Icon>
        </TouchableOpacity>
      </View>

      <Button
        title={t('Global.Submit')}
        buttonType={ButtonType.Primary}
        testID={testIdWithKey('Submit')}
        accessibilityLabel={t('Global.Submit')}
        onPress={() => {
          Keyboard.dismiss()
          checkPin(pin)
        }}
      />
    </SafeAreaView>
  )
}

export default PinEnter
