import { useAgent, useProofById } from '@credo-ts/react-hooks'
import { isPresentationFailed, isPresentationReceived } from '@hyperledger/aries-bifold-verifier'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

import PresentationLoading from '../components/animated/PresentationLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import SafeAreaModal from '../components/modals/SafeAreaModal'
import { useTheme } from '../contexts/theme'
import { useOutOfBandByConnectionId } from '../hooks/connections'
import { DeliveryStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type MobileVerifierLoadingProps = StackScreenProps<DeliveryStackParams, Screens.MobileVerifierLoading>

const MobileVerifierLoading: React.FC<MobileVerifierLoadingProps> = ({ navigation, route }) => {
  const { proofId, connectionId } = route.params
  const goalCode = useOutOfBandByConnectionId(connectionId)?.outOfBandInvitation.goalCode
  const proofRecord = useProofById(proofId)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { agent } = useAgent()

  if (!agent) {
    throw new Error('Unable to fetch agent from Credo')
  }

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
    },
    image: {
      marginTop: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: TextTheme.normal.fontWeight,
      textAlign: 'center',
      marginTop: 30,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
  })

  const onDismissModalTouched = useCallback(() => {
    if (proofRecord && (isPresentationReceived(proofRecord) || isPresentationFailed(proofRecord))) {
      if (goalCode?.endsWith('verify.once')) {
        agent.connections.deleteById(connectionId)
      }
    }

    navigation.pop()
  }, [navigation, proofRecord, goalCode, agent, connectionId])

  useEffect(() => {
    if (proofRecord && (isPresentationReceived(proofRecord) || isPresentationFailed(proofRecord))) {
      navigation.replace(Screens.ProofDetails, { recordId: proofRecord.id })
    }
  }, [proofRecord, goalCode, agent, connectionId, navigation])

  return (
    <SafeAreaModal transparent animationType={'slide'}>
      <SafeAreaView style={{ backgroundColor: ColorPallet.brand.modalPrimaryBackground }}>
        <ScrollView style={styles.container}>
          <View style={styles.messageContainer}>
            <Text style={[TextTheme.modalHeadingThree, styles.messageText]} testID={testIdWithKey('VerifierLoading')}>
              {t('Verifier.WaitingForResponse')}
            </Text>
          </View>

          <View style={styles.image}>
            <PresentationLoading />
          </View>
        </ScrollView>
        <View style={styles.controlsContainer}>
          <Button
            title={t('Global.GoBack')}
            accessibilityLabel={t('Global.GoBack')}
            testID={testIdWithKey('BackToProofList')}
            onPress={onDismissModalTouched}
            buttonType={ButtonType.ModalSecondary}
          />
        </View>
      </SafeAreaView>
    </SafeAreaModal>
  )
}

export default MobileVerifierLoading
