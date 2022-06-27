import type { StackScreenProps } from '@react-navigation/stack'

import { ProofRecord, RequestedAttribute, RequestedPredicate, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import flatten from 'lodash.flatten'
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import RecordLoading from '../components/animated/RecordLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import Record from '../components/record/Record'
import RecordField from '../components/record/RecordField'
import Title from '../components/texts/Title'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { Attribute, Predicate } from '../types/record'
import {
  connectionRecordFromId,
  getConnectionName,
  processProofAttributes,
  processProofPredicates,
  sortCredentialsForAutoSelect,
} from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccepted from './ProofRequestAccepted'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>
type Fields = Record<string, RequestedAttribute[] | RequestedPredicate[]>

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId } = route?.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  // const timestamps: Record<string, Date> = [
  //   ...useCredentialByState(CredentialState.CredentialReceived),
  //   ...useCredentialByState(CredentialState.Done),
  // ].reduce(
  //   (timestamps, credential) => ({
  //     ...timestamps,
  //     [credential.credentialId || credential.id]: new Date(credential.createdAt),
  //   }),
  //   {}
  // )
  const [credentials, setCredentials] = useState<RetrievedCredentials>()
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [predicates, setPredicates] = useState<Predicate[]>([])
  const proof = useProofById(proofId)
  const { ColorPallet, ListItems } = useTheme()

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
    detailsButton: {
      ...ListItems.recordAttributeText,
      color: ColorPallet.brand.link,
      textDecorationLine: 'underline',
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
        if (!credentials) {
          return
        }

        const fields: Fields = {
          ...credentials?.requestedAttributes,
          ...credentials?.requestedPredicates,
        }

        flatten(Object.values(fields))
          .filter((credential) => credential.revoked)
          .forEach((credential) => {
            // console.log(`Marking revoked, ID = ${credential.credentialId}`)
            dispatch({ type: DispatchAction.CREDENTIAL_REVOKED, payload: [credential] })
          })

        const attributes = processProofAttributes(proof, credentials?.requestedAttributes)
        const predicates = processProofPredicates(proof, credentials?.requestedPredicates)

        setCredentials(credentials)
        setAttributes(attributes)
        setPredicates(predicates)
      })
      .catch((err: unknown) => {
        const error = new BifoldError(
          'Unable to update retrieved credentials',
          'There was a problem while updating retrieved credentials.',
          (err as Error).message,
          1026
        )
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      })
  }, [])

  const hasAvailableCredentials = (): boolean => {
    const fields: Fields = {
      ...credentials?.requestedAttributes,
      ...credentials?.requestedPredicates,
    }

    // TODO:(jl) Need to test with partial match? Maybe `.some` would work?
    return typeof credentials !== 'undefined' && Object.values(fields).every((c) => c.length > 0)
  }

  const handleAcceptPress = async () => {
    try {
      setPendingModalVisible(true)

      if (!credentials) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      const sortedCreds = sortCredentialsForAutoSelect(credentials)
      const automaticRequestedCreds = credentials && agent.proofs.autoSelectCredentialsForProofRequest(sortedCreds)

      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      await agent.proofs.acceptRequest(proof.id, automaticRequestedCreds)
    } catch (err: unknown) {
      setPendingModalVisible(false)

      const error = new BifoldError(
        'Unable to accept proof request',
        'There was a problem while accepting the proof request.',
        (err as Error).message,
        1027
      )
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
    }
  }

  const handleDeclinePress = async () => {
    navigation.navigate(Screens.CommonDecline, {
      declineType: DeclineType.ProofRequest,
      itemId: proofId,
    })
  }

  const connection = connectionRecordFromId(proof.connectionId)

  return (
    <SafeAreaView>
      <Record
        header={() => (
          <View style={styles.headerTextContainer}>
            {!hasAvailableCredentials() ? (
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
            {!credentials ? <RecordLoading /> : null}
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Share')}
                accessibilityLabel={t('Global.Share')}
                testID={testIdWithKey('Share')}
                buttonType={ButtonType.Primary}
                onPress={handleAcceptPress}
                disabled={!hasAvailableCredentials()}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Decline')}
                accessibilityLabel={t('Global.Decline')}
                testID={testIdWithKey('Decline')}
                buttonType={!credentials ? ButtonType.Primary : ButtonType.Secondary}
                onPress={handleDeclinePress}
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
                      <Text style={styles.detailsButton}>{t('ProofRequest.Details')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            />
          )
        }}
      />
      <ProofRequestAccepted visible={pendingModalVisible} proofId={proofId} />
    </SafeAreaView>
  )
}

export default ProofRequest
