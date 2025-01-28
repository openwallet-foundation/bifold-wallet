import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { Attribute, BrandingOverlayType, CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import Record from '../components/record/Record'
import RecordRemove from '../components/record/RecordRemove'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { TOKENS, useServices } from '../container-api'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { CredentialMetadata, credentialCustomMetadata } from '../types/metadata'
import { RootStackParams, Screens } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { getCredentialIdentifiers, isValidAnonCredsCredential } from '../utils/credential'
import { formatTime, useCredentialConnectionLabel } from '../utils/helpers'
import { buildFieldsFromAnonCredsCredential } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { parseCredDefFromId } from '../utils/cred-def'
import CredentialCardLogo from '../components/views/CredentialCardLogo'
import CredentialDetailPrimaryHeader from '../components/views/CredentialDetailPrimaryHeader'
import CredentialDetailSecondaryHeader from '../components/views/CredentialDetailSecondaryHeader'

type CredentialDetailsProps = StackScreenProps<RootStackParams, Screens.CredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route params were not set properly')
  }

  const { credentialId } = route.params
  const [credential, setCredential] = useState<CredentialExchangeRecord | undefined>(undefined)
  const { agent } = useAgent()
  const { t, i18n } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const [bundleResolver, logger, historyManagerCurried, historyEnabled, historyEventsLogger] = useServices([
    TOKENS.UTIL_OCA_RESOLVER,
    TOKENS.UTIL_LOGGER,
    TOKENS.FN_LOAD_HISTORY,
    TOKENS.HISTORY_ENABLED,
    TOKENS.HISTORY_EVENTS_LOGGER,
  ])
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [revocationDate, setRevocationDate] = useState<string>('')
  const [preciseRevocationDate, setPreciseRevocationDate] = useState<string>('')
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [isRevokedMessageHidden, setIsRevokedMessageHidden] = useState<boolean>(
    (credential?.metadata.get(CredentialMetadata.customMetadata) as credentialCustomMetadata)
      ?.revoked_detail_dismissed ?? false
  )

  useEffect(() => {
    // fetch credential for ID
    const fetchCredential = async () => {
      try {
        const credentialExchangeRecord = await agent?.credentials.getById(credentialId)
        setCredential(credentialExchangeRecord)
      } catch (error) {
        // credential not found for id, display an error
        DeviceEventEmitter.emit(
          EventTypes.ERROR_ADDED,
          new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
        )
      }
    }
    fetchCredential()
  }, [credentialId, agent, t])

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    brandingOverlay: undefined,
  })
  const credentialConnectionLabel = useCredentialConnectionLabel(credential)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
  })

  useEffect(() => {
    if (!agent) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
      )
    }
  }, [agent, t])

  useEffect(() => {
    if (!(credential && isValidAnonCredsCredential(credential))) {
      return
    }

    credential.revocationNotification == undefined ? setIsRevoked(false) : setIsRevoked(true)
    if (credential?.revocationNotification?.revocationDate) {
      const date = new Date(credential.revocationNotification.revocationDate)
      setRevocationDate(formatTime(date, { shortMonth: true }))
      setPreciseRevocationDate(formatTime(date, { includeHour: true }))
    }

    const params = {
      identifiers: getCredentialIdentifiers(credential),
      meta: {
        alias: credentialConnectionLabel,
        credConnectionId: credential.connectionId,
      },
      attributes: buildFieldsFromAnonCredsCredential(credential),
      language: i18n.language,
    }

    bundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay((o) => ({
        ...o,
        ...(bundle as CredentialOverlay<BrandingOverlay>),
        presentationFields: bundle.presentationFields?.filter((field) => (field as Attribute).value),
      }))
    })
  }, [credential, credentialConnectionLabel, bundleResolver, i18n.language])

  useEffect(() => {
    if (credential?.revocationNotification) {
      const meta = credential.metadata.get(CredentialMetadata.customMetadata)
      credential.metadata.set(CredentialMetadata.customMetadata, { ...meta, revoked_seen: true })
      agent?.credentials.update(credential)
    }
  }, [credential, agent])

  const callOnRemove = useCallback(() => {
    setIsRemoveModalDisplayed(true)
  }, [])

  const logHistoryRecord = useCallback(() => {
    try {
      if (!(agent && historyEnabled)) {
        logger.trace(
          `[${CredentialDetails.name}]:[logHistoryRecord] Skipping history log, either history function disabled or agent undefined!`
        )
        return
      }

      if (!credential) {
        logger.error(`[${CredentialDetails.name}]:[logHistoryRecord] Cannot save history, credential undefined!`)
        return
      }
      const historyManager = historyManagerCurried(agent)

      const ids = getCredentialIdentifiers(credential)
      const name = parseCredDefFromId(ids.credentialDefinitionId, ids.schemaId)

      /** Save history record for credential removed */
      const recordData: HistoryRecord = {
        type: HistoryCardType.CardRemoved,
        message: name,
        createdAt: new Date(),
        correspondenceId: credentialId,
        correspondenceName: credentialConnectionLabel,
      }

      historyManager.saveHistory(recordData)
    } catch (err: unknown) {
      logger.error(`[${CredentialDetails.name}]:[logHistoryRecord] Error saving history: ${err}`)
    }
  }, [agent, historyEnabled, logger, historyManagerCurried, credential, credentialConnectionLabel, credentialId])

  const callSubmitRemove = useCallback(async () => {
    try {
      if (!(agent && credential)) {
        return
      }

      if (historyEventsLogger.logAttestationRemoved) {
        logHistoryRecord()
      }

      await agent.credentials.deleteById(credential.id)

      navigation.pop()

      // FIXME: This delay is a hack so that the toast doesn't appear until the modal is dismissed
      await new Promise((resolve) => setTimeout(resolve, 1000))

      Toast.show({
        type: ToastType.Success,
        text1: t('CredentialDetails.CredentialRemoved'),
      })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error)?.message ?? err, 1032)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, credential, navigation, t, historyEventsLogger.logAttestationRemoved, logHistoryRecord])

  const callCancelRemove = useCallback(() => {
    setIsRemoveModalDisplayed(false)
  }, [])

  const callDismissRevokedMessage = useCallback(() => {
    setIsRevokedMessageHidden(true)
    if (credential) {
      const meta = credential.metadata.get(CredentialMetadata.customMetadata)
      credential.metadata.set(CredentialMetadata.customMetadata, { ...meta, revoked_detail_dismissed: true })
      agent?.credentials.update(credential)
    }
  }, [credential, agent])

  const CredentialRevocationMessage: React.FC<{ credential: CredentialExchangeRecord }> = ({ credential }) => {
    return (
      <InfoBox
        notificationType={InfoBoxType.Error}
        title={t('CredentialDetails.CredentialRevokedMessageTitle') + ' ' + revocationDate}
        description={
          credential?.revocationNotification?.comment
            ? credential.revocationNotification.comment
            : t('CredentialDetails.CredentialRevokedMessageBody')
        }
        onCallToActionLabel={t('Global.Dismiss')}
        onCallToActionPressed={callDismissRevokedMessage}
      />
    )
  }

  const header = () => {
    return bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding01 ? (
      <View>
        {isRevoked && !isRevokedMessageHidden ? (
          <View style={{ padding: paddingVertical, paddingBottom: 0 }}>
            {credential && <CredentialRevocationMessage credential={credential} />}
          </View>
        ) : null}
        {credential && <CredentialCard credential={credential} style={{ margin: 16 }} />}
      </View>
    ) : (
      <View style={styles.container}>
        <CredentialDetailSecondaryHeader overlay={overlay} />
        <CredentialCardLogo overlay={overlay} />
        <CredentialDetailPrimaryHeader overlay={overlay} />

        {isRevoked && !isRevokedMessageHidden ? (
          <View style={{ padding: paddingVertical, paddingTop: 0 }}>
            {credential && <CredentialRevocationMessage credential={credential} />}
          </View>
        ) : null}
      </View>
    )
  }

  const footer = () => {
    return (
      <View style={{ marginBottom: 50 }}>
        {credentialConnectionLabel ? (
          <View
            style={{
              backgroundColor: ColorPallet.brand.secondaryBackground,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <Text testID={testIdWithKey('IssuerName')}>
              <Text style={[TextTheme.title, isRevoked && { color: ColorPallet.grayscale.mediumGrey }]}>
                {t('CredentialDetails.IssuedBy') + ' '}
              </Text>
              <Text style={[TextTheme.normal, isRevoked && { color: ColorPallet.grayscale.mediumGrey }]}>
                {credentialConnectionLabel}
              </Text>
            </Text>
          </View>
        ) : null}
        {isRevoked ? (
          <View
            style={{
              backgroundColor: ColorPallet.notification.error,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <Text testID={testIdWithKey('RevokedDate')}>
              <Text style={[TextTheme.title, { color: ColorPallet.notification.errorText }]}>
                {t('CredentialDetails.Revoked') + ': '}
              </Text>
              <Text style={[TextTheme.normal, { color: ColorPallet.notification.errorText }]}>
                {preciseRevocationDate}
              </Text>
            </Text>
            <Text
              style={[TextTheme.normal, { color: ColorPallet.notification.errorText, marginTop: paddingVertical }]}
              testID={testIdWithKey('RevocationMessage')}
            >
              {credential?.revocationNotification?.comment
                ? credential.revocationNotification.comment
                : t('CredentialDetails.CredentialRevokedMessageBody')}
            </Text>
          </View>
        ) : null}
        <RecordRemove onRemove={callOnRemove} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      <Record fields={overlay.presentationFields || []} hideFieldValues header={header} footer={footer} />
      <CommonRemoveModal
        usage={ModalUsage.CredentialRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      />
    </SafeAreaView>
  )
}

export default CredentialDetails
