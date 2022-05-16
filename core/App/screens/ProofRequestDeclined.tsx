import { useProofById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StatusBar, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import PRDeclined from '../assets/img/proof-declined.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'
import { Screens, TabStacks } from '../types/navigators'
import { statusBarStyleForColor } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

export interface ProofRequestDeclinedProps {
  visible: boolean
  proofId: string
  didDeclineOffer: boolean
  onGoBackTouched: GenericFn
  onDeclinedConformationTouched: GenericFn
}

const ProofRequestDeclined: React.FC<ProofRequestDeclinedProps> = ({
  visible,
  proofId,
  didDeclineOffer,
  onGoBackTouched,
  onDeclinedConformationTouched,
}) => {
  const proof = useProofById(proofId)
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

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  useEffect(() => {
    setModalVisible(visible)
  })

  return (
    <Modal visible={modalVisible} transparent={true} animationType={'none'} statusBarTranslucent>
      <StatusBar barStyle={statusBarStyleForColor(styles.container.backgroundColor)} />
      <SafeAreaView style={[styles.container]}>
        <View style={[{ marginTop: 25 }]}>
          {!didDeclineOffer && (
            <>
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={t('ProofRequest.ConfirmDeclinedTitle')}
                message={t('ProofRequest.ConfirmDeclinedMessage')}
              />
              <View style={{ marginVertical: 25 }}>
                <Button
                  title={t('ProofRequest.ConfirmDecline')}
                  accessibilityLabel={t('ProofRequest.ConfirmDecline')}
                  testID={testIdWithKey('ConfirmDeclineProofRequest')}
                  onPress={onDeclinedConformationTouched}
                  buttonType={ButtonType.Primary}
                />
                <View style={[{ marginTop: 10 }]}>
                  <Button
                    title={t('ProofRequest.AbortDecline')}
                    accessibilityLabel={t('ProofRequest.AbortDecline')}
                    testID={testIdWithKey('AbortDeclineProofRequest')}
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
                  style={[TextTheme.headingThree, styles.messageText]}
                  testID={testIdWithKey('ProofRequestDeclined')}
                >
                  {t('ProofRequest.ProofRequestDeclined')}
                </Text>
                <PRDeclined style={[styles.image]} {...imageDisplayOptions} />
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

export default ProofRequestDeclined
