import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

export interface CredentialOfferDeclineProps {
  visible: boolean
  didDeclineOffer: boolean
  onGoBackTouched: GenericFn
  onDeclinedConformationTouched: GenericFn
}

const CredentialOfferDecline: React.FC<CredentialOfferDeclineProps> = ({
  visible,
  didDeclineOffer,
  onGoBackTouched,
  onDeclinedConformationTouched,
}) => {
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
    },
    image: {
      marginVertical: 66,
    },
    messageContainer: {
      marginHorizontal: 25,
      marginTop: 25,
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 90,
    },
    controlsContainer: {
      marginHorizontal: 25,
      marginTop: 25,
    },
  })

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    setModalVisible(visible)
  })

  return (
    <Modal visible={modalVisible} transparent={true} animationType={'none'}>
      <SafeAreaView style={[styles.container]}>
        <View style={[{ marginTop: 25 }]}>
          {!didDeclineOffer && (
            <>
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={'Are you sure you want to decline this credential?'}
                message={'In order to receive the credential offer again, you will need to reapply with the issuer.'}
              />
              <View style={[styles.controlsContainer]}>
                <Button
                  title={t('CredentialOffer.ConfirmDeclineCredential')}
                  accessibilityLabel={t('CredentialOffer.ConfirmDeclineCredential')}
                  testID={testIdWithKey('ConfirmDeclineCredential')}
                  onPress={onDeclinedConformationTouched}
                  buttonType={ButtonType.Primary}
                />
                <View style={[{ marginTop: 10 }]}>
                  <Button
                    title={t('CredentialOffer.AbortDeclineCredential')}
                    accessibilityLabel={t('CredentialOffer.AbortDeclineCredential')}
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

              <View style={[styles.controlsContainer]}>
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
