import { WalletError } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getVersion, getBuildNumber } from 'react-native-device-info'
import { pick, types } from 'react-native-document-picker'
import { DocumentDirectoryPath, unlink } from 'react-native-fs'
import ShareDialog from 'react-native-share'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { SafeAreaScrollView, LoadingModal } from '../components'
import { ToastType } from '../components/toast/BaseToast'
import { useTheme } from '../contexts/theme'
import { Screens, SettingStackParams, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type SettingsProps = StackScreenProps<SettingStackParams>

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const { agent } = useAgent()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const { borderRadius, SettingsTheme } = useTheme()
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

  const exportWallet = async () => {
    const walletconfig = agent?.wallet.walletConfig
    const path = `${DocumentDirectoryPath}/${walletconfig?.id}.txt`
    setLoading(true)
    let typeToast
    let toastMessage
    try {
      await agent?.wallet.export({
        key: 'mypasswordlater',
        path,
      })
      await ShareDialog.open({
        title: 'Export Wallet ' + walletconfig?.id,
        url: 'file://' + path,
        subject: 'Wallet ' + walletconfig?.id,
      })
      typeToast = ToastType.Success
      toastMessage = {
        text1: 'Your wallet is exported successfully',
        text2: 'You can use the exported file to backup your wallet',
      }
    } catch (error) {
      typeToast = ToastType.Error
      toastMessage = {
        text1: 'Your exporting process is failed',
        text2: 'Please try again or contact application supporter',
      }
    }
    try {
      await unlink(path)
    } catch (error) {
      typeToast = ToastType.Error
      toastMessage = {
        text1: 'Your exporting process is success, but we can not delete your temporary exported file',
        text2: 'Please contact application supporter',
      }
    }
    setLoading(false)
    Toast.show({
      type: typeToast,
      ...toastMessage,
      visibilityTime: 8000,
      position: 'bottom',
      autoHide: false,
    })
  }

  const importWallet = async () => {
    if (agent && agent.wallet?.walletConfig) {
      let typeToast
      let toastMessage
      try {
        const walletconfig = agent.wallet.walletConfig
        const resultPickedFile = await pick({
          type: types.plainText,
        })

        await agent.wallet.import(
          {
            key: walletconfig.key,
            id: walletconfig.id,
          },
          {
            key: 'mypasswordlater',
            path: resultPickedFile[0]?.uri,
          }
        )
        typeToast = ToastType.Success
        toastMessage = {
          text1: 'Imported the wallet successfully',
        }
      } catch (error: any) {
        let message = error.message
        if (error instanceof WalletError) message = error.cause?.message
        typeToast = ToastType.Error
        toastMessage = {
          text1: message,
        }
      }
      Toast.show({
        type: typeToast,
        ...toastMessage,
        autoHide: false,
        position: 'bottom',
      })
    }
  }

  if (loading) return <LoadingModal isUsingBackgroundLogo={false} />

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
        <View style={styles.rowGroup}>
          <TouchableOpacity style={styles.row} onPress={exportWallet}>
            <Text style={SettingsTheme.text}>Export Wallet</Text>
            <Icon name={'chevron-right'} size={25} color={SettingsTheme.iconColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowGroup}>
          <TouchableOpacity style={styles.row} onPress={importWallet}>
            <Text style={SettingsTheme.text}>Import Wallet</Text>
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
        </View>
      </View>
    </SafeAreaScrollView>
  )
}

export default Settings
