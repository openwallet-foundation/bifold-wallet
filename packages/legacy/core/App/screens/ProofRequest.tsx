import type { StackScreenProps } from '@react-navigation/stack'

import {
  AnonCredsCredentialInfo,
  AnonCredsCredentialsForProofRequest,
  AnonCredsPredicateType,
  AnonCredsRequestedAttributeMatch,
  AnonCredsRequestedPredicateMatch,
} from '@aries-framework/anoncreds'
import { ProofExchangeRecord } from '@aries-framework/core'
import { useConnectionById, useCredentials, useProofById } from '@aries-framework/react-hooks'
import { Predicate, ProofCredentialItems } from '@hyperledger/aries-oca/build/legacy'
import { useIsFocused } from '@react-navigation/core'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button, { ButtonType } from '../components/buttons/Button'
import { CredentialCard } from '../components/misc'
import ConnectionAlert from '../components/misc/ConnectionAlert'
import ConnectionImage from '../components/misc/ConnectionImage'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import { EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useNetwork } from '../contexts/network'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { useOutOfBandByConnectionId } from '../hooks/connections'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens, TabStacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { TourID } from '../types/tour'
import { useAppAgent } from '../utils/agent'
import { mergeAttributesAndPredicates, processProofAttributes, processProofPredicates } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccept from './ProofRequestAccept'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>
type Fields = Record<string, AnonCredsRequestedAttributeMatch[] | AnonCredsRequestedPredicateMatch[]>

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId } = route?.params
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const { assertConnectedNetwork } = useNetwork()
  const fullCredentials = useCredentials().records
  const proof = useProofById(proofId)
  const connection = proof?.connectionId ? useConnectionById(proof.connectionId) : undefined
  const proofConnectionLabel = connection?.theirLabel ?? proof?.connectionId ?? ''
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [retrievedCredentials, setRetrievedCredentials] = useState<AnonCredsCredentialsForProofRequest>()
  const [proofItems, setProofItems] = useState<ProofCredentialItems[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const { ColorPallet, ListItems, TextTheme } = useTheme()
  const { RecordLoading } = useAnimatedComponents()
  const goalCode = useOutOfBandByConnectionId(proof?.connectionId ?? '')?.outOfBandInvitation.goalCode
  const { enableTours: enableToursConfig } = useConfiguration()
  const [store, dispatch] = useStore()
  const { start } = useTour()
  const screenIsFocused = useIsFocused()

  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    pageContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    pageMargin: {
      marginHorizontal: 20,
    },
    pageFooter: {
      marginBottom: 15,
    },
    headerTextContainer: {
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
    cardLoading: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      flex: 1,
      flexGrow: 1,
      marginVertical: 35,
      borderRadius: 15,
      paddingHorizontal: 10,
    },
  })

  useEffect(() => {
    const shouldShowTour =
      store.preferences.developerModeEnabled &&
      enableToursConfig &&
      store.tours.enableTours &&
      !store.tours.seenProofRequestTour

    if (shouldShowTour && screenIsFocused) {
      start(TourID.ProofRequestTour)
      dispatch({
        type: DispatchAction.UPDATE_SEEN_PROOF_REQUEST_TOUR,
        payload: [true],
      })
    }
  }, [screenIsFocused])

  useEffect(() => {
    if (!agent) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1034'), t('Error.Message1034'), t('ProofRequest.ProofRequestNotFound'), 1034)
      )
    }
  }, [])

  useEffect(() => {
    if (!proof) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1034'), t('Error.Message1034'), t('ProofRequest.ProofRequestNotFound'), 1034)
      )
    }
  }, [])

  useMemo(() => {
    if (!(agent && proof)) {
      return
    }

    setLoading(true)

    const retrieveCredentialsForProof = async (proof: ProofExchangeRecord) => {
      try {
        const format = await agent.proofs.getFormatData(proof.id)
        const hasAnonCreds = format.request?.anoncreds !== undefined
        const hasIndy = format.request?.indy !== undefined
        const credentials = await agent.proofs.getCredentialsForRequest({
          proofRecordId: proof.id,
          proofFormats: {
            // FIXME: AFJ will try to use the format, even if the value is undefined (but the key is present)
            // We should ignore the key, if the value is undefined. For now this is a workaround.
            ...(hasIndy
              ? {
                  indy: {
                    // Setting `filterByNonRevocationRequirements` to `false` returns all
                    // credentials even if they are revokable (and revoked). We need this to
                    // be able to show why a proof cannot be satisfied. Otherwise we can only
                    // show failure.
                    filterByNonRevocationRequirements: false,
                  },
                }
              : {}),

            ...(hasAnonCreds
              ? {
                  anoncreds: {
                    // Setting `filterByNonRevocationRequirements` to `false` returns all
                    // credentials even if they are revokable (and revoked). We need this to
                    // be able to show why a proof cannot be satisfied. Otherwise we can only
                    // show failure.
                    filterByNonRevocationRequirements: false,
                  },
                }
              : {}),
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
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      }
    }

    retrieveCredentialsForProof(proof)
      .then((retrieved) => retrieved ?? { format: undefined, credentials: undefined })
      .then(({ format, credentials }) => {
        if (!(format && credentials && fullCredentials)) {
          return
        }

        const proofFormat = credentials.proofFormats.anoncreds ?? credentials.proofFormats.indy
        const reqCredIds = [
          ...Object.keys(proofFormat?.attributes ?? {}).map((key) => proofFormat?.attributes[key][0]?.credentialId),
          ...Object.keys(proofFormat?.predicates ?? {}).map((key) => proofFormat?.predicates[key][0]?.credentialId),
        ]
        const credentialRecords = fullCredentials.filter((record) =>
          reqCredIds.includes(record.credentials[0]?.credentialRecordId)
        )
        const attributes = processProofAttributes(format.request, credentials, credentialRecords)
        const predicates = processProofPredicates(format.request, credentials, credentialRecords)
        setRetrievedCredentials(proofFormat)

        const groupedProof = Object.values(mergeAttributesAndPredicates(attributes, predicates))
        setProofItems(groupedProof)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const error = new BifoldError(t('Error.Title1026'), t('Error.Message1026'), (err as Error).message, 1026)
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      })
  }, [])

  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

  const getCredentialsFields = (): Fields => ({
    ...retrievedCredentials?.attributes,
    ...retrievedCredentials?.predicates,
  })

  /**
   * Retrieve current credentials info filtered by `credentialDefinitionId` if given.
   * @param credDefId Credential Definition Id
   * @returns Array of `AnonCredsCredentialInfo`
   */
  const getCredentialInfo = (credDefId?: string): AnonCredsCredentialInfo[] => {
    const credentialInfo: AnonCredsCredentialInfo[] = []
    const fields = getCredentialsFields()

    Object.keys(fields).forEach((proofKey) => {
      credentialInfo.push(...fields[proofKey].map((attr) => attr.credentialInfo))
    })

    return credDefId == undefined
      ? credentialInfo
      : credentialInfo.filter((cred) => cred.credentialDefinitionId === credDefId)
  }

  /**
   * Evaluate if given attribute value satisfies the predicate.
   * @param attribute Credential attribute value
   * @param pValue Predicate value
   * @param pType Predicate type ({@link AnonCredsPredicateType})
   * @returns `true`if predicate is satisfied, otherwise `false`
   */
  const evaluateOperation = (attribute: number, pValue: number, pType: AnonCredsPredicateType): boolean => {
    if (pType === '>=') {
      return attribute >= pValue
    }

    if (pType === '>') {
      return attribute > pValue
    }

    if (pType === '<=') {
      return attribute <= pValue
    }
    if (pType === '<') {
      return attribute < pValue
    }

    return false
  }

  /**
   * Given proof credential items, evaluate and return its predicates, setting `satisfied` property.
   * @param proofCredentialsItems
   * @returns Array of evaluated predicates
   */
  const evaluatePredicates = (proofCredentialItems: ProofCredentialItems): Predicate[] => {
    const predicates = proofCredentialItems.predicates

    if (!predicates || predicates.length == 0) {
      return []
    }

    const credentialAttributes = getCredentialInfo(proofCredentialItems.credDefId).map((ci) => ci.attributes)

    return predicates.map((predicate) => {
      const { pType: pType, pValue: pValue, name: field } = predicate
      let satisfied = false

      if (field) {
        const attribute = (credentialAttributes.find((attr) => attr[field] != undefined) ?? {})[field]

        if (attribute && pValue) {
          satisfied = evaluateOperation(Number(attribute), Number(pValue), pType as AnonCredsPredicateType)
        }
      }

      return { ...predicate, satisfied }
    })
  }

  const hasAvailableCredentials = (credDefId?: string): boolean => {
    const fields = getCredentialsFields()

    if (credDefId) {
      return getCredentialInfo(credDefId).some((credInfo) => credInfo.credentialDefinitionId === credDefId)
    }

    return !!retrievedCredentials && Object.values(fields).every((c) => c.length > 0)
  }

  const hasSatisfiedPredicates = () => proofItems.flatMap(evaluatePredicates).every((p) => p.satisfied)

  const handleAcceptPress = async () => {
    try {
      if (!(agent && proof && assertConnectedNetwork())) {
        return
      }
      setPendingModalVisible(true)

      if (!retrievedCredentials) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      const format = await agent.proofs.getFormatData(proof.id)

      const formatToUse = format.request?.anoncreds ? 'anoncreds' : 'indy'

      const automaticRequestedCreds =
        retrievedCredentials &&
        (await agent.proofs.selectCredentialsForRequest({
          proofRecordId: proof.id,
          proofFormats: {
            [formatToUse]: {},
          },
        }))

      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }

      await agent.proofs.acceptRequest({
        proofRecordId: proof.id,
        proofFormats: automaticRequestedCreds.proofFormats,
      })
      if (proof.connectionId && goalCode && goalCode.endsWith('verify.once')) {
        agent.connections.deleteById(proof.connectionId)
      }
    } catch (err: unknown) {
      setPendingModalVisible(false)

      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error).message, 1027)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleDeclineTouched = async () => {
    try {
      if (agent && proof) {
        await agent.proofs.declineRequest({ proofRecordId: proof.id })
        // sending a problem report fails if there is neither a connectionId nor a ~service decorator
        if (proof.connectionId) {
          await agent.proofs.sendProblemReport({ proofRecordId: proof.id, description: t('ProofRequest.Declined') })
          if (goalCode && goalCode.endsWith('verify.once')) {
            agent.connections.deleteById(proof.connectionId)
          }
        }
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1028'), t('Error.Message1028'), (err as Error).message, 1028)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }

    toggleDeclineModalVisible()

    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const proofPageHeader = () => {
    return (
      <View style={styles.pageMargin}>
        {loading ? (
          <View style={styles.cardLoading}>
            <RecordLoading />
          </View>
        ) : (
          <>
            <ConnectionImage connectionId={proof?.connectionId} />
            <View style={styles.headerTextContainer}>
              {!hasAvailableCredentials() || !hasSatisfiedPredicates() ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    style={{ marginLeft: -2, marginRight: 10 }}
                    name="highlight-off"
                    color={ListItems.proofIcon.color}
                    size={ListItems.proofIcon.fontSize}
                  />
                  {hasSatisfiedPredicates() ? (
                    <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                      <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                      {t('ProofRequest.IsRequestingSomethingYouDontHaveAvailable')}
                    </Text>
                  ) : (
                    <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                      {t('ProofRequest.YouDoNotHaveDataPredicate')}{' '}
                      <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                  <Text style={[TextTheme.title]}>{proofConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                  <Text>{t('ProofRequest.IsRequestingYouToShare')}</Text>
                  <Text style={[TextTheme.title]}>{` ${proofItems.length} `}</Text>
                  <Text>{proofItems.length > 1 ? t('ProofRequest.Credentials') : t('ProofRequest.Credential')}</Text>
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    )
  }

  const proofPageFooter = () => {
    return (
      <View style={[styles.pageFooter, styles.pageMargin]}>
        {!loading && proofConnectionLabel && goalCode !== 'aries.vc.verify.once' ? (
          <ConnectionAlert connectionID={proofConnectionLabel} />
        ) : null}
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Share')}
            accessibilityLabel={t('Global.Share')}
            testID={testIdWithKey('Share')}
            buttonType={ButtonType.Primary}
            onPress={handleAcceptPress}
            disabled={!hasAvailableCredentials() || !hasSatisfiedPredicates()}
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Decline')}
            accessibilityLabel={t('Global.Decline')}
            testID={testIdWithKey('Decline')}
            buttonType={!retrievedCredentials ? ButtonType.Primary : ButtonType.Secondary}
            onPress={toggleDeclineModalVisible}
          />
        </View>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.pageContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.pageContent}>
        <FlatList
          data={proofItems}
          ListHeaderComponent={proofPageHeader}
          ListFooterComponent={proofPageFooter}
          renderItem={({ item }) => {
            return (
              <View style={{ marginTop: 10, marginHorizontal: 20 }}>
                <CredentialCard
                  credential={item.credExchangeRecord}
                  credDefId={item.credDefId}
                  schemaId={item.schemaId}
                  displayItems={[...(item.attributes ?? []), ...evaluatePredicates(item)]}
                  credName={item.credName}
                  existsInWallet={hasAvailableCredentials(item.credDefId) && hasSatisfiedPredicates()}
                  proof
                ></CredentialCard>
              </View>
            )
          }}
        />
      </View>
      <ProofRequestAccept visible={pendingModalVisible} proofId={proofId} />
      <CommonRemoveModal
        usage={ModalUsage.ProofRequestDecline}
        visible={declineModalVisible}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default ProofRequest
