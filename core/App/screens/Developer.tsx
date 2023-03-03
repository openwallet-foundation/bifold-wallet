import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableWithoutFeedback, Switch } from 'react-native'

import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const Developer: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [useVerifierCapability, setUseVerifierCapability] = useState(!!store.preferences.useVerifierCapability)

  const toggleSwitch = () => {
    dispatch({
      type: DispatchAction.USE_VERIFIER_CAPABILITY,
      payload: [!useVerifierCapability],
    })
    setUseVerifierCapability((previousState) => !previousState)
  }

  return (
    <View
      style={{
        marginTop: 50,
        marginHorizontal: 20,
        borderColor: ColorPallet.brand.primary,
        borderWidth: 1,
        borderRadius: 3,
      }}
    >
      <Text style={[TextTheme.normal, { margin: 10 }]}>
        Place content here you would like to make available to developers when developer mode is enabled.
      </Text>
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 10,
          marginHorizontal: 10,
        }}
      >
        <View style={{ flexShrink: 1, marginRight: 10, justifyContent: 'center' }}>
          <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>{t('Verifier.UseVerifierCapability')}</Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <TouchableWithoutFeedback accessibilityLabel={t('Verifier.Toggle')} accessibilityRole={'switch'}>
            <Switch
              testID={testIdWithKey('ToggleVerifierCapability')}
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={useVerifierCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={toggleSwitch}
              value={useVerifierCapability}
            />
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  )
}

export default Developer
