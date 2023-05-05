import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import Record from '../components/record/Record'
import RecordRemove from '../components/record/RecordRemove'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { CredentialMetadata } from '../types/metadata'
import { CredentialStackParams, Screens } from '../types/navigators'
import { CardLayoutOverlay11, CardOverlayType, CredentialOverlay } from '../types/oca'
import { RemoveType } from '../types/remove'
import {
  credentialTextColor,
  getCredentialIdentifiers,
  isValidIndyCredential,
  toImageSource,
} from '../utils/credential'
import { formatTime, getCredentialConnectionLabel } from '../utils/helpers'
import { buildFieldsFromIndyCredential } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route prams were not set properly')
  }

  const { credential } = route?.params
  const { agent } = useAgent()
  const { t, i18n } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [revocationDate, setRevocationDate] = useState<string>('')
  const [preciseRevocationDate, setPreciseRevocationDate] = useState<string>('')
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [isRevokedMessageHidden, setIsRevokedMessageHidden] = useState<boolean>(false)

  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay11>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    cardLayoutOverlay: undefined,
  })

  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.cardLayoutOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
    secondaryHeaderContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (overlay.cardLayoutOverlay?.backgroundImage?.src
          ? 'rgba(0, 0, 0, 0)'
          : overlay.cardLayoutOverlay?.secondaryBackgroundColor) ?? 'rgba(0, 0, 0, 0.24)',
    },
    primaryHeaderContainer: {
      paddingHorizontal,
      paddingVertical,
    },
    statusContainer: {},
    logoContainer: {
      top: -0.5 * logoHeight,
      left: paddingHorizontal,
      marginBottom: -1 * logoHeight,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowOpacity: 0.3,
    },
    textContainer: {
      color: credentialTextColor(ColorPallet, overlay.cardLayoutOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
  })

  useEffect(() => {
    if (!agent) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
      )
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
      )
    }
  }, [])

  useEffect(() => {
    if (!(credential && isValidIndyCredential(credential))) {
      return
    }

    credential.revocationNotification == undefined ? setIsRevoked(false) : setIsRevoked(true)
    if (credential?.revocationNotification?.revocationDate) {
      const date = new Date(credential.revocationNotification.revocationDate)
      setRevocationDate(formatTime(date))
      setPreciseRevocationDate(formatTime(date, { long: true }))
    }

    const params = {
      identifiers: getCredentialIdentifiers(credential),
      meta: {
        alias: credentialConnectionLabel,
        credConnectionId: credential.connectionId,
      },
      attributes: buildFieldsFromIndyCredential(credential),
      language: i18n.language,
    }

    OCABundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay({ ...overlay, ...bundle })
    })
  }, [credential])

  useEffect(() => {
    if (credential?.revocationNotification) {
      credential.metadata.set(CredentialMetadata.customMetadata, { revoked_seen: true })
      agent?.credentials.update(credential)
    }
  }, [isRevoked])

  const handleOnRemove = () => {
    setIsRemoveModalDisplayed(true)
  }

  const handleSubmitRemove = async () => {
    try {
      if (!(agent && credential)) {
        return
      }

      await agent.credentials.deleteById(credential.id)

      Toast.show({
        type: ToastType.Success,
        text1: t('CredentialDetails.CredentialRemoved'),
      })

      navigation.pop()
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error).message, 1025)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleCancelRemove = () => {
    setIsRemoveModalDisplayed(false)
  }

  const handleDismissRevokedMessage = () => {
    setIsRevokedMessageHidden(true)
  }

  const callOnRemove = useCallback(() => handleOnRemove(), [])
  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])
  const callDismissRevokedMessage = useCallback(() => handleDismissRevokedMessage(), [])

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={styles.logoContainer}>
        {overlay.cardLayoutOverlay?.logo?.src ? (
          <Image
            source={toImageSource(overlay.cardLayoutOverlay?.logo.src)}
            style={{
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: 8,
            }}
          />
        ) : (
          <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight, color: '#000' }]}>
            {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuerName ?? 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const CredentialDetailPrimaryHeader: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialDetailsPrimaryHeader')} style={styles.primaryHeaderContainer}>
        <View>
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.label,
              styles.textContainer,
              {
                paddingLeft: logoHeight + paddingVertical,
                paddingBottom: paddingVertical,
                lineHeight: 19,
                opacity: 0.8,
              },
            ]}
            numberOfLines={1}
          >
            {overlay.metaOverlay?.issuerName}
          </Text>
          <Text
            testID={testIdWithKey('CredentialName')}
            style={[
              TextTheme.normal,
              styles.textContainer,
              {
                lineHeight: 24,
              },
            ]}
          >
            {overlay.metaOverlay?.name}
          </Text>
        </View>
      </View>
    )
  }

  const CredentialDetailSecondaryHeader: React.FC = () => {
    return (
      <>
        {overlay.cardLayoutOverlay?.backgroundImage?.src ? (
          <ImageBackground
            source={toImageSource(overlay.cardLayoutOverlay?.backgroundImage.src)}
            imageStyle={{
              resizeMode: 'cover',
            }}
          >
            <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer} />
          </ImageBackground>
        ) : (
          <View testID={testIdWithKey('CredentialDetailsSecondaryHeader')} style={styles.secondaryHeaderContainer} />
        )}
      </>
    )
  }

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
    return OCABundleResolver.cardOverlayType === CardOverlayType.CardLayout10 ? (
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
        <CredentialDetailSecondaryHeader />
        <CredentialCardLogo />
        <CredentialDetailPrimaryHeader />
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
        removeType={RemoveType.Credential}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      />
    </SafeAreaView>
  )
}

export default CredentialDetails
