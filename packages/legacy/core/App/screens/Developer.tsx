import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Pressable, Switch, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
  const [acceptDevCredentials, setAcceptDevCredentials] = useState(!!store.preferences.acceptDevCredentials)
  const [useDevVerifierTemplates, setDevVerifierTemplates] = useState(!!store.preferences.useDevVerifierTemplates)
  const [enableWalletNaming, setEnableWalletNaming] = useState(!!store.preferences.enableWalletNaming)
  const [enableShareableLink, setEnableShareableLink] = useState(!!store.preferences.enableShareableLink)
  const [preventAutoLock, setPreventAutoLock] = useState(!!store.preferences.preventAutoLock)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10,
      paddingHorizontal: 10,
    },
    settingContainer: {
      flexDirection: 'row',
      marginVertical: 10,
      marginHorizontal: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLabelText: {
      ...TextTheme.bold,
      marginRight: 10,
      textAlign: 'left',
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

  const togglePreventAutoLockSwitch = () => {
    dispatch({
      type: DispatchAction.PREVENT_AUTO_LOCK,
      payload: [!preventAutoLock],
    })
    setPreventAutoLock((previousState) => !previousState)
  }

  const toggleShareableLinkSwitch = () => {
    dispatch({
      type: DispatchAction.USE_SHAREABLE_LINK,
      payload: [!enableShareableLink],
    })
    setEnableShareableLink((previousState) => !previousState)
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container}>
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
              testID={testIdWithKey('VerifierCapabilitySwitchElement')}
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
              testID={testIdWithKey('AcceptDevCredentialsSwitchElement')}
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
              testID={testIdWithKey('ConnectionInviterCapabilitySwitchElement')}
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
              testID={testIdWithKey('DevVerifierTemplatesSwitchElement')}
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
              testID={testIdWithKey('ToggleEnableWalletNamingSwitch')}
            >
              <Switch
                trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
                thumbColor={enableWalletNaming ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
                ios_backgroundColor={ColorPallet.grayscale.lightGrey}
                onValueChange={toggleWalletNamingSwitch}
                testID={testIdWithKey('EnableWalletNamingSwitchElement')}
                value={enableWalletNaming}
              />
            </Pressable>
          </View>
        )}
        <View style={styles.settingContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabelText}>{t('Settings.PreventAutoLock')}</Text>
          </View>
          <Pressable
            style={styles.settingSwitchContainer}
            accessibilityLabel={t('Settings.TogglePreventAutoLock')}
            accessibilityRole={'switch'}
            testID={testIdWithKey('TogglePreventAutoLockSwitch')}
          >
            <Switch
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={preventAutoLock ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={togglePreventAutoLockSwitch}
              testID={testIdWithKey('PreventAutoLockSwitchElement')}
              value={preventAutoLock}
            />
          </Pressable>
        </View>
        <View style={styles.settingContainer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabelText}>{t('PasteUrl.UseShareableLink')}</Text>
          </View>
          <Pressable
            style={styles.settingSwitchContainer}
            accessibilityLabel={t('PasteUrl.UseShareableLink')}
            accessibilityRole={'switch'}
            testID={testIdWithKey('ToggleUseShareableLink')}
          >
            <Switch
              trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
              thumbColor={enableShareableLink ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
              ios_backgroundColor={ColorPallet.grayscale.lightGrey}
              onValueChange={toggleShareableLinkSwitch}
              testID={testIdWithKey('ShareableLinkSwitchElement')}
              value={enableShareableLink}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Developer
