import { useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Modal, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { Screens, TabStacks } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

export interface CredentialOfferDeclineProps {
  visible: boolean
  credentialId: string
  didDeclineOffer: boolean
  onGoBackTouched: GenericFn
  onDeclinedConformationTouched: GenericFn
}

const CredentialOfferDecline: React.FC<CredentialOfferDeclineProps> = ({
  visible,
  credentialId,
  didDeclineOffer,
  onGoBackTouched,
  onDeclinedConformationTouched,
}) => {
  const credential = useCredentialById(credentialId)
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const navigation = useNavigation()
  const { ListItems } = useTheme()
  const imageDisplayOptions = {
    fill: ListItems.credentialIconColor.color,
    height: 250,
    width: 250,
  }
  const styles = StyleSheet.create({
    container: {
      ...ListItems.credentialOfferBackground,
      flexGrow: 1,
      paddingHorizontal: 25,
    },
    image: {
      marginVertical: 66,
    },
    messageContainer: {
      marginTop: 25,
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 90,
    },
  })

  if (!credential) {
    throw new Error('Unable to fetch credential from AFJ')
  }

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    setModalVisible(visible)
  })

  return (
    <Modal visible={modalVisible} transparent={true} animationType={'none'}>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(styles.container.backgroundColor)
        }
      />
      <SafeAreaView style={[styles.container]}>
        <View style={[{ marginTop: 25 }]}>
          {!didDeclineOffer && (
            <>
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={t('CredentialOffer.ConfirmDeclinedTitle')}
                message={t('CredentialOffer.ConfirmDeclinedMessage')}
              />
              <CredentialCard credential={credential} style={{ marginVertical: 25 }} />
              <View>
                <Button
                  title={t('CredentialOffer.ConfirmDecline')}
                  accessibilityLabel={t('CredentialOffer.ConfirmDecline')}
                  testID={testIdWithKey('ConfirmDeclineCredential')}
                  onPress={onDeclinedConformationTouched}
                  buttonType={ButtonType.Primary}
                />
                <View style={[{ marginTop: 10 }]}>
                  <Button
                    title={t('CredentialOffer.AbortDecline')}
                    accessibilityLabel={t('CredentialOffer.AbortDecline')}
                    testID={testIdWithKey('AbortDeclineCredential')}
                    onPress={onGoBackTouched}
                    buttonType={ButtonType.Secondary}
                  />
                </View>
              </View>
            </>
          )}

          {didDeclineOffer && (
            <>
              <View style={[styles.messageContainer]}>
                <Text
                  style={[ListItems.credentialOfferTitle, styles.messageText]}
                  testID={testIdWithKey('CredentialDeclined')}
                >
                  {t('CredentialOffer.CredentialDeclined')}
                </Text>
                <CredentialDeclined style={[styles.image]} {...imageDisplayOptions} />
              </View>

              <View>
                <Button
                  title={t('Global.Done')}
                  accessibilityLabel={t('Global.Done')}
                  testID={testIdWithKey('Done')}
                  onPress={onDoneTouched}
                  buttonType={ButtonType.Primary}
                />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default CredentialOfferDecline
