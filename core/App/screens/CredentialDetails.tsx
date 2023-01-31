import type { StackScreenProps } from '@react-navigation/stack'

import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import Record from '../components/record/Record'
import RecordRemove from '../components/record/RecordRemove'
import { ToastType } from '../components/toast/BaseToast'
import { dateFormatOptions } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { CredentialMetadata } from '../types/metadata'
import { CredentialStackParams, Screens } from '../types/navigators'
import { CardLayoutOverlay11, MetaOverlay, OCABundle } from '../types/oca'
import { Field } from '../types/record'
import { RemoveType } from '../types/remove'
import { credentialTextColor, isValidIndyCredential, toImageSource } from '../utils/credential'
import { getCredentialConnectionLabel } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route prams were not set properly')
  }

  const { credentialId } = route?.params

  const { agent } = useAgent()
  const { t, i18n } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()
  const { OCABundleResolver } = useConfiguration()

  const [, dispatch] = useStore()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [revocationDate, setRevocationDate] = useState<string>('')
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [isRevokedMessageHidden, setIsRevokedMessageHidden] = useState<boolean>(false)

  const [overlay, setOverlay] = useState<{
    bundle: OCABundle | undefined
    presentationFields: Field[]
    metaOverlay: MetaOverlay | undefined
    cardLayoutOverlay: CardLayoutOverlay11 | undefined
  }>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    cardLayoutOverlay: undefined,
  })

  const credential = useCredentialById(credentialId)
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
          : overlay.cardLayoutOverlay?.secondaryBackgroundColor) || 'rgba(0, 0, 0, 0.24)',
    },
    primaryHeaderContainer: {
      paddingHorizontal,
      paddingVertical,
    },
    statusContainer: {},
    logoContainer: {
      top: -1 * (0.5 * logoHeight + paddingVertical),
      marginBottom: -1 * (0.5 * logoHeight + paddingVertical),
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      color: credentialTextColor(ColorPallet, overlay.cardLayoutOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
  })

  useEffect(() => {
    if (!agent) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1033'),
              t('Error.Message1033'),
              t('CredentialDetails.CredentialNotFound'),
              1033
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1033'),
              t('Error.Message1033'),
              t('CredentialDetails.CredentialNotFound'),
              1033
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!(credential && isValidIndyCredential(credential))) {
      return
    }

    credential.revocationNotification == undefined ? setIsRevoked(false) : setIsRevoked(true)
    if (isRevoked && credential?.revocationNotification?.revocationDate) {
      const date = new Date(credential.revocationNotification.revocationDate)
      setRevocationDate(date.toLocaleDateString(i18n.language, dateFormatOptions))
    }

    const resolveBundle = async () => {
      const bundle = await OCABundleResolver.resolve(credential)
      const defaultBundle = await OCABundleResolver.resolveDefaultBundle(credential)
      return { bundle, defaultBundle }
    }

    const resolvePresentationFields = async () => {
      const fields = await OCABundleResolver.presentationFields(credential, i18n.language)
      return { fields }
    }

    Promise.all([resolveBundle(), resolvePresentationFields()]).then(([{ bundle, defaultBundle }, { fields }]) => {
      const overlayBundle = bundle || defaultBundle
      const metaOverlay = overlayBundle?.metaOverlay
      const cardLayoutOverlay = overlayBundle?.cardLayoutOverlay

      setOverlay({ ...overlay, bundle: overlayBundle, presentationFields: fields, metaOverlay, cardLayoutOverlay })
    })
  }, [credential])

  useEffect(() => {
    if (credential?.revocationNotification) {
      credential.metadata.set(CredentialMetadata.customMetadata, { revoked_seen: true })
      agent?.credentials.update(credential)
    }
  }, [isRevoked])

  const goBackToListCredentials = () => {
    navigation.pop()
    navigation.navigate(Screens.Credentials)
  }

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
      goBackToListCredentials()
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error).message, 1025)

      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
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

  const renderCredentialCardLogo = () => {
    return (
      <View style={styles.logoContainer}>
        {overlay.cardLayoutOverlay?.logo?.src ? (
          <Image
            source={toImageSource(overlay.cardLayoutOverlay?.logo.src)}
            style={{
              resizeMode: 'center',
            }}
          />
        ) : (
          <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight }]}>
            {(overlay.metaOverlay?.issuerName || overlay.metaOverlay?.name || 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const renderCredentialDetailPrimaryHeader = () => {
    return (
      <View testID={testIdWithKey('CredentialDetailsPrimaryHeader')} style={styles.primaryHeaderContainer}>
        <View style={{ flexDirection: 'row', paddingBottom: paddingVertical }}>
          {renderCredentialCardLogo()}
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.label,
              styles.textContainer,
              {
                paddingLeft: paddingVertical,
                lineHeight: 19,
                opacity: 0.8,
              },
            ]}
            numberOfLines={1}
          >
            {overlay.metaOverlay?.issuerName}
          </Text>
        </View>
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
    )
  }

  const renderCredentialDetailSecondaryHeader = () => {
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

  const header = () => {
    return (
      <View style={styles.container}>
        {renderCredentialDetailSecondaryHeader()}
        {renderCredentialDetailPrimaryHeader()}
        {isRevoked && !isRevokedMessageHidden ? (
          <View style={{ padding: paddingVertical, paddingTop: 0 }}>
            {credential && (
              <InfoBox
                notificationType={InfoBoxType.Error}
                title={t('CredentialDetails.CredentialRevokedMessageTitle')}
                description={
                  credential?.revocationNotification?.comment
                    ? credential.revocationNotification.comment
                    : t('CredentialDetails.CredentialRevokedMessageBody')
                }
                onCallToActionLabel={t('Global.Dismiss')}
                onCallToActionPressed={callDismissRevokedMessage}
              />
            )}
          </View>
        ) : null}
      </View>
    )
  }

  const footer = () => {
    return (
      <View style={{ marginBottom: 30 }}>
        {credentialConnectionLabel ? (
          <View
            style={{
              backgroundColor: isRevoked ? ColorPallet.notification.error : ColorPallet.brand.secondaryBackground,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <>
              <Text>
                <Text style={[TextTheme.title, isRevoked && { color: ColorPallet.grayscale.mediumGrey }]}>
                  {t('CredentialDetails.IssuedBy') + ' '}
                </Text>
                <Text style={[TextTheme.normal, isRevoked && { color: ColorPallet.grayscale.mediumGrey }]}>
                  {credentialConnectionLabel}
                </Text>
              </Text>
              {isRevoked ? (
                <Text>
                  <Text style={[TextTheme.title, { color: ColorPallet.notification.errorText }]}>
                    {t('CredentialDetails.Revoked') + ': '}
                  </Text>
                  <Text style={[TextTheme.normal, { color: ColorPallet.notification.errorText }]}>
                    {revocationDate}
                  </Text>
                </Text>
              ) : null}
            </>
          </View>
        ) : null}
        <RecordRemove onRemove={callOnRemove} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      <Record fields={overlay.presentationFields} hideFieldValues header={header} footer={footer} />
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
