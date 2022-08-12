import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'

import InfoBox, { InfoBoxType } from './InfoBox'
import UnorderedList from './UnorderedList'

interface ConnectionNotificationProps {
  connectionID?: string
}

const ConnectionNotification: React.FC<ConnectionNotificationProps> = ({ connectionID }) => {
  const { t } = useTranslation()
  const { ListItems, ColorPallet, TextTheme } = useTheme()
  const [infoCardVisible, setInfoCardVisible] = useState(false)

  const settingsNavigation = useNavigation<StackNavigationProp<RootStackParams>>()

  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
    },
    notifyTextContainer: {
      borderLeftColor: ColorPallet.brand.highlight,
      borderLeftWidth: 10,
      flex: 1,
      paddingLeft: 10,
      paddingVertical: 15,
      marginVertical: 15,
    },
    fakeLink: {
      ...TextTheme.normal,
      ...ListItems.recordLink,
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
    notifyTextList: {
      marginVertical: 6,
    },
    informationIcon: {
      color: ColorPallet.brand.link,
      marginLeft: 10,
    },
  })

  function toggleInfoCard() {
    setInfoCardVisible(!infoCardVisible)
  }

  function goToSettings() {
    toggleInfoCard()
    settingsNavigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })
  }

  return (
    <View style={styles.notifyTextContainer}>
      <View style={styles.row}>
        <Text style={styles.notifyTitle}>{t('ConnectionNotification.AddedContacts')}</Text>
        <Icon name={'information-outline'} size={30} style={styles.informationIcon} onPress={toggleInfoCard} />
      </View>
      <Modal visible={infoCardVisible} transparent>
        <View style={styles.modalCenter}>
          <InfoBox
            notificationType={InfoBoxType.Info}
            title={t('ConnectionNotification.WhatAreContacts')}
            bodyContent={
              <View>
                <Text style={styles.notifyText}>{t('ConnectionNotification.PopupIntro')}</Text>
                <UnorderedList
                  UnorderedListItems={[
                    t('ConnectionNotification.PopupPoint1'),
                    t('ConnectionNotification.PopupPoint2'),
                    t('ConnectionNotification.PopupPoint3'),
                  ]}
                />
                <Text style={styles.notifyText}>
                  {t('ConnectionNotification.SettingsInstruction')}
                  <Text style={styles.fakeLink} onPress={goToSettings}>
                    {t('ConnectionNotification.SettingsLink')}
                  </Text>
                  .
                </Text>
                <Text style={styles.notifyText}>{t('ConnectionNotification.PrivacyMessage')}</Text>
              </View>
            }
            onCallToActionLabel={t('ConnectionNotification.PopupExit')}
            onCallToActionPressed={toggleInfoCard}
          />
        </View>
      </Modal>
      <Text style={styles.notifyText}>
        {t('ConnectionNotification.NotificationBodyUpper') +
          (connectionID || t('ContactDetails.AContact').toLowerCase()) +
          t('ConnectionNotification.NotificationBodyLower')}
      </Text>
    </View>
  )
}

export default ConnectionNotification
