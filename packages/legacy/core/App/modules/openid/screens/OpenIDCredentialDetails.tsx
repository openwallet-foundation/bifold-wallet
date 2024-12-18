import React, { useEffect } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { CredentialStackParams, Screens } from '../../../types/navigators'
import { getCredentialForDisplay } from '../display'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import { useState } from 'react'
import { DeviceEventEmitter, Image, ImageBackground, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { TextTheme } from '../../../theme'
import { useTranslation } from 'react-i18next'
import { testIdWithKey } from '../../../utils/testable'
import { useTheme } from '../../../contexts/theme'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { useAgent } from '@credo-ts/react-hooks'
import RecordRemove from '../../../components/record/RecordRemove'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { W3cCredentialDisplay } from '../types'
import { TOKENS, useServices } from '../../../container-api'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import Record from '../../../components/record/Record'
import { W3cCredentialRecord } from '@credo-ts/core'
import { credentialTextColor, toImageSource } from '../../../utils/credential'
import CardWatermark from '../../../components/misc/CardWatermark'
import { buildOverlayFromW3cCredential } from '../../../utils/oca'

export enum OpenIDCredScreenMode {
  offer,
  details,
}

type OpenIDCredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.OpenIDCredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16
const logoHeight = 80

const OpenIDCredentialDetails: React.FC<OpenIDCredentialDetailsProps> = ({ navigation, route }) => {
  const { credentialId } = route.params

  const [credential, setCredential] = useState<W3cCredentialRecord | undefined>(undefined)
  const [credentialDisplay, setCredentialDisplay] = useState<W3cCredentialDisplay>()
  const { t, i18n } = useTranslation()
  const { ColorPallet } = useTheme()
  const { agent } = useAgent()
  const { removeCredential } = useOpenIDCredentials()
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])

  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)
  const { width, height } = useWindowDimensions()

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    brandingOverlay: undefined,
  })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
    secondaryHeaderContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (overlay.brandingOverlay?.backgroundImage
          ? 'rgba(0, 0, 0, 0)'
          : overlay.brandingOverlay?.secondaryBackgroundColor) ?? 'rgba(0, 0, 0, 0.24)',
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
      color: credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
    },
  })

  useEffect(() => {
    if (!agent) return
    const fetchCredential = async () => {
      try {
        const credentialExchangeRecord = await agent.w3cCredentials.getCredentialRecordById(credentialId)
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

  useEffect(() => {
    if (!credential) return
    try {
      const credDisplay = getCredentialForDisplay(credential)
      setCredentialDisplay(credDisplay)
    } catch (error) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
      )
    }
  }, [credential, t])

  useEffect(() => {
    const resolveOverlay = async () => {
      if (!credentialDisplay || !bundleResolver || !i18n || !credentialDisplay.display) {
        return
      }

      const resolvedOverlay = await buildOverlayFromW3cCredential({
        credentialDisplay,
        language: i18n.language,
        resolver: bundleResolver,
      })

      setOverlay(resolvedOverlay)
    }

    resolveOverlay()
  }, [credentialDisplay, bundleResolver, i18n])

  const toggleDeclineModalVisible = () => setIsRemoveModalDisplayed(!isRemoveModalDisplayed)

  const handleDeclineTouched = async () => {
    handleRemove()
  }

  const handleRemove = async () => {
    if (!credential) return
    try {
      await removeCredential(credential)
      navigation.pop()
    } catch (err) {
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), (err as Error)?.message ?? err, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={styles.logoContainer}>
        {overlay.brandingOverlay?.logo ? (
          <Image
            source={toImageSource(overlay.brandingOverlay?.logo)}
            style={{
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: 8,
            }}
          />
        ) : (
          <Text style={[TextTheme.title, { fontSize: 0.5 * logoHeight, color: '#000' }]}>
            {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const CredentialDetailPrimaryHeader: React.FC = () => {
    return (
      <View
        testID={testIdWithKey('CredentialDetailsPrimaryHeader')}
        style={[styles.primaryHeaderContainer, { zIndex: -1 }]}
      >
        <View>
          {overlay.metaOverlay?.watermark && (
            <CardWatermark width={width} height={height} watermark={overlay.metaOverlay?.watermark} />
          )}
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
            {overlay.metaOverlay?.issuer}
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
        {overlay.brandingOverlay?.backgroundImage ? (
          <ImageBackground
            source={toImageSource(overlay.brandingOverlay?.backgroundImage)}
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
    if (!credentialDisplay) return null

    return (
      <View style={styles.container}>
        <CredentialDetailSecondaryHeader />
        <CredentialCardLogo />
        <CredentialDetailPrimaryHeader />
      </View>
    )
  }

  const footer = () => {
    if (!credentialDisplay) return null
    const paddingHorizontal = 24
    const paddingVertical = 16
    return (
      <View style={{ marginBottom: 50 }}>
        <View
          style={{
            backgroundColor: ColorPallet.brand.secondaryBackground,
            marginTop: paddingVertical,
            paddingHorizontal,
            paddingVertical,
          }}
        >
          <Text testID={testIdWithKey('IssuerName')}>
            <Text style={[TextTheme.title]}>{t('CredentialDetails.IssuedBy') + ' '}</Text>
            <Text style={[TextTheme.normal]}>
              {credentialDisplay.display.issuer.name || t('ContactDetails.AContact')}
            </Text>
          </Text>
        </View>
        <RecordRemove onRemove={toggleDeclineModalVisible} />
      </View>
    )
  }

  const screenEdges: Edge[] = ['left', 'right']

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={screenEdges}>
      <Record fields={overlay.presentationFields || []} hideFieldValues header={header} footer={footer} />
      <CommonRemoveModal
        usage={ModalUsage.CredentialRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default OpenIDCredentialDetails
