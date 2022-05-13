import type { StackScreenProps } from '@react-navigation/stack'

import {
  CredentialState,
  ProofRecord,
  ProofState,
  RequestedAttribute,
  RequestedPredicate,
  RetrievedCredentials,
} from '@aries-framework/core'
import { useAgent, useCredentialByState, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import Record from '../components/record/Record'
import RecordField from '../components/record/RecordField'
import Title from '../components/texts/Title'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { Attribute, Predicate } from '../types/record'
import {
  connectionRecordFromId,
  getConnectionName,
  processProofAttributes,
  processProofPredicates,
} from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccepted from './ProofRequestAccepted'
import ProofRequestDeclined from './ProofRequestDeclined'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId } = route?.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  // const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [didDeclineProofRequest, setDidDeclineProofRequest] = useState<boolean>(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)
  const timestamps: Record<string, Date> = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ].reduce(
    (timestamps, credential) => ({
      ...timestamps,
      [credential.credentialId || credential.id]: new Date(credential.createdAt),
    }),
    {}
  )
  const [credentials, setCredentials] = useState<RetrievedCredentials>()
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [predicates, setPredicates] = useState<Predicate[]>([])
  const proof = useProofById(proofId)
  const { ListItems } = useTheme()

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeText,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
    link: {
      ...ListItems.recordAttributeText,
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    valueContainer: {
      minHeight: ListItems.recordAttributeText.fontSize,
      paddingVertical: 4,
    },
  })

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

  useMemo(() => {
    const retrieveCredentialsForProof = async (proof: ProofRecord) => {
      try {
        const credentials = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
        if (!credentials) {
          throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
        }
        return credentials
      } catch (error: unknown) {
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      }
    }

    retrieveCredentialsForProof(proof)
      .then((credentials) => {
        const markRevokedCredentials = (fields: Record<string, RequestedAttribute[] | RequestedPredicate[]> = {}) => {
          Object.values(fields).forEach((credentials) => {
            credentials
              .sort((a, b) => timestamps[b.credentialId].valueOf() - timestamps[a.credentialId].valueOf())
              .forEach((credential) => {
                // FIXME: Once hooks are updated this should no longer be necessary
                if (credential.revoked) {
                  dispatch({ type: DispatchAction.CREDENTIAL_REVOKED, payload: [credential] })
                }
              })
          })
        }
        markRevokedCredentials(credentials?.requestedAttributes)
        markRevokedCredentials(credentials?.requestedPredicates)
        setCredentials(credentials)

        const attributes = processProofAttributes(proof, credentials?.requestedAttributes)
        const predicates = processProofPredicates(proof, credentials?.requestedPredicates)
        setAttributes(attributes)
        setPredicates(predicates)
      })
      .catch(() => {
        const error = new BifoldError(
          'Unable to update retrieved credentials',
          'There was a problem while updating retrieved credentials.',
          1026
        )
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      })
  }, [])

  useEffect(() => {
    if (proof.state === ProofState.Declined) {
      setDeclinedModalVisible(true)
    }
  }, [proof])

  const anyUnavailable = (fields: Record<string, RequestedAttribute[] | RequestedPredicate[]> = {}): boolean =>
    !Object.values(fields).length || Object.values(fields).some((credentials) => !credentials?.length)

  const anyRevoked = (fields: Record<string, RequestedAttribute[] | RequestedPredicate[]> = {}): boolean =>
    Object.values(fields).some((credentials) => credentials?.every((credential) => credential.revoked))

  // FIXME: Once AFJ is updated this should no longer be necessary.
  const filterRevokedCredentialsFromReceived = (
    credentials: RetrievedCredentials = { requestedAttributes: {}, requestedPredicates: {} }
  ): RetrievedCredentials => {
    return {
      requestedAttributes: Object.entries(credentials.requestedAttributes).reduce(
        (filteredCredentials, [attributeName, attributeValues]) => {
          return {
            ...filteredCredentials,
            [attributeName]: attributeValues.filter((credential) => !credential.revoked),
          }
        },
        {}
      ),
      requestedPredicates: Object.entries(credentials.requestedPredicates).reduce(
        (filteredCredentials, [predicateName, predicateValues]) => {
          return {
            ...filteredCredentials,
            [predicateName]: predicateValues.filter((credential) => !credential.revoked),
          }
        },
        {}
      ),
    }
  }

  const handleAcceptPress = async () => {
    try {
      setButtonsVisible(false)
      setPendingModalVisible(true)
      // FIXME: Once AFJ is updated this should no longer be necessary.
      const nonRevokedCredentials = filterRevokedCredentialsFromReceived(credentials)
      const automaticRequestedCreds =
        credentials && agent.proofs.autoSelectCredentialsForProofRequest(nonRevokedCredentials)
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
        type: DispatchAction.ERROR_ADDED,
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
      await agent.proofs.declineRequest(proof.id)
      setDidDeclineProofRequest(true)
    } catch (e: unknown) {
      const error = new BifoldError(
        'Unable to reject offer',
        'There was a problem while rejecting the credential offer.',
        1024
      )
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
    }
  }

  const connection = connectionRecordFromId(proof.connectionId)

  return (
    <>
      <Record
        header={() => (
          <View style={styles.headerTextContainer}>
            {anyUnavailable({ ...credentials?.requestedAttributes, ...credentials?.requestedPredicates }) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                  style={{ marginLeft: -2, marginRight: 10 }}
                  name="highlight-off"
                  color={ListItems.proofIcon.color}
                  size={ListItems.proofIcon.fontSize}
                />
                <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                  <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
                  {t('ProofRequest.IsRequestingSomethingYouDontHaveAvailable')}:
                </Text>
              </View>
            ) : (
              <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
                {t('ProofRequest.IsRequestingYouToShare')}:
              </Text>
            )}
          </View>
        )}
        footer={() => (
          <View style={{ marginBottom: 30 }}>
            {!(
              anyUnavailable({ ...credentials?.requestedAttributes, ...credentials?.requestedPredicates }) ||
              anyRevoked({ ...credentials?.requestedAttributes, ...credentials?.requestedPredicates })
            ) ? (
              <View style={styles.footerButton}>
                <Button
                  title={t('Global.Share')}
                  accessibilityLabel={t('Global.Share')}
                  testID={testIdWithKey('Share')}
                  buttonType={ButtonType.Primary}
                  onPress={handleAcceptPress}
                  disabled={!buttonsVisible}
                />
              </View>
            ) : null}
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Decline')}
                accessibilityLabel={t('Global.Decline')}
                testID={testIdWithKey('Decline')}
                buttonType={
                  anyUnavailable({ ...credentials?.requestedAttributes, ...credentials?.requestedPredicates }) ||
                  anyRevoked({ ...credentials?.requestedAttributes, ...credentials?.requestedPredicates })
                    ? ButtonType.Primary
                    : ButtonType.Secondary
                }
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
              />
            </View>
          </View>
        )}
        fields={[...attributes, ...predicates]}
        field={(field) => {
          return (
            <RecordField
              field={field}
              fieldValue={(field) => (
                <>
                  {(!(field as Attribute)?.value && !(field as Predicate)?.pValue) || field?.revoked ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon
                        style={{ paddingTop: 2, paddingHorizontal: 2 }}
                        name="close"
                        color={ListItems.proofError.color}
                        size={ListItems.recordAttributeText.fontSize}
                      />

                      <Text
                        style={[ListItems.recordAttributeText, { color: ListItems.proofError.color }]}
                        testID={testIdWithKey('RevokedOrNotAvailable')}
                      >
                        {field?.revoked ? t('CredentialDetails.Revoked') : t('ProofRequest.NotAvailableInYourWallet')}
                      </Text>
                    </View>
                  ) : (
                    <Text style={ListItems.recordAttributeText} testID={testIdWithKey('AttributeValue')}>
                      {(field as Attribute)?.value || `${(field as Predicate)?.pType} ${(field as Predicate)?.pValue}`}
                    </Text>
                  )}
                  {(field as Attribute)?.value ? (
                    <TouchableOpacity
                      accessible={true}
                      accessibilityLabel={t('ProofRequest.Details')}
                      testID={testIdWithKey('Details')}
                      activeOpacity={1}
                      onPress={() =>
                        navigation.navigate(Screens.ProofRequestAttributeDetails, {
                          proofId,
                          attributeName: field.name,
                        })
                      }
                      style={styles.link}
                    >
                      <Text style={ListItems.recordAttributeText}>{t('ProofRequest.Details')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            />
          )
        }}
      />
      <ProofRequestAccepted visible={pendingModalVisible} proofId={proofId} />
      <ProofRequestDeclined
        visible={declinedModalVisible}
        proofId={proofId}
        didDeclineOffer={didDeclineProofRequest}
        onDeclinedConformationTouched={onDeclinedConformationTouched}
        onGoBackTouched={onGoBackTouched}
      />
    </>
  )
}

export default ProofRequest
