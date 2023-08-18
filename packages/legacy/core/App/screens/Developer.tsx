import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native'

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
  const [acceptDevCredentials, setAcceptDevCredentials] = useState<boolean>(!!store.preferences.acceptDevCredentials)

  const [useDevVerifierTemplates, setDevVerifierTemplates] = useState(!!store.preferences.useDevVerifierTemplates)
  const [enableWalletNaming, setEnableWalletNaming] = useState(!!store.preferences.enableWalletNaming)

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
    // if verifier feature is switched off then also turn off the dev templates
    if (useVerifierCapability) {
      dispatch({
        type: DispatchAction.USE_DEV_VERIFIER_TEMPLATES,
        payload: [false],
      })
      setDevVerifierTemplates(false)
    }
    dispatch({
      type: DispatchAction.USE_VERIFIER_CAPABILITY,
      payload: [!useVerifierCapability],
    })
    setUseVerifierCapability((previousState) => !previousState)
  }

  const toggleAcceptDevCredentialsSwitch = () => {
    dispatch({
      type: DispatchAction.ACCEPT_DEV_CREDENTIALS,
      payload: [!acceptDevCredentials],
    })
    setAcceptDevCredentials((previousState) => !previousState)
  }

  const toggleConnectionInviterCapabilitySwitch = () => {
    dispatch({
      type: DispatchAction.USE_CONNECTION_INVITER_CAPABILITY,
      payload: [!useConnectionInviterCapability],
    })
    setConnectionInviterCapability((previousState) => !previousState)
  }

  const toggleDevVerifierTemplatesSwitch = () => {
    // if we switch on dev templates we can assume the user also wants to enable the verifier capability
    if (!useDevVerifierTemplates) {
      dispatch({
        type: DispatchAction.USE_VERIFIER_CAPABILITY,
        payload: [true],
      })
      setUseVerifierCapability(true)
    }
    dispatch({
      type: DispatchAction.USE_DEV_VERIFIER_TEMPLATES,
      payload: [!useDevVerifierTemplates],
    })
    setDevVerifierTemplates((previousState) => !previousState)
  }

  const toggleWalletNamingSwitch = () => {
    dispatch({
      type: DispatchAction.ENABLE_WALLET_NAMING,
      payload: [!enableWalletNaming],
    })
    setEnableWalletNaming((previousState) => !previousState)
  }

  return (
    <View style={styles.container}>
      <Text style={[TextTheme.normal, { margin: 10 }]}>
        Place content here you would like to make available to developers when developer mode is enabled.
      </Text>
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text accessible={false} style={styles.settingLabelText}>
            {t('Verifier.UseVerifierCapability')}
          </Text>
        </View>
        <Pressable
          style={styles.settingSwitchContainer}
          accessibilityLabel={t('Verifier.Toggle')}
          accessibilityRole={'switch'}
          testID={testIdWithKey('ToggleVerifierCapability')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useVerifierCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleVerifierCapabilitySwitch}
            value={useVerifierCapability}
          />
        </Pressable>
      </View>
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text accessible={false} style={styles.settingLabelText}>
            {t('Verifier.AcceptDevCredentials')}
          </Text>
        </View>
        <Pressable
          style={styles.settingSwitchContainer}
          accessibilityLabel={t('Verifier.Toggle')}
          accessibilityRole={'switch'}
          testID={testIdWithKey('ToggleAcceptDevCredentials')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={acceptDevCredentials ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleAcceptDevCredentialsSwitch}
            value={acceptDevCredentials}
          />
        </Pressable>
      </View>
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabelText}>{t('Connection.UseConnectionInviterCapability')}</Text>
        </View>
        <Pressable
          style={styles.settingSwitchContainer}
          accessibilityLabel={t('Connection.Toggle')}
          accessibilityRole={'switch'}
          testID={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useConnectionInviterCapability ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleConnectionInviterCapabilitySwitch}
            value={useConnectionInviterCapability}
          />
        </Pressable>
      </View>
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabelText}>{t('Verifier.UseDevVerifierTemplates')}</Text>
        </View>
        <Pressable
          style={styles.settingSwitchContainer}
          accessibilityLabel={t('Verifier.ToggleDevTemplates')}
          accessibilityRole={'switch'}
          testID={testIdWithKey('ToggleDevVerifierTemplatesSwitch')}
        >
          <Switch
            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
            thumbColor={useDevVerifierTemplates ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
            onValueChange={toggleDevVerifierTemplatesSwitch}
            value={useDevVerifierTemplates}
          />
        </Pressable>
      </View>
      {!store.onboarding.didCreatePIN && (
        <View style={styles.settingContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabelText}>{t('NameWallet.EnableWalletNaming')}</Text>
          </View>
          <Pressable
            style={styles.settingSwitchContainer}
            accessibilityLabel={t('NameWallet.ToggleWalletNaming')}
            accessibilityRole={'switch'}
            testID={testIdWithKey('EnableWalletNamingSwitch')}
          >
            <Switch
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={enableWalletNaming ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={toggleWalletNamingSwitch}
              value={enableWalletNaming}
            />
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default Developer
