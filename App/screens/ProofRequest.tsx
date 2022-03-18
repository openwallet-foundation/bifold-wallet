import type { StackScreenProps } from '@react-navigation/stack'

import { ProofRecord, ProofState, RequestedAttribute, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import ProofDeclined from '../assets/img/proof-declined.svg'
import ProofPending from '../assets/img/proof-pending.svg'
import ProofSuccess from '../assets/img/proof-success.svg'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { ColorPallet, TextTheme } from '../theme'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, Stacks } from '../types/navigators'
import { Attribute } from '../types/record'
import { connectionRecordFromId, firstMatchingCredentialAttributeValue, getConnectionName } from '../utils/helpers'

import Button, { ButtonType } from 'components/buttons/Button'
import NotificationModal from 'components/modals/NotificationModal'
import Record from 'components/record/Record'
import RecordAttribute from 'components/record/RecordAttribute'
import Title from 'components/texts/Title'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>

interface ProofRequestAttribute extends Attribute {
  values?: RequestedAttribute[]
}

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
  link: {
    ...TextTheme.normal,
    minHeight: TextTheme.normal.fontSize,
    color: ColorPallet.brand.link,
    paddingVertical: 2,
  },
  valueContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
})

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId } = route?.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useContext(Context)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)

  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const [retrievedCredentialAttributes, setRetrievedCredentialAttributes] = useState<[string, RequestedAttribute[]][]>(
    []
  )

  const proof = useProofById(proofId)

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

  useEffect(() => {
    const updateRetrievedCredentials = async (proof: ProofRecord) => {
      const creds = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
      if (!creds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      setRetrievedCredentials(creds)
      setRetrievedCredentialAttributes(Object.entries(creds?.requestedAttributes || {}))
    }

    updateRetrievedCredentials(proof).catch(() => {
      const error = new BifoldError(
        'Unable to update retrieved credentials',
        'There was a problem while updating retrieved credentials.',
        1026
      )
      dispatch({
        type: DispatchAction.SetError,
        payload: [{ error }],
      })
    })
  }, [])

  useEffect(() => {
    if (proof.state === ProofState.Done) {
      pendingModalVisible && setPendingModalVisible(false)
      setSuccessModalVisible(true)
    }
  }, [proof])

  useEffect(() => {
    if (proof.state === ProofState.Declined) {
      setDeclinedModalVisible(true)
    }
  }, [proof])

  const anyUnavailableCredentialAttributes = (attributes: [string, RequestedAttribute[]][] = []): boolean =>
    attributes.some(([, values]) => !values?.length)

  const handleAcceptPress = async () => {
    try {
      setButtonsVisible(false)
      setPendingModalVisible(true)
      const automaticRequestedCreds =
        retrievedCredentials && agent.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials)
      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      await agent.proofs.acceptRequest(proof.id, automaticRequestedCreds)
    } catch (e: unknown) {
      setButtonsVisible(true)
      setPendingModalVisible(false)
      const error = new BifoldError(
        'Unable to accept proof request',
        'There was a problem while accepting the proof request.',
        1025
      )
      dispatch({
        type: DispatchAction.SetError,
        payload: [{ error }],
      })
    }
  }

  const handleDeclinePress = async () => {
    Alert.alert(t('ProofRequest.RejectThisProof?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            setButtonsVisible(false)
            await agent.proofs.declineRequest(proof.id)
          } catch (e: unknown) {
            const error = new BifoldError(
              'Unable to reject proof request',
              'There was a problem while rejecting the proof request.',
              1025
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

  const connection = connectionRecordFromId(proof.connectionId)

  return (
    <>
      <Record
        header={() => (
          <View style={styles.headerTextContainer}>
            {anyUnavailableCredentialAttributes(retrievedCredentialAttributes) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  style={{ marginLeft: -2, marginRight: 10 }}
                  name="highlight-off"
                  color={TextTheme.headingOne.color}
                  size={TextTheme.headingOne.fontSize}
                ></Icon>
                <Text style={styles.headerText}>
                  <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
                  {t('ProofRequest.IsRequestingSomethingYouDontHaveAvailable')}:
                </Text>
              </View>
            ) : (
              <Text style={styles.headerText}>
                <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
                {t('ProofRequest.IsRequestingYouToShare')}:
              </Text>
            )}
          </View>
        )}
        footer={() => (
          <View style={{ marginBottom: 30 }}>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Share')}
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
        attributes={retrievedCredentialAttributes.map(([name, values]) => ({
          name,
          value: firstMatchingCredentialAttributeValue(name, values),
          values,
        }))}
        attribute={(attribute) => (
          <RecordAttribute
            attribute={attribute}
            attributeValue={(attribute: ProofRequestAttribute) => (
              <>
                {attribute?.values?.length ? (
                  <Text style={TextTheme.normal}>{attribute.value}</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      style={{ paddingTop: 2, paddingHorizontal: 2 }}
                      name="close"
                      color={ColorPallet.semantic.error}
                      size={TextTheme.normal.fontSize}
                    ></Icon>
                    <Text style={[TextTheme.normal, { color: ColorPallet.semantic.error }]}>
                      {t('ProofRequest.NotAvailableInYourWallet')}
                    </Text>
                  </View>
                )}
                {attribute?.values?.length ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() =>
                      navigation.navigate(Screens.ProofRequestAttributeDetails, {
                        proofId,
                        attributeName: attribute.name,
                        attributeCredentials: attribute.values || [],
                      })
                    }
                    style={styles.link}
                  >
                    <Text style={TextTheme.normal}>{t('ProofRequest.Details')}</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          />
        )}
      />
      <NotificationModal
        title={t('ProofRequest.SendingTheInformationSecurely')}
        visible={pendingModalVisible}
        doneHidden={true}
      >
        <ProofPending style={{ marginVertical: 20 }}></ProofPending>
      </NotificationModal>
      <NotificationModal
        title={t('ProofRequest.InformationSentSuccessfully')}
        visible={successModalVisible}
        onDone={() => {
          setSuccessModalVisible(false)
          navigation.pop()
          navigation.getParent()?.navigate(Stacks.TabStack, { screen: Screens.Home })
        }}
      >
        <ProofSuccess style={{ marginVertical: 20 }}></ProofSuccess>
      </NotificationModal>
      <NotificationModal
        title={t('ProofRequest.ProofRejected')}
        visible={declinedModalVisible}
        onDone={() => {
          setDeclinedModalVisible(false)
          navigation.pop()
          navigation.getParent()?.navigate(Stacks.TabStack, { screen: Screens.Home })
        }}
      >
        <ProofDeclined style={{ marginVertical: 20 }}></ProofDeclined>
      </NotificationModal>
    </>
  )
}

export default ProofRequest
