import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { CredentialPreviewAttribute } from '@credo-ts/core'
import { useCredentialById } from '@credo-ts/react-hooks'
import { BrandingOverlay, MetaOverlay } from '@bifold/oca'
import { Attribute, CredentialOverlay } from '@bifold/oca/build/legacy'
import { useIsFocused } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import ConnectionImage from '../components/misc/ConnectionImage'
import CredentialCard from '../components/misc/CredentialCard'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import Record from '../components/record/Record'
import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useNetwork } from '../contexts/network'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useTour } from '../contexts/tour/tour-context'
import { useOutOfBandByConnectionId } from '../hooks/connections'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { BifoldError } from '../types/error'
import { Screens, TabStacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { useAppAgent } from '../utils/agent'
import { parseCredDefFromId } from '../utils/cred-def'
import { getCredentialIdentifiers, isValidAnonCredsCredential } from '../utils/credential'
import { useCredentialConnectionLabel } from '../utils/helpers'
import { buildFieldsFromAnonCredsCredential } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'

import CredentialOfferAccept from './CredentialOfferAccept'
import { BaseTourID } from '../types/tour'
import { ThemedText } from '../components/texts/ThemedText'

type CredentialOfferProps = {
  navigation: any
  credentialId: string
}

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, credentialId }) => {
  const { agent } = useAppAgent()
  const { t, i18n } = useTranslation()
  const { ColorPallet } = useTheme()
  const { RecordLoading } = useAnimatedComponents()
  const { assertNetworkConnected } = useNetwork()
  const [
    bundleResolver,
    { enableTours: enableToursConfig },
    logger,
    historyManagerCurried,
    historyEnabled,
    historyEventsLogger,
  ] = useServices([
    TOKENS.UTIL_OCA_RESOLVER,
    TOKENS.CONFIG,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
  ])
  const [loading, setLoading] = useState<boolean>(true)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({ presentationFields: [] })
  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = useCredentialConnectionLabel(credential)
  const [store, dispatch] = useStore()
  const { start } = useTour()
  const screenIsFocused = useIsFocused()
  const goalCode = useOutOfBandByConnectionId(credential?.connectionId ?? '')?.outOfBandInvitation?.goalCode
  const [ConnectionAlert] = useServices([TOKENS.COMPONENT_CONNECTION_ALERT])

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
  })

  useEffect(() => {
    const shouldShowTour = enableToursConfig && store.tours.enableTours && !store.tours.seenCredentialOfferTour
    if (shouldShowTour && screenIsFocused) {
      start(BaseTourID.CredentialOfferTour)
      dispatch({
        type: DispatchAction.UPDATE_SEEN_CREDENTIAL_OFFER_TOUR,
        payload: [true],
      })
    }
  }, [
    enableToursConfig,
    store.tours.enableTours,
    store.tours.seenCredentialOfferTour,
    screenIsFocused,
    start,
    dispatch,
  ])

  useEffect(() => {
    if (!agent || !credential) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1035'), t('Error.Message1035'), t('CredentialOffer.CredentialNotFound'), 1035)
      )
    }
  }, [agent, credential, t])

  useEffect(() => {
    if (!(credential && isValidAnonCredsCredential(credential) && agent)) {
      return
    }

    const updateCredentialPreview = async () => {
      const { ...formatData } = await agent.credentials.getFormatData(credential.id)
      const { offer, offerAttributes } = formatData
      const offerData = offer?.anoncreds ?? offer?.indy

      if (offerData) {
        credential.metadata.add(AnonCredsCredentialMetadataKey, {
          schemaId: offerData.schema_id,
          credentialDefinitionId: offerData.cred_def_id,
        })
      }

      if (offerAttributes) {
        credential.credentialAttributes = [...offerAttributes.map((item) => new CredentialPreviewAttribute(item))]
      }
    }

    const resolvePresentationFields = async () => {
      const identifiers = getCredentialIdentifiers(credential)
      const attributes = buildFieldsFromAnonCredsCredential(credential)
      const bundle = await bundleResolver.resolveAllBundles({ identifiers, attributes, language: i18n.language })
      const fields = bundle?.presentationFields ?? []
      const metaOverlay = bundle?.metaOverlay ?? {}

      return { fields, metaOverlay }
    }

    /**
     * FIXME: Formatted data needs to be added to the record in Credo extensions
     * For now the order here matters. The credential preview must be updated to
     * add attributes (since these are not available in the offer).
     * Once the credential is updated the presentation fields can be correctly resolved
     */
    setLoading(true)
    updateCredentialPreview()
      .then(() => resolvePresentationFields())
      .then(({ fields, metaOverlay }) => {
        setOverlay({
          metaOverlay: metaOverlay as MetaOverlay,
          presentationFields: (fields as Attribute[]).filter((field) => field.value),
        })
        setLoading(false)
      })
  }, [credential, agent, bundleResolver, i18n.language])

  const toggleDeclineModalVisible = useCallback(() => setDeclineModalVisible((prev) => !prev), [])

  const logHistoryRecord = useCallback(
    (type: HistoryCardType) => {
      try {
        if (!(agent && historyEnabled)) {
          logger.trace(
            `[${CredentialOffer.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
          )
          return
        }
        const historyManager = historyManagerCurried(agent)

        if (!credential) {
          logger.error(`[${CredentialOffer.name}]:[logHistoryRecord] Cannot save history, credential undefined!`)
          return
        }
        const ids = getCredentialIdentifiers(credential)
        const name = overlay.metaOverlay?.name ?? parseCredDefFromId(ids.credentialDefinitionId, ids.schemaId)

        /** Save history record for card accepted */
        const recordData: HistoryRecord = {
          type: type,
          message: name,
          createdAt: credential?.createdAt,
          correspondenceId: credentialId,
          correspondenceName: credentialConnectionLabel,
        }
        historyManager.saveHistory(recordData)
      } catch (err: unknown) {
        logger.error(`[${CredentialOffer.name}]:[logHistoryRecord] Error saving history: ${err}`)
      }
    },
    [agent, historyEnabled, logger, historyManagerCurried, credential, credentialId, credentialConnectionLabel, overlay]
  )

  const handleAcceptTouched = useCallback(async () => {
    try {
      if (!(agent && credential && assertNetworkConnected())) {
        return
      }

      setAcceptModalVisible(true)

      await agent.credentials.acceptOffer({ credentialRecordId: credential.id })
      if (historyEventsLogger.logAttestationAccepted) {
        const type = HistoryCardType.CardAccepted
        logHistoryRecord(type)
      }
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error)?.message ?? err, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, credential, assertNetworkConnected, logHistoryRecord, t, historyEventsLogger.logAttestationAccepted])

  const handleDeclineTouched = useCallback(async () => {
    try {
      if (agent && credential) {
        const connectionId = credential.connectionId ?? ''
        const connection = await agent.connections.findById(connectionId)

        await agent.credentials.declineOffer(credential.id)

        if (connection) {
          await agent.credentials.sendProblemReport({
            credentialRecordId: credential.id,
            description: t('CredentialOffer.Declined'),
          })
        }
      }

      toggleDeclineModalVisible()
      if (historyEventsLogger.logAttestationRefused) {
        const type = HistoryCardType.CardDeclined
        logHistoryRecord(type)
      }

      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), (err as Error)?.message ?? err, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [
    agent,
    credential,
    t,
    toggleDeclineModalVisible,
    navigation,
    logHistoryRecord,
    historyEventsLogger.logAttestationRefused,
  ])

  const header = () => {
    return (
      <>
        <ConnectionImage connectionId={credential?.connectionId} />
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <ThemedText>{credentialConnectionLabel || t('ContactDetails.AContact')}</ThemedText>{' '}
            {t('CredentialOffer.IsOfferingYouACredential')}
          </ThemedText>
        </View>
        {!loading && credential && (
          <View style={{ marginHorizontal: 15, marginBottom: 16 }}>
            <CredentialCard credential={credential} />
          </View>
        )}
      </>
    )
  }

  const footer = () => {
    return (
      <View
        style={{
          paddingHorizontal: 25,
          paddingVertical: 16,
          paddingBottom: 26,
          backgroundColor: ColorPallet.brand.secondaryBackground,
        }}
      >
        {loading ? <RecordLoading /> : null}
        {Boolean(credentialConnectionLabel) && goalCode === 'aries.vc.issue' && (
          <ConnectionAlert connectionLabel={credentialConnectionLabel} />
        )}
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Accept')}
            accessibilityLabel={t('Global.Accept')}
            testID={testIdWithKey('AcceptCredentialOffer')}
            buttonType={ButtonType.Primary}
            onPress={handleAcceptTouched}
            disabled={!buttonsVisible}
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            title={t('Global.Decline')}
            accessibilityLabel={t('Global.Decline')}
            testID={testIdWithKey('DeclineCredentialOffer')}
            buttonType={ButtonType.Secondary}
            onPress={toggleDeclineModalVisible}
            disabled={!buttonsVisible}
          />
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <Record fields={overlay.presentationFields || []} header={header} footer={footer} />
      <CredentialOfferAccept visible={acceptModalVisible} credentialId={credentialId} />
      <CommonRemoveModal
        usage={ModalUsage.CredentialOfferDecline}
        visible={declineModalVisible}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default CredentialOffer
