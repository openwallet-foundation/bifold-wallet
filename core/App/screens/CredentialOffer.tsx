import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CredentialCard from '../components/misc/CredentialCard'
import Record from '../components/record/Record'
import Title from '../components/texts/Title'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { BifoldError } from '../types/error'
import { DeliveryStackParams, Screens } from '../types/navigators'
import { connectionRecordFromId, getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { useThemeContext } from '../utils/themeContext'

import CredentialOfferAccept from './CredentialOfferAccept'
import CredentialOfferDecline from './CredentialOfferDecline'

type CredentialOfferProps = StackScreenProps<DeliveryStackParams, Screens.CredentialOffer>

const CredentialOffer: React.FC<CredentialOfferProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('CredentialOffer route prams were not set properly')
  }

  const { credentialId } = route.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useContext(Context)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [didDeclineOffer, setDidDeclineOffer] = useState<boolean>(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const { ListItems } = useThemeContext()
  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeLabel,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
  })
  const credential = useCredentialById(credentialId)

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!credential) {
    throw new Error('Unable to fetch credential from AFJ')
  }

  const connection = connectionRecordFromId(credential.connectionId)

  const handleAcceptPress = async () => {
    try {
      setAcceptModalVisible(true)

      await agent.credentials.acceptOffer(credential.id)
    } catch (e: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(
        'Unable to accept offer',
        'There was a problem while accepting the credential offer.',
        1024
      )
      dispatch({
        type: DispatchAction.SetError,
        payload: [{ error }],
      })
    }
  }

  const handleDeclinePress = async () => {
    setDeclinedModalVisible(true)
  }

  const onGoBackTouched = () => {
    setDeclinedModalVisible(false)
  }

  const onDeclinedConformationTouched = async () => {
    try {
      await agent.credentials.declineOffer(credential.id)
      setDidDeclineOffer(true)
    } catch (e: unknown) {
      const error = new BifoldError(
        'Unable to reject offer',
        'There was a problem while rejecting the credential offer.',
        1024
      )
      dispatch({
        type: DispatchAction.SetError,
        payload: [{ error }],
      })
    }
  }

  return (
    <Modal transparent={true} animationType={'fade'}>
      <SafeAreaView>
        <Record
          header={() => (
            <>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                  <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
                  {t('CredentialOffer.IsOfferingYouACredential')}
                </Text>
              </View>
              <CredentialCard credential={credential} style={{ marginHorizontal: 15, marginBottom: 16 }} />
            </>
          )}
          footer={() => (
            <View style={{ marginBottom: 30 }}>
              <View style={styles.footerButton}>
                <Button
                  title={t('Global.Accept')}
                  accessibilityLabel={t('Global.Accept')}
                  testID={testIdWithKey('AcceptCredentialOffer')}
                  buttonType={ButtonType.Primary}
                  onPress={handleAcceptPress}
                  disabled={!buttonsVisible}
                />
              </View>
              <View style={styles.footerButton}>
                <Button
                  title={t('Global.Decline')}
                  accessibilityLabel={t('Global.Decline')}
                  testID={testIdWithKey('DeclineCredentialOffer')}
                  buttonType={ButtonType.Secondary}
                  onPress={handleDeclinePress}
                  disabled={!buttonsVisible}
                />
              </View>
            </View>
          )}
          attributes={credential.credentialAttributes}
        />
        <CredentialOfferDecline
          visible={declinedModalVisible}
          didDeclineOffer={didDeclineOffer}
          onDeclinedConformationTouched={onDeclinedConformationTouched}
          onGoBackTouched={onGoBackTouched}
        />
        <CredentialOfferAccept visible={acceptModalVisible} credentialId={credentialId} />
      </SafeAreaView>
    </Modal>
  )
}

export default CredentialOffer
