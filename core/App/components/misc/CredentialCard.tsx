import { CredentialExchangeRecord, CredentialState } from '@aries-framework/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Image,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { dateFormatOptions } from '../../constants'
import { useConfiguration } from '../../contexts/configuration'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { getCurrentLanguage } from '../../localization'
import { GenericFn } from '../../types/fn'
import { OCACredentialBundle } from '../../types/oca'
import { luminanceForHexColour } from '../../utils/luminance'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
}

const paddingVertical = 10
const paddingHorizontal = 10
const transparent = 'rgba(0,0,0,0)'
const borderRadius = 15
const borderPadding = 8
const { width } = Dimensions.get('window')

const toImageSource = (source: unknown): ImageSourcePropType => {
  if (typeof source === 'string') {
    return { uri: source as string }
  }
  return source as ImageSourcePropType
}
interface BundlePair {
  bundle1?: OCACredentialBundle
  bundle2?: OCACredentialBundle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {}, onPress = undefined }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundle } = useConfiguration()

  const [bundles, setBundles] = useState<BundlePair | undefined>(undefined)
  //const [bundle, setBundle] = useState<OCACredentialBundle | undefined>(undefined)
  //const [defaultBundle, setDefaultBundle] = useState<OCACredentialBundle | undefined>(undefined)
  //const { bundle1: bundle, bundle2: defaultBundle } = bundles
  const lang = getCurrentLanguage()
  const metaLayer = bundles?.bundle1?.getMetaOverlay(lang) ?? bundles?.bundle2?.getMetaOverlay(lang)
  const overlay = bundles?.bundle1?.getCardLayoutOverlay() ?? bundles?.bundle2?.getCardLayoutOverlay()

  const [state] = useStore()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const bundleLoaded = bundles?.bundle1 !== undefined || bundles?.bundle2 !== undefined
  const { revoked } = state.credential

  const credentialTextColor = (hex?: string) => {
    const midpoint = 255 / 2
    if ((luminanceForHexColour(hex ?? '') ?? 0) >= midpoint) {
      return ColorPallet.grayscale.darkGrey
    }
    return ColorPallet.grayscale.white
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay?.imageSource ? transparent : overlay?.backgroundColor,
      height: width / 2,
      borderRadius: borderRadius,
      //borderColor: 'black',
      //borderStyle: 'solid',
      //borderWidth: 1,
    },
    outerHeaderContainer: {
      flexDirection: 'column',
      backgroundColor: overlay?.header?.backgroundColor ?? transparent,
      // eslint-disable-next-line prettier/prettier
      height: (width / 2 / 4) +  (borderPadding),
      //paddingHorizontal,
      //paddingVertical,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      //paddingLeft: 10,
      //paddingRight: 10,
      //paddingTop: 10,
    },
    innerHeaderContainer: {
      flexDirection: 'row',
      // eslint-disable-next-line prettier/prettier
      height: (width / 2 / 4),
      marginLeft: borderPadding,
      marginRight: borderPadding,
      marginTop: borderPadding,
      marginBottom: borderPadding,
      backgroundColor: overlay?.header?.backgroundColor ?? transparent,
    },
    bodyContainer: {
      flexGrow: 1,
    },
    footerContainer: {
      flexDirection: 'row',
      backgroundColor: overlay?.footer?.backgroundColor ?? transparent,
      paddingHorizontal,
      paddingVertical,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    },
    revokedFooter: {
      backgroundColor: ColorPallet.notification.error,
      flexGrow: 1,
      marginHorizontal: -1 * paddingHorizontal,
      marginVertical: -1 * paddingVertical,
      paddingHorizontal: paddingHorizontal,
      paddingVertical: paddingVertical,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
    },
    flexGrow: {
      flexGrow: 1,
    },
  })

  useEffect(() => {
    if (!credential) {
      return
    }
    if (credential.state !== CredentialState.OfferReceived) {
      const indyCredentialFormat = credential.credentials.find((c) => c.credentialRecordType === 'indy')
      if (!indyCredentialFormat) {
        return
      }
      const isRevoked = revoked.has(indyCredentialFormat.credentialRecordId)
      setIsRevoked(isRevoked)
    }
    OCABundle.resolve(credential).then(async (_bundle) => {
      if (_bundle !== undefined) {
        setBundles({ bundle1: _bundle, bundle2: undefined })
      } else {
        await OCABundle.resolveDefaultBundle(credential).then((_defaultBundle) => {
          setBundles({ bundle1: undefined, bundle2: _defaultBundle })
        })
      }
    })
  }, [])

  const renderCredentialCardHeader2 = () => {
    return (
      <View style={[styles.outerHeaderContainer]}>
        <View testID={testIdWithKey('CredentialCardHeader')} style={[styles.innerHeaderContainer]}>
          {overlay?.header?.imageSource && (
            <Image
              source={toImageSource(overlay?.header?.imageSource)}
              style={{
                flex: !overlay?.header?.hideIssuer ? 1 : 4,
                resizeMode: 'contain',
                maxHeight: styles.outerHeaderContainer.height - borderPadding,
              }}
            />
          )}
          {overlay?.header?.hideIssuer ? null : (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                TextTheme.label,
                {
                  color: overlay?.header?.color ?? credentialTextColor(overlay?.header?.backgroundColor),
                  paddingHorizontal: 0.5 * paddingHorizontal,
                  flex: !overlay?.header?.imageSource ? 4 : 3,
                  textAlignVertical: 'center',
                },
              ]}
              testID={testIdWithKey('CredentialIssuer')}
              maxFontSizeMultiplier={1}
            >
              {metaLayer?.issuer_name}
            </Text>
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              TextTheme.label,
              {
                color: overlay?.header?.color ?? credentialTextColor(overlay?.header?.backgroundColor),
                textAlign: 'right',
                paddingHorizontal: 0.5 * paddingHorizontal,
                flex: 4,
                textAlignVertical: 'center',
              },
            ]}
            testID={testIdWithKey('CredentialName')}
            maxFontSizeMultiplier={1}
          >
            {metaLayer?.name}
          </Text>
        </View>
      </View>
    )
  }

  const renderCredentialCardBody = () => {
    return <View style={styles.bodyContainer} testID={testIdWithKey('CredentialCardBody')}></View>
  }

  const renderCredentialCardFooter = (revoked = false) => {
    return (
      <View testID={testIdWithKey('CredentialCardFooter')} style={styles.footerContainer}>
        {revoked ? (
          <View style={styles.revokedFooter}>
            <Text
              style={[TextTheme.label, { color: ColorPallet.semantic.error }]}
              testID={testIdWithKey('CredentialRevoked')}
            >
              Revoked
            </Text>
          </View>
        ) : (
          <Text
            style={[
              TextTheme.caption,
              {
                color: overlay?.footer?.color ?? credentialTextColor(overlay?.footer?.backgroundColor),
              },
            ]}
            testID={testIdWithKey('CredentialIssued')}
            maxFontSizeMultiplier={1}
          >
            {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
          </Text>
        )}
      </View>
    )
  }

  const renderCredentialCard = (revoked = false) => {
    return (
      <>
        {renderCredentialCardHeader2()}
        {renderCredentialCardBody()}
        {renderCredentialCardFooter(revoked)}
      </>
    )
  }

  return (
    <TouchableOpacity
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      {bundleLoaded === true ? (
        <View style={styles.flexGrow} testID={testIdWithKey('CredentialCard')}>
          {overlay?.imageSource ? (
            <ImageBackground
              source={toImageSource(overlay?.imageSource)}
              style={styles.flexGrow}
              imageStyle={{ borderRadius }}
            >
              {renderCredentialCard(isRevoked)}
            </ImageBackground>
          ) : (
            renderCredentialCard(isRevoked)
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  )
}

export default CredentialCard
