import { AriesFrameworkError, AutoAcceptCredential } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CredentialCard from '../components/misc/CredentialCard'
import Record from '../components/record/Record'
import Title from '../components/texts/Title'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { connectionRecordFromId, getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import CredentialOfferAccept from './CredentialOfferAccept'

type CredentialOfferProps = StackScreenProps<NotificationStackParams, Screens.CredentialOffer>

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialOffer route prams were not set properly')
  }

  const { credentialId } = route.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingBottom: 16,
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
      await agent.credentials.acceptOffer({
        credentialRecordId: credential.id,
        autoAcceptCredential: AutoAcceptCredential.Always,
      })
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(
        'Unable to accept offer',
        'There was a problem while accepting the credential offer.',
        (err as Error).message,
        1024
      )
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
    }
  }

  const handleDeclinePress = async () => {
    navigation.navigate(Screens.CommonDecline, {
      declineType: DeclineType.CredentialOffer,
      itemId: credentialId,
    })
  }

  return (
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
        fields={credential.credentialAttributes}
      />
      <CredentialOfferAccept visible={acceptModalVisible} credentialId={credentialId} />
    </SafeAreaView>
  )
}

export default CredentialOffer
