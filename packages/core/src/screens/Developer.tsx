import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, ScrollView, DeviceEventEmitter } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'
import Button, { ButtonType } from '../components/buttons/Button'
import DeveloperToggleRow from '../components/inputs/DeveloperToggleRow'
import { HomeStackParams, Screens, Stacks } from '../types/navigators'
import { EventTypes } from '../constants'

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
})

const Developer: React.FC = () => {
  const [store, dispatch] = useStore()
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [useVerifierCapability, setUseVerifierCapability] = useState(!!store.preferences.useVerifierCapability)
  const [useConnectionInviterCapability, setConnectionInviterCapability] = useState(
    !!store.preferences.useConnectionInviterCapability
  )
  const [acceptDevCredentials, setAcceptDevCredentials] = useState(!!store.preferences.acceptDevCredentials)
  const [useDevVerifierTemplates, setDevVerifierTemplates] = useState(!!store.preferences.useDevVerifierTemplates)
  const [enableWalletNaming, setEnableWalletNaming] = useState(!!store.preferences.enableWalletNaming)
  const [enableShareableLink, setEnableShareableLink] = useState(!!store.preferences.enableShareableLink)
  const [preventAutoLock, setPreventAutoLock] = useState(!!store.preferences.preventAutoLock)
  const [enableGenericErrorMessages, setEnableGenericErrorMessages] = useState(!!store.preferences.genericErrorMessages)

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

  const toggleGenericErrorMessages = () => {
    dispatch({
      type: DispatchAction.GENERIC_ERROR_MESSAGES,
      payload: [!enableGenericErrorMessages],
    })
    setEnableGenericErrorMessages((previousState) => !previousState)
  }

  const onRunRefreshCycleTouched = () => {
    navigation.getParent()?.navigate(Stacks.TabStack, { screen: Screens.Home })
    setTimeout(() => {
      DeviceEventEmitter.emit(EventTypes.OPENID_REFRESH_REQUEST)
    }, 50)
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container}>
        <ThemedText style={{ margin: 10 }}>
          Place content here you would like to make available to developers when developer mode is enabled.
        </ThemedText>

        <DeveloperToggleRow
          label={t('Verifier.UseVerifierCapability')}
          value={useVerifierCapability}
          onToggle={toggleVerifierCapabilitySwitch}
          accessibilityLabel={t('Verifier.Toggle')}
          pressableTestId={testIdWithKey('ToggleVerifierCapability')}
          switchTestId={testIdWithKey('VerifierCapabilitySwitchElement')}
        />

        <DeveloperToggleRow
          label={t('Verifier.AcceptDevCredentials')}
          value={acceptDevCredentials}
          onToggle={toggleAcceptDevCredentialsSwitch}
          accessibilityLabel={t('Verifier.Toggle')}
          pressableTestId={testIdWithKey('ToggleAcceptDevCredentials')}
          switchTestId={testIdWithKey('AcceptDevCredentialsSwitchElement')}
        />

        <DeveloperToggleRow
          label={t('Connection.UseConnectionInviterCapability')}
          value={useConnectionInviterCapability}
          onToggle={toggleConnectionInviterCapabilitySwitch}
          accessibilityLabel={t('Connection.Toggle')}
          pressableTestId={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
          switchTestId={testIdWithKey('ConnectionInviterCapabilitySwitchElement')}
        />

        <DeveloperToggleRow
          label={t('Verifier.UseDevVerifierTemplates')}
          value={useDevVerifierTemplates}
          onToggle={toggleDevVerifierTemplatesSwitch}
          accessibilityLabel={t('Verifier.ToggleDevTemplates')}
          pressableTestId={testIdWithKey('ToggleDevVerifierTemplatesSwitch')}
          switchTestId={testIdWithKey('DevVerifierTemplatesSwitchElement')}
        />

        {!store.onboarding.didCreatePIN && (
          <DeveloperToggleRow
            label={t('NameWallet.EnableWalletNaming')}
            value={enableWalletNaming}
            onToggle={toggleWalletNamingSwitch}
            accessibilityLabel={t('NameWallet.ToggleWalletNaming')}
            pressableTestId={testIdWithKey('ToggleEnableWalletNamingSwitch')}
            switchTestId={testIdWithKey('EnableWalletNamingSwitchElement')}
          />
        )}

        <DeveloperToggleRow
          label={t('Settings.PreventAutoLock')}
          value={preventAutoLock}
          onToggle={togglePreventAutoLockSwitch}
          accessibilityLabel={t('Settings.TogglePreventAutoLock')}
          pressableTestId={testIdWithKey('TogglePreventAutoLockSwitch')}
          switchTestId={testIdWithKey('PreventAutoLockSwitchElement')}
        />

        <DeveloperToggleRow
          label={t('PasteUrl.UseShareableLink')}
          value={enableShareableLink}
          onToggle={toggleShareableLinkSwitch}
          accessibilityLabel={t('PasteUrl.UseShareableLink')}
          pressableTestId={testIdWithKey('ToggleUseShareableLink')}
          switchTestId={testIdWithKey('ShareableLinkSwitchElement')}
        />

        <DeveloperToggleRow
          label={t('Settings.GenericErrorMessages')}
          value={enableGenericErrorMessages}
          onToggle={toggleGenericErrorMessages}
          accessibilityLabel={t('Settings.GenericErrorMessages')}
          pressableTestId={testIdWithKey('ToggleUseGenericErrorMessages')}
          switchTestId={testIdWithKey('GenericErrorMessagesSwitchElement')}
        />

        <View style={styles.settingContainer}>
          <View style={{ flex: 1 }}>
            <Button
              title={t('Global.RefreshCredentials')}
              accessibilityLabel={t('Global.RefreshCredentials')}
              testID={testIdWithKey('Refresh Credentials')}
              onPress={onRunRefreshCycleTouched}
              buttonType={ButtonType.ModalPrimary}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Developer
