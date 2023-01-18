import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

// import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'

import CommonRemoveModal from '../components/modals/CommonRemoveModal'
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
import { CardLayoutOverlay_2_0, CardOverlayType, OCACredentialBundle } from '../types/oca'
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
  const { OCABundle, record } = useConfiguration()

  const [, dispatch] = useStore()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  // const [revocationDate, setRevocationDate] = useState<string>('')
  const [, setRevocationDate] = useState<string>('')
  const [fields, setFields] = useState<Field[]>([])
  // const [isRevokedMessageHidden] = useState<boolean>(false)
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [bundle, setBundle] = useState<OCACredentialBundle | undefined>(undefined)

  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

  const metaOverlay = bundle?.getMetaOverlay(i18n.language)
  const cardLayoutOverlay = bundle?.getCardLayoutOverlay<CardLayoutOverlay_2_0>(CardOverlayType.CARD_LAYOUT_20)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: cardLayoutOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
    secondaryHeaderContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (cardLayoutOverlay?.backgroundImage?.src ? 'rgba(0, 0, 0, 0)' : cardLayoutOverlay?.secondaryBackgroundColor) ||
        'rgba(0, 0, 0, 0.24)',
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
      color: credentialTextColor(ColorPallet, cardLayoutOverlay?.primaryBackgroundColor),
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
      const bundle = await OCABundle.resolve(credential)
      if (bundle) {
        setBundle(bundle)
      } else {
        const defaultBundle = await OCABundle.resolveDefaultBundle(credential)
        setBundle(defaultBundle)
      }
    }

    const resolvePresentationFields = async () => {
      const fields = await OCABundle.getCredentialPresentationFields(credential, i18n.language)
      setFields(fields)
    }

    Promise.all([resolveBundle(), resolvePresentationFields()]).then()
  }, [credential])

  useEffect(() => {
    if (credential?.revocationNotification) {
      credential.metadata.set(CredentialMetadata.customMetadata, { revoked_seen: true })
      const credService = agent?.credentials.getService('v1')
      credService?.update(credential)
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

  const callOnRemove = useCallback(() => handleOnRemove(), [])
  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])

  const renderCredentialCardLogo = () => {
    return (
      <View style={styles.logoContainer}>
        {cardLayoutOverlay?.logo?.src ? (
          <Image
            source={toImageSource(cardLayoutOverlay?.logo.src)}
            style={{
              resizeMode: 'center',
            }}
          />
        ) : (
          <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight }]}>
            {(metaOverlay?.issuerName || metaOverlay?.name || 'C')?.charAt(0).toUpperCase()}
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
              TextTheme.labelSubtitle,
              styles.textContainer,
              {
                paddingLeft: paddingVertical,
              },
            ]}
            numberOfLines={1}
          >
            {metaOverlay?.issuerName}
          </Text>
        </View>
        <Text testID={testIdWithKey('CredentialName')} style={[TextTheme.labelTitle, styles.textContainer]}>
          {metaOverlay?.name}
        </Text>
      </View>
    )
  }

  const renderCredentialDetailSecondaryHeader = () => {
    return (
      <>
        {cardLayoutOverlay?.backgroundImage?.src ? (
          <ImageBackground
            source={toImageSource(cardLayoutOverlay?.backgroundImage.src)}
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
        {/* TODO: Update revocation message */}
        {/* {isRevoked && !isRevokedMessageHidden ? (
          <View style={{ marginHorizontal: 15, marginTop: 16 }}>
            {credential && (
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={t('CredentialDetails.CredentialRevokedMessageTitle') + ' ' + revocationDate}
                description={
                  credential?.revocationNotification?.comment
                    ? credential.revocationNotification.comment
                    : t('CredentialDetails.CredentialRevokedMessageBody')
                }
              />
            )}
          </View>
        ) : null} */}
      </View>
    )
  }

  const footer = () => {
    return (
      <View style={{ marginBottom: 30 }}>
        {credentialConnectionLabel ? (
          <View
            style={{
              backgroundColor: ColorPallet.brand.secondaryBackground,
              marginTop: paddingVertical,
              paddingHorizontal,
              paddingVertical,
            }}
          >
            <View>
              <Text>
                <Text style={[TextTheme.title]}>{t('CredentialDetails.IssuedBy')}</Text>{' '}
                <Text style={[TextTheme.normal]}>{credentialConnectionLabel}</Text>
              </Text>
            </View>
          </View>
        ) : null}
        <RecordRemove onRemove={callOnRemove} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record({
        header,
        footer,
        fields,
        hideFieldValues: true,
      })}
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
