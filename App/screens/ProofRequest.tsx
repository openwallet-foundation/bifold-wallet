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
import Button, { ButtonType } from '../components/buttons/Button'
import NotificationModal from '../components/modals/NotificationModal'
import Record from '../components/record/Record'
import RecordAttribute from '../components/record/RecordAttribute'
import Title from '../components/texts/Title'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import { Attribute } from '../types/record'
import {
  connectionRecordFromId,
  firstAttributeCredential,
  getConnectionName,
  valueFromAttributeCredential,
} from '../utils/helpers'
import { useThemeContext } from '../utils/themeContext'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>

interface ProofRequestAttribute extends Attribute {
  values?: RequestedAttribute[]
}

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

  const [credentials, setCredentials] = useState<RetrievedCredentials>()
  const [attributeCredentials, setAttributeCredentials] = useState<[string, RequestedAttribute[]][]>([])

  const proof = useProofById(proofId)
  const { ColorPallet, TextTheme } = useThemeContext()
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
  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

  useEffect(() => {
    const updateRetrievedCredentials = async (proof: ProofRecord) => {
      try {
        const creds = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
        if (!creds) {
          throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
        }
        setCredentials(creds)
        setAttributeCredentials(Object.entries(creds?.requestedAttributes || {}))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`ERROR1:`, error)
        throw error
      }
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

  const anyUnavailable = (attributes: [string, RequestedAttribute[]][] = []): boolean =>
    attributes.some(([, values]) => !values?.length)

  const anyRevoked = (attributes: [string, RequestedAttribute[]][] = []): boolean =>
    attributes.some(([, values]) => values?.every((value) => value.revoked))

  const handleAcceptPress = async () => {
    try {
      setButtonsVisible(false)
      setPendingModalVisible(true)
      const automaticRequestedCreds = credentials && agent.proofs.autoSelectCredentialsForProofRequest(credentials)
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
            {anyUnavailable(attributeCredentials) ? (
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
            {!(anyUnavailable(attributeCredentials) || anyRevoked(attributeCredentials)) ? (
              <View style={styles.footerButton}>
                <Button
                  title={t('Global.Share')}
                  buttonType={ButtonType.Primary}
                  onPress={handleAcceptPress}
                  disabled={!buttonsVisible}
                />
              </View>
            ) : null}
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Decline')}
                buttonType={
                  anyUnavailable(attributeCredentials) || anyRevoked(attributeCredentials)
                    ? ButtonType.Primary
                    : ButtonType.Secondary
                }
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
              />
            </View>
          </View>
        )}
        attributes={attributeCredentials.map(([name, values]) => ({
          name,
          value: firstAttributeCredential(values),
          values,
        }))}
        attribute={(attribute) => {
          return (
            <RecordAttribute
              attribute={attribute}
              attributeValue={(attribute: ProofRequestAttribute) => (
                <>
                  {!attribute?.values?.length || (attribute?.value as RequestedAttribute)?.revoked ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon
                        style={{ paddingTop: 2, paddingHorizontal: 2 }}
                        name="close"
                        color={ColorPallet.semantic.error}
                        size={TextTheme.normal.fontSize}
                      ></Icon>

                      <Text style={[TextTheme.normal, { color: ColorPallet.semantic.error }]}>
                        {(attribute?.value as RequestedAttribute)?.revoked
                          ? t('CredentialDetails.Revoked')
                          : t('ProofRequest.NotAvailableInYourWallet')}
                      </Text>
                    </View>
                  ) : (
                    <Text style={TextTheme.normal}>
                      {valueFromAttributeCredential(attribute.name, attribute.value as RequestedAttribute)}
                    </Text>
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
          )
        }}
      />
      {pendingModalVisible ? (
        <NotificationModal
          testID={t('ProofRequest.SendingTheInformationSecurely')}
          title={t('ProofRequest.SendingTheInformationSecurely')}
          visible={pendingModalVisible}
          homeVisible={false}
          doneTitle={t('Loading.BackToHome')}
          doneType={ButtonType.Secondary}
          doneAccessibilityLabel={t('Loading.BackToHome')}
          onDone={() => {
            setPendingModalVisible(false)
            navigation.pop()
            navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
          }}
        >
          <ProofPending style={{ marginVertical: 20 }}></ProofPending>
        </NotificationModal>
      ) : null}
      {successModalVisible ? (
        <NotificationModal
          title={t('ProofRequest.InformationSentSuccessfully')}
          visible={successModalVisible}
          homeVisible={false}
          onDone={() => {
            setSuccessModalVisible(false)
            navigation.pop()
            navigation.getParent()?.navigate(Stacks.TabStack, { screen: Screens.Home })
          }}
        >
          <ProofSuccess style={{ marginVertical: 20 }}></ProofSuccess>
        </NotificationModal>
      ) : null}
      {declinedModalVisible ? (
        <NotificationModal
          title={t('ProofRequest.ProofRejected')}
          visible={declinedModalVisible}
          homeVisible={false}
          onDone={() => {
            setDeclinedModalVisible(false)
            navigation.pop()
            navigation.getParent()?.navigate(Stacks.TabStack, { screen: Screens.Home })
          }}
        >
          <ProofDeclined style={{ marginVertical: 20 }}></ProofDeclined>
        </NotificationModal>
      ) : null}
    </>
  )
}

export default ProofRequest
