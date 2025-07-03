import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { BrandingOverlay } from '@bifold/oca'
import { Attribute, BrandingOverlayType, CredentialOverlay } from '@bifold/oca/build/legacy'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useStore } from '../contexts/store'

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
import { RootStackParams, Screens, Stacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { credentialTextColor, getCredentialIdentifiers, isValidAnonCredsCredential } from '../utils/credential'
import { formatTime, useCredentialConnectionLabel } from '../utils/helpers'
import { buildFieldsFromAnonCredsCredential } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'
import { HistoryCardType, HistoryRecord } from '../modules/history/types'
import { parseCredDefFromId } from '../utils/cred-def'
import CredentialCardLogo from '../components/views/CredentialCardLogo'
import CredentialDetailPrimaryHeader from '../components/views/CredentialDetailPrimaryHeader'
import CredentialDetailSecondaryHeader from '../components/views/CredentialDetailSecondaryHeader'
import { ThemedText } from '../components/texts/ThemedText'
import CardWatermark from '../components/misc/CardWatermark'

type CredentialDetailsProps = StackScreenProps<RootStackParams, Screens.CredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route params were not set properly')
  }

  const { credentialId } = route.params
  const { width, height } = useWindowDimensions()
  const [credential, setCredential] = useState<CredentialExchangeRecord | undefined>(undefined)
  const { agent } = useAgent()
  const { t, i18n } = useTranslation()
  const { ColorPallet, Assets } = useTheme()
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
  const [store] = useStore()

  useEffect(() => {
    setIsRevokedMessageHidden(
      (credential?.metadata.get(CredentialMetadata.customMetadata) as credentialCustomMetadata)
        ?.revoked_detail_dismissed ?? false
    )
  }, [credential?.metadata])

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
  const isBranding10 = bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding10
  const isBranding11 = bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding11

  const containerBackgroundColor =
    overlay.brandingOverlay?.secondaryBackgroundColor && overlay.brandingOverlay.secondaryBackgroundColor !== ''
      ? overlay.brandingOverlay.secondaryBackgroundColor
      : overlay.brandingOverlay?.primaryBackgroundColor

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isBranding10 ? overlay.brandingOverlay?.primaryBackgroundColor : containerBackgroundColor,
      display: 'flex',
    },
  })

  const icon = {
    color: credentialTextColor(ColorPallet, containerBackgroundColor),
    width: 48,
    height: 48,
  }

  const navigateToContactDetails = () => {
    if (credential?.connectionId) {
      navigation.navigate(Stacks.ContactStack, {
        screen: Screens.ContactDetails,
        params: { connectionId: credential.connectionId },
      })
    }
  }

  const callViewJSONDetails = useCallback(() => {
    navigation.navigate(Stacks.ContactStack, {
      screen: Screens.JSONDetails,
      params: { jsonBlob: JSON.stringify(credential, null, 2) },
    })
  }, [navigation, credential])

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
      const name = overlay.metaOverlay?.name ?? parseCredDefFromId(ids.credentialDefinitionId, ids.schemaId)

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
  }, [
    agent,
    historyEnabled,
    logger,
    historyManagerCurried,
    credential,
    credentialConnectionLabel,
    credentialId,
    overlay,
  ])

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

  const getCredentialTop = () => {
    if (isBranding10) {
      return (
        <>
          <CredentialDetailSecondaryHeader overlay={overlay} />
          <CredentialCardLogo overlay={overlay} />
          <CredentialDetailPrimaryHeader overlay={overlay} />
        </>
      )
    }
    return (
      <View>
        <CredentialDetailSecondaryHeader
          overlay={overlay}
          brandingOverlayType={bundleResolver.getBrandingOverlayType()}
        />
        <TouchableOpacity
          accessibilityLabel={`${overlay.metaOverlay?.watermark ? overlay.metaOverlay.watermark + '. ' : ''}${t(
            'Credentials.IssuedBy'
          )} ${overlay.metaOverlay?.issuer}`}
          accessibilityRole="button"
          accessibilityHint={t('CredentialDetails.NavigateToIssuerDetailsHint')}
          onPress={navigateToContactDetails}
          style={{ padding: 16, overflow: 'hidden' }}
        >
          {overlay.metaOverlay?.watermark && (
            <CardWatermark width={width} height={height} watermark={overlay.metaOverlay?.watermark} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2 }}>
              <CredentialCardLogo overlay={overlay} brandingOverlayType={bundleResolver.getBrandingOverlayType()} />
              <ThemedText
                style={{
                  color: credentialTextColor(ColorPallet, containerBackgroundColor),
                  flexWrap: 'wrap',
                  maxWidth: '90%',
                }}
              >
                {overlay.metaOverlay?.issuer}
              </ThemedText>
            </View>
            <Assets.svg.iconChevronRight {...icon} />
          </View>
        </TouchableOpacity>
        <View style={{ backgroundColor: ColorPallet.brand.secondaryBackground }}>
          <CredentialDetailPrimaryHeader
            overlay={overlay}
            brandingOverlayType={bundleResolver.getBrandingOverlayType()}
            credential={credential}
          />
        </View>
      </View>
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
        {getCredentialTop()}
        {isRevoked && !isRevokedMessageHidden ? (
          <View
            style={{
              padding: paddingVertical,
              backgroundColor: ColorPallet.brand.secondaryBackground,
              ...(isBranding11 && { paddingTop: 0 }),
            }}
          >
            {credential && <CredentialRevocationMessage credential={credential} />}
          </View>
        ) : null}
      </View>
    )
  }

  const footer = () => {
    return (
      <View style={{ marginBottom: 50 }}>
        {credentialConnectionLabel && isBranding10 ? (
          <View
            style={{
              backgroundColor: ColorPallet.brand.secondaryBackground,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <ThemedText testID={testIdWithKey('IssuerName')}>
              <ThemedText variant="title" style={isRevoked && { color: ColorPallet.grayscale.mediumGrey }}>
                {t('CredentialDetails.IssuedBy') + ' '}
              </ThemedText>
              <ThemedText style={isRevoked && { color: ColorPallet.grayscale.mediumGrey }}>
                {credentialConnectionLabel}
              </ThemedText>
            </ThemedText>
            {/* issued date if dev mode */}
            {store?.preferences.developerModeEnabled && credential?.createdAt ? (
              <ThemedText testID={testIdWithKey('IssuedDate')}>
                <ThemedText variant="title" style={isRevoked && { color: ColorPallet.grayscale.mediumGrey }}>
                  {t('CredentialDetails.Issued') + ': '}
                </ThemedText>
                <ThemedText style={isRevoked && { color: ColorPallet.grayscale.mediumGrey }}>
                  {formatTime(credential.createdAt, { format: 'YYYY-MM-DD HH:mm:ss [UTC]' })}
                </ThemedText>
              </ThemedText>
            ) : null}
          </View>
        ) : null}
        {store?.preferences.developerModeEnabled && (
          <View
            style={{
              backgroundColor: ColorPallet.brand.secondaryBackground,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <TouchableOpacity
              onPress={callViewJSONDetails}
              accessibilityLabel={t('Global.ViewJSON')}
              accessibilityRole={'button'}
              testID={testIdWithKey('JSONDetails')}
              style={{ flexDirection: 'row', gap: 8 }}
            >
              <Assets.svg.iconCode width={20} height={20} color={ColorPallet.brand.secondary} />
              <ThemedText>{t('Global.ViewJSON')}</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        {isRevoked ? (
          <View
            style={{
              backgroundColor: ColorPallet.notification.error,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <ThemedText testID={testIdWithKey('RevokedDate')}>
              <ThemedText variant="title" style={{ color: ColorPallet.notification.errorText }}>
                {t('CredentialDetails.Revoked') + ': '}
              </ThemedText>
              <ThemedText style={{ color: ColorPallet.notification.errorText }}>{preciseRevocationDate}</ThemedText>
            </ThemedText>
            <ThemedText
              style={{ color: ColorPallet.notification.errorText, marginTop: paddingVertical }}
              testID={testIdWithKey('RevocationMessage')}
            >
              {credential?.revocationNotification?.comment
                ? credential.revocationNotification.comment
                : t('CredentialDetails.CredentialRevokedMessageBody')}
            </ThemedText>
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
