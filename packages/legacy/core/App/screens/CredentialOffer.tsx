import { AnonCredsCredentialMetadataKey } from '@credo-ts/anoncreds'
import { CredentialPreviewAttribute } from '@credo-ts/core'
import { useCredentialById } from '@credo-ts/react-hooks'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { Attribute, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { useIsFocused } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import ConnectionAlert from '../components/misc/ConnectionAlert'
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
import { NotificationStackParams, Screens, TabStacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { TourID } from '../types/tour'
import { useAppAgent } from '../utils/agent'
import { parseCredDefFromId } from '../utils/cred-def'
import { getCredentialIdentifiers, isValidAnonCredsCredential } from '../utils/credential'
import { useCredentialConnectionLabel } from '../utils/helpers'
import { buildFieldsFromAnonCredsCredential } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'

import CredentialOfferAccept from './CredentialOfferAccept'

type CredentialOfferProps = StackScreenProps<NotificationStackParams, Screens.CredentialOffer>

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialOffer route params were not set properly')
  }

  const { credentialId } = route.params
  const { agent } = useAppAgent()
  const { t, i18n } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const { RecordLoading } = useAnimatedComponents()
  const { assertConnectedNetwork } = useNetwork()
  const [bundleResolver, { enableTours: enableToursConfig }, logger, historyManagerCurried] = useServices([
    TOKENS.UTIL_OCA_RESOLVER,
    TOKENS.CONFIG,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
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

  useEffect(() => {
    const shouldShowTour = enableToursConfig && store.tours.enableTours && !store.tours.seenCredentialOfferTour
    if (shouldShowTour && screenIsFocused) {
      start(TourID.CredentialOfferTour)
      dispatch({
        type: DispatchAction.UPDATE_SEEN_CREDENTIAL_OFFER_TOUR,
        payload: [true],
      })
    }
  }, [enableToursConfig, store.tours.enableTours, store.tours.seenCredentialOfferTour, screenIsFocused, start, dispatch])

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
      const fields = await bundleResolver.presentationFields({ identifiers, attributes, language: i18n.language })

      return { fields }
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
      .then(({ fields }) => {
        setOverlay(o => ({ ...o, presentationFields: (fields as Attribute[]).filter((field) => field.value) }))
        setLoading(false)
      })
  }, [credential, agent, bundleResolver, i18n.language])

  const toggleDeclineModalVisible = useCallback(() => setDeclineModalVisible(prev => !prev), [])

  const logHistoryRecord = useCallback(async () => {
    try {
      if (!(agent && store.preferences.useHistoryCapability)) {
        logger.trace(
          `[${CredentialOffer.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
        )
        return
      }
      const historyManager = historyManagerCurried(agent)

      const type = HistoryCardType.CardAccepted
      if (!credential) {
        logger.error(`[${CredentialOffer.name}]:[logHistoryRecord] Cannot save history, credential undefined!`)
        return
      }
      const ids = getCredentialIdentifiers(credential)
      const name = parseCredDefFromId(ids.credentialDefinitionId, ids.schemaId)

      /** Save history record for card accepted */
      const recordData: HistoryRecord = {
        type: type,
        message: type,
        createdAt: credential?.createdAt,
        correspondenceId: credentialId,
        correspondenceName: name,
      }
      await historyManager.saveHistory(recordData)
    } catch (err: unknown) {
      logger.error(`[${CredentialOffer.name}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [agent, store.preferences.useHistoryCapability, logger, historyManagerCurried, credential, credentialId])

  const handleAcceptTouched = useCallback(async () => {
    try {
      if (!(agent && credential && assertConnectedNetwork())) {
        return
      }

      setAcceptModalVisible(true)

      await agent.credentials.acceptOffer({ credentialRecordId: credential.id })
      await logHistoryRecord()
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error)?.message ?? err, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, credential, assertConnectedNetwork, logHistoryRecord, t])

  const handleDeclineTouched = useCallback(async () => {
    try {
      if (agent && credential) {
        await agent.credentials.declineOffer(credential.id)
        await agent.credentials.sendProblemReport({
          credentialRecordId: credential.id,
          description: t('CredentialOffer.Declined'),
        })
      }

      toggleDeclineModalVisible()
      navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), (err as Error)?.message ?? err, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, credential, t, toggleDeclineModalVisible, navigation])

  const header = () => {
    return (
      <>
        <ConnectionImage connectionId={credential?.connectionId} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <Text>{credentialConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
            {t('CredentialOffer.IsOfferingYouACredential')}
          </Text>
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
        {credentialConnectionLabel && goalCode === 'aries.vc.issue' ? (
          <ConnectionAlert connectionID={credentialConnectionLabel} />
        ) : null}
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
