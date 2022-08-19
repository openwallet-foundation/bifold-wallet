import type { StackScreenProps } from '@react-navigation/stack'

import { ProofRecord, RequestedAttribute, RequestedPredicate, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import flatten from 'lodash.flatten'
import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import RecordLoading from '../components/animated/RecordLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import Record from '../components/record/Record'
import RecordField from '../components/record/RecordField'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { Attribute, Predicate } from '../types/record'
import { processProofAttributes, processProofPredicates, sortCredentialsForAutoSelect } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccept from './ProofRequestAccept'

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
  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [predicates, setPredicates] = useState<Predicate[]>([])
  const proof = useProofById(proofId)
  const proofConnectionLabel = proof?.connectionId
    ? useConnectionById(proof.connectionId)?.theirLabel
    : proof?.connectionId ?? ''
  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  const [loading, setLoading] = React.useState<boolean>(true)
  const { ColorPallet, ListItems, TextTheme } = useTheme()

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

  useEffect(() => {
    if (!agent) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1034'),
              t('Error.Message1034'),
              t('ProofRequest.ProofRequestNotFound'),
              1034
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!proof) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1034'),
              t('Error.Message1034'),
              t('ProofRequest.ProofRequestNotFound'),
              1034
            ),
          },
        ],
      })
    }
  }, [])

  useMemo(() => {
    if (!(agent && proof)) {
      return
    }
    setLoading(true)
    const retrieveCredentialsForProof = async (proof: ProofRecord) => {
      try {
        const credentials = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id, {
          filterByNonRevocationRequirements: false,
        })
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
      .then((retrievedCredentials) => {
        if (!retrievedCredentials) {
          return
        }

        const fields: Fields = {
          ...retrievedCredentials?.requestedAttributes,
          ...retrievedCredentials?.requestedPredicates,
        }

        flatten(Object.values(fields))
          .filter((credential) => credential.revoked)
          .forEach((credential) => {
            dispatch({ type: DispatchAction.CREDENTIAL_REVOKED, payload: [credential] })
          })

        const attributes = processProofAttributes(proof, retrievedCredentials)
        const predicates = processProofPredicates(proof, retrievedCredentials)

        setRetrievedCredentials(retrievedCredentials)
        setAttributes(attributes)
        setPredicates(predicates)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const error = new BifoldError(t('Error.Title1026'), t('Error.Message1026'), (err as Error).message, 1026)
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      })
  }, [])

  const hasAvailableCredentials = (): boolean => {
    const fields: Fields = {
      ...retrievedCredentials?.requestedAttributes,
      ...retrievedCredentials?.requestedPredicates,
    }

    // TODO:(jl) Need to test with partial match? Maybe `.some` would work?
    return typeof retrievedCredentials !== 'undefined' && Object.values(fields).every((c) => c.length > 0)
  }

  const handleAcceptPress = async () => {
    try {
      if (!(agent && proof)) {
        return
      }
      setPendingModalVisible(true)

      if (!retrievedCredentials) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      const sortedCreds = sortCredentialsForAutoSelect(retrievedCredentials)
      const automaticRequestedCreds =
        retrievedCredentials && agent.proofs.autoSelectCredentialsForProofRequest(sortedCreds)

      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      await agent.proofs.acceptRequest(proof.id, automaticRequestedCreds)
    } catch (err: unknown) {
      setPendingModalVisible(false)

      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error).message, 1027)
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

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
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
                  <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                  {t('ProofRequest.IsRequestingSomethingYouDontHaveAvailable')}:
                </Text>
              </View>
            ) : (
              <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                {t('ProofRequest.IsRequestingYouToShare')}:
              </Text>
            )}
          </View>
        )}
        footer={() => (
          <View
            style={{
              paddingHorizontal: 25,
              paddingVertical: 16,
              paddingBottom: 26,
              backgroundColor: ColorPallet.brand.secondaryBackground,
            }}
          >
            {loading ? <RecordLoading /> : null}
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
                buttonType={!retrievedCredentials ? ButtonType.Primary : ButtonType.Secondary}
                onPress={handleDeclinePress}
              />
            </View>
          </View>
        )}
        fields={[...attributes, ...predicates]}
        field={(field, index, fields) => {
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
                          attributeName: (field as Attribute).name,
                        })
                      }
                      style={styles.link}
                    >
                      <Text style={styles.detailsButton}>{t('ProofRequest.Details')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
              hideBottomBorder={index === fields.length - 1}
            />
          )
        }}
      />
      <ProofRequestAccept visible={pendingModalVisible} proofId={proofId} />
    </SafeAreaView>
  )
}

export default ProofRequest
