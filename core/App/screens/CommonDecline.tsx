import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Modal, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import ProofRequestDeclined from '../assets/img/proof-declined.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { Screens, TabStacks } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

export enum DeclineType {
  ProofRequest,
  CredentialOffer,
}

export interface CommonDeclineProps {
  visible: boolean
  declineType: DeclineType
  didDeclineOfferOrProof: boolean
  onGoBackTouched: GenericFn
  onDeclinedConformationTouched: GenericFn
}

const CommonDecline: React.FC<CommonDeclineProps> = ({
  visible,
  declineType,
  didDeclineOfferOrProof,
  onGoBackTouched,
  onDeclinedConformationTouched,
}) => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const navigation = useNavigation()
  const { ColorPallet, TextTheme } = useTheme()
  const imageDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 250,
    width: 250,
  }
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
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

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    setModalVisible(visible)
  })

  return (
    <Modal visible={modalVisible} transparent={true} animationType={'none'} statusBarTranslucent>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(styles.container.backgroundColor)
        }
      />
      <SafeAreaView style={[styles.container]}>
        <View style={[{ marginTop: 25 }]}>
          {!didDeclineOfferOrProof && (
            <>
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={
                  declineType === DeclineType.ProofRequest
                    ? t('ProofRequest.ConfirmDeclinedTitle')
                    : t('CredentialOffer.ConfirmDeclinedTitle')
                }
                description={
                  declineType === DeclineType.ProofRequest
                    ? t('ProofRequest.ConfirmDeclinedMessage')
                    : t('CredentialOffer.ConfirmDeclinedMessage')
                }
              />
              <View style={{ marginVertical: 25 }}>
                <Button
                  title={
                    declineType === DeclineType.ProofRequest
                      ? t('ProofRequest.ConfirmDecline')
                      : t('CredentialOffer.ConfirmDecline')
                  }
                  accessibilityLabel={
                    declineType === DeclineType.ProofRequest
                      ? t('ProofRequest.ConfirmDecline')
                      : t('CredentialOffer.ConfirmDecline')
                  }
                  testID={testIdWithKey('ConfirmDeclineButton')}
                  onPress={onDeclinedConformationTouched}
                  buttonType={ButtonType.Primary}
                />
                <View style={[{ marginTop: 10 }]}>
                  <Button
                    title={
                      declineType === DeclineType.ProofRequest
                        ? t('ProofRequest.AbortDecline')
                        : t('CredentialOffer.AbortDecline')
                    }
                    accessibilityLabel={
                      declineType === DeclineType.ProofRequest
                        ? t('ProofRequest.AbortDecline')
                        : t('CredentialOffer.AbortDecline')
                    }
                    testID={testIdWithKey('AbortDeclineButton')}
                    onPress={onGoBackTouched}
                    buttonType={ButtonType.Secondary}
                  />
                </View>
              </View>
            </>
          )}

          {didDeclineOfferOrProof && (
            <>
              <View style={[styles.messageContainer]}>
                <Text
                  style={[TextTheme.headingThree, styles.messageText]}
                  testID={testIdWithKey('RequestOrOfferDeclined')}
                >
                  {declineType === DeclineType.ProofRequest
                    ? t('ProofRequest.ProofRequestDeclined')
                    : t('CredentialOffer.CredentialDeclined')}
                </Text>
                {declineType === DeclineType.ProofRequest ? (
                  <ProofRequestDeclined style={[styles.image]} {...imageDisplayOptions} />
                ) : (
                  <CredentialDeclined style={[styles.image]} {...imageDisplayOptions} />
                )}
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

export default CommonDecline
