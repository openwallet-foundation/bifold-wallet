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
import { DeviceEventEmitter, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import { NotificationStackParams, Screens, Stacks, TabStacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { TourID } from '../types/tour'
import { useAppAgent } from '../utils/agent'
import { getCredentialIdentifiers } from '../utils/credential'
import { Fields, evaluatePredicates, getCredentialInfo, mergeAttributesAndPredicates, processProofAttributes, processProofPredicates, retrieveCredentialsForProof } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

import ProofRequestAccept from './ProofRequestAccept'
import { getAllCredentialsForProof } from '../hooks/proofs'

type ProofRequestProps = StackScreenProps<NotificationStackParams, Screens.ProofRequest>

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId, selectedCredentials } = route?.params
  const { agent } = useAppAgent()
  const { t } = useTranslation()
  const { assertConnectedNetwork } = useNetwork()
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
  const { enableTours: enableToursConfig, OCABundleResolver } = useConfiguration()
  const [containsPI, setContainsPI] = useState(false)
  const [activeCreds, setActiveCreds] = useState<ProofCredentialItems[]>([])
  const [store, dispatch] = useStore()
  const credProofPromise = getAllCredentialsForProof(proofId)
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


  useEffect(() => {

    setLoading(true)
    credProofPromise?.then((value) => {
      if (value) {
        const { groupedProof, retrievedCredentials } = value
        setLoading(false)
        setRetrievedCredentials(retrievedCredentials)
        let credList: string[] = []
        if (selectedCredentials) {
          credList = selectedCredentials
        } else {
          // we only want one of each satisfying credential
          groupedProof.forEach(item => {
            const credId = item.altCredentials[0]
            if (!credList.includes(credId)) {
              credList.push(credId)
            }
          })
        }
        setActiveCreds(groupedProof.filter(item => credList.includes(item.credId)))
        setProofItems(groupedProof)
      }
    }).catch((err: unknown) => {
      const error = new BifoldError(
        t('Error.Title1026'),
        t('Error.Message1026'),
        (err as Error)?.message ?? err,
        1026
      )
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    })

  }, [selectedCredentials])

  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

  const getCredentialsFields = (): Fields => ({
    ...retrievedCredentials?.attributes,
    ...retrievedCredentials?.predicates,
  })

  useEffect(() => {
    // get oca bundle to see if we're presenting personally identifiable elements
    activeCreds.some(async (item) => {
      if (!item || !(item.credDefId || item.schemaId)) {
        return false
      }
      const labels = (item.attributes ?? []).map((field) => field.label ?? field.name ?? '')
      const bundle = await OCABundleResolver.resolveAllBundles({ identifiers: { credentialDefinitionId: item.credDefId, schemaId: item.schemaId } })
      const flaggedAttributes: string[] = (bundle as any).bundle.bundle.flaggedAttributes.map((attr: any) => attr.name)
      const foundPI = labels.some((label) => flaggedAttributes.includes(label))
      setContainsPI(foundPI)
      return foundPI
    })
  }, [activeCreds])





  const hasAvailableCredentials = (credDefId?: string): boolean => {
    const fields = getCredentialsFields()

    if (credDefId) {
      return getCredentialInfo(credDefId, fields).some((credInfo) => credInfo.credentialDefinitionId === credDefId)
    }

    return !!retrievedCredentials && Object.values(fields).every((c) => c?.length > 0)
  }

  const hasSatisfiedPredicates = (fields: Fields, credDefId?: string) =>
    activeCreds.flatMap(evaluatePredicates(fields, credDefId)).every((p) => p.satisfied)

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

      // this is the best way to supply our desired credentials in the proof, otherwise it selects them automatically
      const credObject = {
        ...retrievedCredentials,
        attributes: Object.keys(retrievedCredentials.attributes)
          .map(key => {
            return {
              [key]: retrievedCredentials.attributes[key]
                .find(cred => activeCreds.map(item => item.credId).includes(cred.credentialId))
            }
          }).reduce((prev, current) => { return { ...prev, ...current } }),
        predicates: Object.keys(retrievedCredentials.predicates)
          .map(key => {
            return {
              [key]: retrievedCredentials.predicates[key]
                .find(cred => activeCreds.map(item => item.credId).includes(cred.credentialId))
            }
          }).reduce((prev, current) => { return { ...prev, ...current } }, {}),
        selfAttestedAttributes: {}
      }
      const automaticRequestedCreds = { proofFormats: { [formatToUse]: { ...credObject } } }


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
      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error)?.message ?? err, 1027)
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
      const error = new BifoldError(t('Error.Title1028'), t('Error.Message1028'), (err as Error)?.message ?? err, 1028)
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
              {!hasAvailableCredentials() || !hasSatisfiedPredicates(getCredentialsFields()) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    style={{ marginLeft: -2, marginRight: 10 }}
                    name="highlight-off"
                    color={ListItems.proofIcon.color}
                    size={ListItems.proofIcon.fontSize}
                  />
                  {hasSatisfiedPredicates(getCredentialsFields()) ? (
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
                  <Text style={[TextTheme.title]}>{` ${activeCreds?.length} `}</Text>
                  <Text>{activeCreds?.length > 1 ? t('ProofRequest.Credentials') : t('ProofRequest.Credential')}</Text>
                </Text>
              )}
              {containsPI && (
                <View
                  style={{
                    backgroundColor: ColorPallet.notification.warn,
                    width: '100%',
                    marginTop: 10,
                    borderColor: ColorPallet.notification.warnBorder,
                    borderWidth: 2,
                    borderRadius: 4,
                    flexDirection: 'row',
                  }}
                >
                  <Icon
                    style={{ marginTop: 15, marginLeft: 10 }}
                    name="warning"
                    color={ColorPallet.notification.warnIcon}
                    size={TextTheme.title.fontSize + 5}
                  />
                  <Text
                    style={{
                      ...TextTheme.title,
                      color: ColorPallet.notification.warnText,
                      flex: 1,
                      flexWrap: 'wrap',
                      margin: 10,
                    }}
                  >
                    {t('ProofRequest.SensitiveInformation')}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    )
  }

  const handleAltCredChange = (altCredentials: string[]) => {
    navigation.getParent()?.navigate(Stacks.ProofRequestsStack, { screen: Screens.ProofChangeCredential, params: { altCredentials, proofId, selectedCredentials: selectedCredentials ?? activeCreds.map(item => item.credId) } })
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
            disabled={!hasAvailableCredentials() || !hasSatisfiedPredicates(getCredentialsFields())}
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
  // FIXME: (WK) we need to have all creds in the cred list otherwise react will complain that the order of hooks changes. Solution it to add all creds to flatlist but only display selection
  return (
    <SafeAreaView style={styles.pageContainer} edges={['bottom', 'left', 'right']}>
      <View style={styles.pageContent}>
        <FlatList
          data={proofItems ?? []}
          ListHeaderComponent={proofPageHeader}
          ListFooterComponent={proofPageFooter}
          renderItem={({ item }) => {
            return (
              <View>
                {loading || !activeCreds.map(cred => cred.credId).includes(item.credId) ? null : (
                  <View style={{ marginTop: 10, marginHorizontal: 20, }}>
                    <CredentialCard
                      credential={item.credExchangeRecord}
                      credDefId={item.credDefId}
                      schemaId={item.schemaId}
                      displayItems={[...(item.attributes ?? []), ...evaluatePredicates(getCredentialsFields(), item.credDefId)(item)]}
                      credName={item.credName}
                      existsInWallet={hasAvailableCredentials(item.credDefId)}
                      satisfiedPredicates={hasSatisfiedPredicates(getCredentialsFields(), item.credDefId)}
                      hasAltCredentials={item.altCredentials && item.altCredentials.length > 1}
                      handleAltCredChange={(item.altCredentials && item.altCredentials.length > 1) ? () => { handleAltCredChange(item.altCredentials, item.credId) } : undefined}
                      proof={true}
                    ></CredentialCard>
                  </View>
                )}
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
