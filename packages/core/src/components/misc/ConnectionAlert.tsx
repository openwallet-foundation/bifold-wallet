import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import PopupModal from '../modals/PopupModal'
import Link from '../texts/Link'

import { InfoBoxType } from './InfoBox'
import UnorderedList from './UnorderedList'
import { ThemedText } from '../texts/ThemedText'

interface ConnectionAlertProps {
  connectionID?: string
}

const ConnectionAlert: React.FC<ConnectionAlertProps> = ({ connectionID }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
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
    row: {
      flexDirection: 'row',
    },
    notifyTitle: {
      marginBottom: 5,
    },
    notifyText: {
      marginVertical: 5,
    },
    notifyTextList: {
      marginVertical: 6,
    },
    informationIcon: {
      color: ColorPallet.notification.infoIcon,
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
        <ThemedText variant="title" style={styles.notifyTitle}>
          {t('ConnectionAlert.AddedContacts')}
        </ThemedText>
        <TouchableOpacity
          testID={t('Global.Info')}
          accessibilityLabel={t('ConnectionAlert.WhatAreContacts')}
          accessibilityRole={'button'}
          onPress={toggleInfoCard}
          hitSlop={hitSlop}
        >
          <Icon name={'information-outline'} size={30} style={styles.informationIcon} />
        </TouchableOpacity>
      </View>
      {infoCardVisible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          title={t('ConnectionAlert.WhatAreContacts')}
          bodyContent={
            <View>
              <ThemedText variant="popupModalText">{t('ConnectionAlert.PopupIntro')}</ThemedText>
              <UnorderedList
                unorderedListItems={[
                  t('ConnectionAlert.PopupPoint1'),
                  t('ConnectionAlert.PopupPoint2'),
                  t('ConnectionAlert.PopupPoint3'),
                ]}
              />
              <ThemedText variant="popupModalText">{t('ConnectionAlert.SettingsInstruction')}</ThemedText>
              <Link
                style={{ marginBottom: 8 }}
                onPress={navigateToSettings}
                linkText={t('ConnectionAlert.SettingsLink')}
              />
              <ThemedText variant="popupModalText">{t('ConnectionAlert.PrivacyMessage')}</ThemedText>
            </View>
          }
          onCallToActionLabel={t('ConnectionAlert.PopupExit')}
          onCallToActionPressed={toggleInfoCard}
        />
      )}
      <ThemedText style={styles.notifyText}>
        {t('ConnectionAlert.NotificationBodyUpper') +
          (connectionID || t('ContactDetails.AContact').toLowerCase()) +
          t('ConnectionAlert.NotificationBodyLower')}
      </ThemedText>
    </View>
  )
}

export default ConnectionAlert
