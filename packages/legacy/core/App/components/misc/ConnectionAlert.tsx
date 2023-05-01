import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import PopupModal from '../modals/PopupModal'

import { InfoBoxType } from './InfoBox'
import UnorderedList from './UnorderedList'

interface ConnectionAlertProps {
  connectionID?: string
}

const ConnectionAlert: React.FC<ConnectionAlertProps> = ({ connectionID }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [infoCardVisible, setInfoCardVisible] = useState(false)

  const settingsNavigation = useNavigation<StackNavigationProp<RootStackParams>>()

  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.notification.popupOverlay,
      padding: 20,
    },
    notifyTextContainer: {
      borderLeftColor: ColorPallet.brand.highlight,
      backgroundColor: ColorPallet.brand.secondaryBackground,
      borderLeftWidth: 10,
      flex: 1,
      paddingLeft: 10,
      paddingVertical: 15,
      marginVertical: 15,
    },
    fakeLink: {
      ...TextTheme.normal,
      color: ColorPallet.notification.infoText,
      textDecorationLine: 'underline',
    },
    row: {
      flexDirection: 'row',
    },
    notifyTitle: {
      ...TextTheme.title,
      marginBottom: 5,
    },
    notifyText: {
      ...TextTheme.normal,
      marginVertical: 5,
    },
    modalText: {
      ...TextTheme.normal,
      color: ColorPallet.notification.infoText,
    },
    notifyTextList: {
      marginVertical: 6,
    },
    informationIcon: {
      color: ColorPallet.brand.icon,
      marginLeft: 10,
    },
  })

  const toggleInfoCard = () => setInfoCardVisible(!infoCardVisible)

  const navigateToSettings = () => {
    toggleInfoCard()
    settingsNavigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })
  }

  return (
    <View style={styles.notifyTextContainer}>
      <View style={styles.row}>
        <Text style={styles.notifyTitle}>{t('ConnectionAlert.AddedContacts')}</Text>
        <Icon name={'information-outline'} size={30} style={styles.informationIcon} onPress={toggleInfoCard} />
      </View>
      {infoCardVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('ConnectionAlert.WhatAreContacts')}
          bodyContent={
            <View>
              <Text style={styles.modalText}>{t('ConnectionAlert.PopupIntro')}</Text>
              <UnorderedList
                UnorderedListItems={[
                  t('ConnectionAlert.PopupPoint1'),
                  t('ConnectionAlert.PopupPoint2'),
                  t('ConnectionAlert.PopupPoint3'),
                ]}
              />
              <Text style={styles.modalText}>
                {t('ConnectionAlert.SettingsInstruction')}
                <Text style={styles.fakeLink} onPress={navigateToSettings}>
                  {t('ConnectionAlert.SettingsLink')}
                </Text>
                .
              </Text>
              <Text style={styles.modalText}>{t('ConnectionAlert.PrivacyMessage')}</Text>
            </View>
          }
          onCallToActionLabel={t('ConnectionAlert.PopupExit')}
          onCallToActionPressed={toggleInfoCard}
        />
      )}
      <Text style={styles.notifyText}>
        {t('ConnectionAlert.NotificationBodyUpper') +
          (connectionID || t('ContactDetails.AContact').toLowerCase()) +
          t('ConnectionAlert.NotificationBodyLower')}
      </Text>
    </View>
  )
}

export default ConnectionAlert
