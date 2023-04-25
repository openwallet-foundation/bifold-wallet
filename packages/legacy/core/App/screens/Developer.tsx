import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableWithoutFeedback, Switch, StyleSheet } from 'react-native'

import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const Developer: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [useVerifierCapability, setUseVerifierCapability] = useState(!!store.preferences.useVerifierCapability)
  const [useConnectionInviterCapability, setConnectionInviterCapability] = useState(
    !!store.preferences.useConnectionInviterCapability
  )

  const styles = StyleSheet.create({
    container: {
      marginTop: 50,
      marginHorizontal: 20,
      borderColor: ColorPallet.brand.primary,
      borderWidth: 1,
      borderRadius: 3,
    },
    settingContainer: {
      flexDirection: 'row',
      marginVertical: 10,
      marginHorizontal: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLabelText: {
      ...TextTheme.normal,
      marginRight: 10,
      textAlign: 'left',
      fontWeight: 'bold',
    },
    settingSwitchContainer: {
      justifyContent: 'center',
    },
  })

  const toggleVerifierCapabilitySwitch = () => {
    dispatch({
      type: DispatchAction.USE_VERIFIER_CAPABILITY,
      payload: [!useVerifierCapability],
    })
    setUseVerifierCapability((previousState) => !previousState)
  }

  const toggleConnectionInviterCapabilitySwitch = () => {
    dispatch({
      type: DispatchAction.USE_CONNECTION_INVITER_CAPABILITY,
      payload: [!useConnectionInviterCapability],
    })
    setConnectionInviterCapability((previousState) => !previousState)
  }

  return (
    <View style={styles.container}>
      <Text style={[TextTheme.normal, { margin: 10 }]}>
        Place content here you would like to make available to developers when developer mode is enabled.
      </Text>
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabelText}>{t('Verifier.UseVerifierCapability')}</Text>
        </View>
        <TouchableWithoutFeedback
          style={styles.settingSwitchContainer}
          accessibilityLabel={t('Verifier.Toggle')}
          accessibilityRole={'switch'}
        >
          <Switch
            testID={testIdWithKey('ToggleVerifierCapability')}
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useVerifierCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleVerifierCapabilitySwitch}
            value={useVerifierCapability}
          />
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabelText}>{t('Connection.UseConnectionInviterCapability')}</Text>
        </View>
        <TouchableWithoutFeedback
          style={styles.settingSwitchContainer}
          accessibilityLabel={t('Connection.Toggle')}
          accessibilityRole={'switch'}
        >
          <Switch
            testID={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useConnectionInviterCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleConnectionInviterCapabilitySwitch}
            value={useConnectionInviterCapability}
          />
        </TouchableWithoutFeedback>
      </View>
    </View>
  )
}

export default Developer
