import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { ColorPallet, TextTheme } from '../theme'
import { GenericFn } from '../types/fn'
import { Screens, TabStacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const imageDisplayOptions = {
  fill: ColorPallet.notification.infoText,
  height: 250,
  width: 250,
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: ColorPallet.brand.primaryBackground,
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
                  accessibilityLabel={t('Global.Confirm')}
                  testID={testIdWithKey('ConfirmDecline')}
                  onPress={onDeclinedConformationTouched}
                  buttonType={ButtonType.Primary}
                />
                <View style={[{ marginTop: 10 }]}>
                  <Button
                    title={t('CredentialOffer.AbortDeclineCredential')}
                    accessibilityLabel={t('Global.GoBack')}
                    testID={testIdWithKey('NoGoBack')}
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
                <Text style={[TextTheme.headingThree, styles.messageText]}>
                  {t('CredentialOffer.CredentialDeclined')}
                </Text>
                <CredentialDeclined style={[styles.image]} {...imageDisplayOptions} />
              </View>

              <View style={[styles.controlsContainer]}>
                <Button
                  title={t('Global.Done')}
                  accessibilityLabel={t('Global.Home')}
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
