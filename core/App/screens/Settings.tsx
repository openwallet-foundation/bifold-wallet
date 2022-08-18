import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { uiConfig } from '../../configs/uiConfig'
import { SafeAreaScrollView } from '../components'
import ConfirmModal from '../components/modals/ConfirmModal'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { resetStorage } from '../services/keychain.service'
import { Screens, SettingStackParams, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type SettingsProps = StackScreenProps<SettingStackParams>

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const { setAuthenticated } = useAuth()
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { borderRadius, SettingsTheme } = useTheme()
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      padding: 20,
    },
    groupHeader: {
      ...SettingsTheme.groupHeader,
    },
    rowGroup: {
      borderRadius: borderRadius * 2,
      backgroundColor: SettingsTheme.groupBackground,
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
    },
  })

  const resetApp = async () => {
    await resetStorage()
    await agent?.wallet.delete()
    dispatch({
      type: DispatchAction.RESET_ONBOARDING,
    })
    setModalVisible(false)
    setAuthenticated(false)
  }

  return (
    <SafeAreaScrollView>
      <View style={styles.container}>
        <Text style={styles.groupHeader}>{t('Settings.AppPreferences')}</Text>
        <View style={styles.rowGroup}>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel={t('Settings.Language')}
            testID={testIdWithKey('Language')}
            style={styles.row}
            onPress={() => navigation.navigate(Screens.Language)}
          >
            <Text style={SettingsTheme.text}>{t('Settings.Language')}</Text>
            <Icon name={'chevron-right'} size={25} color={SettingsTheme.iconColor} />
          </TouchableOpacity>
        </View>

        <Text style={styles.groupHeader}>{t('Settings.AboutApp')}</Text>
        <View style={styles.rowGroup}>
          <View style={styles.row}>
            <Text style={SettingsTheme.text} testID={testIdWithKey('VersionLabel')}>
              {t('Settings.Version')}
            </Text>
            <Text
              style={SettingsTheme.text}
              testID={testIdWithKey('Version')}
            >{`${getVersion()}-${getBuildNumber()}`}</Text>
          </View>

          {!uiConfig.fiveTabDisplay && (
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={t('RootStack.Contacts')}
              testID={testIdWithKey('Contacts')}
              style={styles.row}
              onPress={() =>
                navigation
                  .getParent()
                  ?.navigate(Stacks.ContactStack, { screen: Screens.Contacts, params: { navigation: navigation } })
              }
            >
              <Text style={SettingsTheme.text}>{t('RootStack.Contacts')}</Text>
              <Icon name={'chevron-right'} size={25} color={SettingsTheme.iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={[styles.container, {marginTop: 'auto'}]}>
        <View style={SettingsTheme.resetButton}>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel={t('Settings.ResetWallet')}
            testID={testIdWithKey('Language')}
            style={[styles.row, {flexDirection: 'column'}]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[SettingsTheme.resetText, {textAlign: 'center'}]}>{t('Settings.ResetWallet')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {modalVisible && (
        <ConfirmModal
          title={t('Settings.ResetTitle')}
          body={t('Settings.ResetBody')}
          confirm={t('Settings.ResetConfirm')}
          abort={t('Settings.ResetAbort')}
          confirmSubmit={() => resetApp()}
          abortSubmit={() => setModalVisible(false)}
        />
      )}
    </SafeAreaScrollView>
  )
}

export default Settings
