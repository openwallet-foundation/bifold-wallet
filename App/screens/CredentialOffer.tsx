import { CredentialState } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Alert, View, Text } from 'react-native'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import CredentialPending from '../assets/img/credential-pending.svg'
import CredentialSuccess from '../assets/img/credential-success.svg'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { TextTheme } from '../theme'
import { BifoldError } from '../types/error'
import { HomeStackParams, Screens, TabStacks } from '../types/navigators'
import { connectionRecordFromId, getConnectionName } from '../utils/helpers'

import Button, { ButtonType } from 'components/buttons/Button'
import CredentialCard from 'components/misc/CredentialCard'
import NotificationModal from 'components/modals/NotificationModal'
import Record from 'components/record/Record'
import Title from 'components/texts/Title'

type CredentialOfferProps = StackScreenProps<HomeStackParams, Screens.CredentialOffer>

const styles = StyleSheet.create({
  headerTextContainer: {
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
  },
  footerButton: {
    paddingTop: 10,
  },
})

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialOffer route prams were not set properly')
  }

  const { credentialId } = route.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useContext(Context)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)

  const credential = useCredentialById(credentialId)

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!credential) {
    throw new Error('Unable to fetch credential from AFJ')
  }

  useEffect(() => {
    if (credential.state === CredentialState.Declined) {
      setDeclinedModalVisible(true)
    }
  }, [credential])

  useEffect(() => {
    if (credential.state === CredentialState.CredentialReceived || credential.state === CredentialState.Done) {
      pendingModalVisible && setPendingModalVisible(false)
      setSuccessModalVisible(true)
    }
  }, [credential])

  const handleAcceptPress = async () => {
    try {
      setButtonsVisible(false)
      setPendingModalVisible(true)
      await agent.credentials.acceptOffer(credential.id)
    } catch (e: unknown) {
      setButtonsVisible(true)
      setPendingModalVisible(false)
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
    Alert.alert(t('CredentialOffer.RejectThisCredential?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            setButtonsVisible(false)
            await agent.credentials.declineOffer(credential.id)
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
        },
      },
    ])
  }

  const connection = connectionRecordFromId(credential.connectionId)

  return (
    <>
      <Record
        header={() => (
          <>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
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
                buttonType={ButtonType.Primary}
                onPress={handleAcceptPress}
                disabled={!buttonsVisible}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Decline')}
                buttonType={ButtonType.Secondary}
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
              />
            </View>
          </View>
        )}
        attributes={credential.credentialAttributes}
      />
      <NotificationModal
        testID={t('CredentialOffer.CredentialOnTheWay')}
        title={t('CredentialOffer.CredentialOnTheWay')}
        visible={pendingModalVisible}
        doneHidden={true}
      >
        <CredentialPending style={{ marginVertical: 20 }}></CredentialPending>
      </NotificationModal>
      <NotificationModal
        testID={t('CredentialOffer.CredentialAddedToYourWallet')}
        title={t('CredentialOffer.CredentialAddedToYourWallet')}
        visible={successModalVisible}
        onDone={() => {
          setSuccessModalVisible(false)
          navigation.pop()
          navigation.getParent()?.navigate(TabStacks.CredentialStack, { screen: Screens.Credentials })
        }}
      >
        <CredentialSuccess style={{ marginVertical: 20 }}></CredentialSuccess>
      </NotificationModal>
      <NotificationModal
        testID={t('CredentialOffer.CredentialDeclined')}
        title={t('CredentialOffer.CredentialDeclined')}
        visible={declinedModalVisible}
        onDone={() => {
          setDeclinedModalVisible(false)
          navigation.pop()
          navigation.navigate(Screens.Home)
        }}
      >
        <CredentialDeclined style={{ marginVertical: 20 }}></CredentialDeclined>
      </NotificationModal>
    </>
  )
}

export default CredentialOffer
