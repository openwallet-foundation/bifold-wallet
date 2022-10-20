import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Locales } from '../localization'
import { GenericFn } from '../types/fn'
import { Screens, SettingStackParams, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type SettingsProps = StackScreenProps<SettingStackParams>

interface Setting {
  title: string
  value?: string
  onPress?: GenericFn
  accessibilityLabel?: string
  testID?: string
}

interface SettingSection {
  header: {
    title: string
    icon: string
  }
  data: Setting[]
}

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const [store] = useStore()
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
    sectionContainer: {},
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 0,
      marginBottom: -11,
    },
    sectionSeparator: {
      marginBottom: 10,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      height: 64,
      width: '50%',
      marginVertical: 16,
    },
    footer: {
      marginVertical: 25,
      alignItems: 'center',
    },
  })

  const currentLanguage = languages.find((l) => l.id === i18n.language)?.value

  const settings: SettingSection[] = [
    {
      header: {
        icon: 'apartment',
        title: t('Screens.Contacts'),
      },
      data: [
        {
          title: t('Screens.Contacts'),
          accessibilityLabel: t('Screens.Contacts'),
          testID: testIdWithKey('Contacts'),
          onPress: () =>
            navigation
              .getParent()
              ?.navigate(Stacks.ContactStack, { screen: Screens.Contacts, params: { navigation: navigation } }),
        },
        {
          title: t('Settings.WhatAreContacts'),
          accessibilityLabel: t('Settings.WhatAreContacts'),
          testID: testIdWithKey('WhatAreContacts'),
          onPress: () => null,
          value: undefined,
        },
      ],
    },
    {
      header: {
        icon: 'settings',
        title: t('Settings.AppSettings'),
      },
      data: [
        {
          title: t('Global.Biometrics'),
          value: store.preferences.useBiometry ? t('Global.On') : t('Global.Off'),
          accessibilityLabel: t('Global.Biometrics'),
          testID: testIdWithKey('Biometrics'),
          onPress: () => null,
        },
        {
          title: t('Settings.ChangePIN'),
          accessibilityLabel: t('Settings.ChangePIN'),
          testID: testIdWithKey('ChangePIN'),
          onPress: () => null,
        },
        {
          title: t('Settings.Language'),
          value: currentLanguage,
          accessibilityLabel: t('Settings.Language'),
          testID: testIdWithKey('Language'),
          onPress: () => navigation.navigate(Screens.Language),
        },
      ],
    },
  ]

  const SectionHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <View style={[styles.section, styles.sectionHeader]}>
      <Icon name={icon} size={24} style={{ marginRight: 10, color: TextTheme.normal.color }} />
      <Text style={[TextTheme.headingThree, { flexShrink: 1 }]}>{title}</Text>
    </View>
  )

  const SectionRow: React.FC<{
    title: string
    value?: string
    accessibilityLabel?: string
    testID?: string
    onPress?: GenericFn
  }> = ({ title, value, accessibilityLabel, testID, onPress }) => (
    <View style={[styles.section]}>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={styles.sectionRow}
        onPress={onPress}
      >
        <Text style={[TextTheme.headingFour, { fontWeight: 'normal' }]}>{title}</Text>
        <Text style={[TextTheme.headingFour, { fontWeight: 'normal', color: ColorPallet.brand.link }]}>{value}</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <SectionList
          renderItem={({ item: { title, value, onPress } }) => (
            <SectionRow
              title={title}
              accessibilityLabel={title}
              testID={testIdWithKey(title)}
              value={value}
              onPress={onPress}
            ></SectionRow>
          )}
          renderSectionHeader={({
            section: {
              header: { title, icon },
            },
          }) => <SectionHeader icon={icon} title={title} />}
          ItemSeparatorComponent={() => null}
          SectionSeparatorComponent={() => <View style={[styles.sectionSeparator]}></View>}
          ListFooterComponent={() => (
            <View style={styles.footer}>
              <Text style={TextTheme.normal} testID={testIdWithKey('Version')}>
                {`${t('Settings.Version')} ${getVersion()} ${t('Settings.Build')} (${getBuildNumber()})`}
              </Text>
              <Assets.svg.logo {...styles.logo} />
            </View>
          )}
          sections={settings}
        ></SectionList>
      </View>
    </SafeAreaView>
  )
}

export default Settings
