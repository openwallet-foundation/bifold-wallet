import type { StackScreenProps } from '@react-navigation/stack'

import {
  IndyProofFormat,
  IndyRetrievedCredentialsFormat,
  ProofExchangeRecord,
  RequestedAttribute,
  RequestedPredicate,
} from '@aries-framework/core'
import {
  FormatRetrievedCredentialOptions,
  GetFormatDataReturn,
} from '@aries-framework/core/build/modules/proofs/models/ProofServiceOptions'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import RecordLoading from '../components/animated/RecordLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import ConnectionAlert from '../components/misc/ConnectionAlert'
import Record from '../components/record/Record'
import RecordField from '../components/record/RecordField'
import { useNetwork } from '../contexts/network'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { Attribute, Predicate } from '../types/record'
import { processProofAttributes, processProofPredicates } from '../utils/helpers'
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
  const { assertConnectedNetwork } = useNetwork()

  const proof = useProofById(proofId)
  const proofConnectionLabel = proof?.connectionId
    ? useConnectionById(proof.connectionId)?.theirLabel
    : proof?.connectionId ?? ''

  const [, dispatch] = useStore()
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [retrievedCredentials, setRetrievedCredentials] = useState<IndyRetrievedCredentialsFormat>()
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [predicates, setPredicates] = useState<Predicate[]>([])
  const [loading, setLoading] = useState<boolean>(true)

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

    const retrieveCredentialsForProof = async (
      proof: ProofExchangeRecord
    ): Promise<
      | {
          format: GetFormatDataReturn<[IndyProofFormat]>
          credentials: FormatRetrievedCredentialOptions<[IndyProofFormat]>
        }
      | undefined
    > => {
      try {
        const format = await agent.proofs.getFormatData(proof.id)
        const credentials = await agent.proofs.getRequestedCredentialsForProofRequest({
          proofRecordId: proof.id,
          config: {
            // Setting `filterByNonRevocationRequirements` to `false` returns all
            // credentials even if they are revokable (and revoked). We need this to
            // be able to show why a proof cannot be satisfied. Otherwise we can only
            // show failure.
            filterByNonRevocationRequirements: false,
          },
        })

        if (!credentials) {
          throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
        }

        if (!format) {
          throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
        }

        return { format, credentials }
      } catch (error: unknown) {
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      }
    }

    retrieveCredentialsForProof(proof)
      .then((retrieved) => retrieved ?? { format: undefined, credentials: undefined })
      .then(({ format, credentials }) => {
        if (!(format && credentials)) {
          return
        }

        const attributes = processProofAttributes(format.request, credentials)
        const predicates = processProofPredicates(format.request, credentials)

        setRetrievedCredentials(credentials.proofFormats.indy)
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
      if (!(agent && proof && assertConnectedNetwork())) {
        return
      }
      setPendingModalVisible(true)

      if (!retrievedCredentials) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      const automaticRequestedCreds =
        retrievedCredentials &&
        (await agent.proofs.autoSelectCredentialsForProofRequest({
          proofRecordId: proof.id,
          config: {
            filterByPresentationPreview: true,
          },
        }))

      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      await agent.proofs.acceptRequest({
        proofRecordId: proof.id,
        proofFormats: automaticRequestedCreds.proofFormats,
      })
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
    <>
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
              {proofConnectionLabel ? <ConnectionAlert connectionID={proofConnectionLabel} /> : null}
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
                        {(field as Attribute)?.value ||
                          `${(field as Predicate)?.pType} ${(field as Predicate)?.pValue}`}
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
      </SafeAreaView>
      <ProofRequestAccept visible={pendingModalVisible} proofId={proofId} />
    </>
  )
}

export default ProofRequest
