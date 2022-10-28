import { StackScreenProps } from '@react-navigation/stack'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import Icon from 'react-native-vector-icons/MaterialIcons'

import SafeAreaScrollView from '../components/views/SafeAreaScrollView'
import { touchCountToEnableBiometrics } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Locales } from '../localization'
import { Screens, SettingStackParams, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type SettingsProps = StackScreenProps<SettingStackParams>

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const [store, dispatch] = useStore()
  const developerOptionCount = useRef(0)
  const [developerModeTriggerDisabled, setDeveloperModeTriggerDisabled] = useState<boolean>(false)
  const { SettingsTheme, TextTheme, ColorPallet, Assets } = useTheme()
  const languages = [
    { id: Locales.en, value: t('Language.English') },
    { id: Locales.fr, value: t('Language.French') },
    { id: Locales.ptBr, value: t('Language.Portuguese') },
  ]

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      width: '100%',
    },
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      padding: 25,
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      height: 64,
      width: 164,
      marginVertical: 15,
    },
    footer: {
      marginTop: 22,
      alignItems: 'center',
    },
  })

  const currentLanguage = languages.find((l) => l.id === i18n.language)?.value

  const SectionHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
      <Icon name={icon} size={42} style={{ marginRight: 10 }} />
      <Text style={TextTheme.headingThree}>{title}</Text>
    </View>
  )

  const SeparatorLine: React.FC = () => (
    <View
      style={{
        height: 1,
        backgroundColor: ColorPallet.grayscale.lightGrey,
        marginVertical: 20,
      }}
    />
  )

  const Row: React.FC<{
    title: string
    value?: string
    accessibilityLabel: string
    testID: string
    onPress: () => void
  }> = ({ title, value, accessibilityLabel, testID, onPress }) => (
    <View style={{ flexGrow: 1, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={styles.row}
        onPress={onPress}
      >
        <Text style={[TextTheme.normal, { fontSize: 22, flexGrow: 1 }]}>{title}</Text>
        <Text style={[TextTheme.normal, { fontSize: 22, color: ColorPallet.brand.link }]}>{value}</Text>
      </TouchableOpacity>
    </View>
  )

  const incrementDeveloperMenuCounter = () => {
    if (developerOptionCount.current >= touchCountToEnableBiometrics) {
      setDeveloperModeTriggerDisabled(true)
      dispatch({
        type: DispatchAction.ENABLE_DEVELOPER_MODE,
        payload: [true],
      })

      return
    }

    developerOptionCount.current = developerOptionCount.current + 1
  }

  return (
    <SafeAreaScrollView>
      <View style={styles.container}>
        <View style={styles.section}>
          <SectionHeader icon="apartment" title={t('Screens.Contacts')} />
          <View style={{ flexGrow: 1, flexDirection: 'column' }}>
            <Row
              title={t('Screens.Contacts')}
              accessibilityLabel={t('Screens.Contacts')}
              testID={testIdWithKey('Contacts')}
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate(Stacks.ContactStack, { screen: Screens.Contacts, params: { navigation: navigation } })
              }
            />
            {/* <SeparatorLine />
            <Row
              title={'What are Contacts?'}
              accessibilityLabel={'What are Contacts?'}
              testID={testIdWithKey('WhatContacts')}
              onPress={() => null}
            /> */}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader icon="settings" title={t('Settings.AppPreferences')} />
          <View style={{ flexGrow: 1, flexDirection: 'column' }}>
            <Row
              title={t('Global.Biometrics')}
              value={store.preferences.useBiometry ? t('Global.On') : t('Global.Off')}
              accessibilityLabel={t('Global.Biometrics')}
              testID={testIdWithKey('Biometrics')}
              onPress={() => navigation.navigate(Screens.UseBiometry)}
            />
            <SeparatorLine />
            {/* <Row
              title={'Change PIN'}
              accessibilityLabel={'Change PIN'}
              testID={testIdWithKey('ChangePIN')}
              onPress={() => null}
            />
            <SeparatorLine /> */}
            <Row
              title={t('Settings.Language')}
              value={currentLanguage}
              accessibilityLabel={t('Settings.Language')}
              testID={testIdWithKey('Language')}
              onPress={() => navigation.navigate(Screens.Language)}
            />
            {store.preferences.developerModeEnabled && (
              <>
                <SeparatorLine />
                <Row
                  title={'Developer'}
                  accessibilityLabel={'Developer'}
                  testID={testIdWithKey('Developer')}
                  onPress={() => navigation.navigate(Screens.Developer)}
                />
              </>
            )}
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableWithoutFeedback onPress={incrementDeveloperMenuCounter} disabled={developerModeTriggerDisabled}>
          <View>
            <Text style={TextTheme.normal} testID={testIdWithKey('Version')}>
              {`${t('Settings.Version')} ${getVersion()} ${t('Settings.Build')} (${getBuildNumber()})`}
            </Text>
            <Assets.svg.logo {...styles.logo} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaScrollView>
  )
}

export default Settings
