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
import { useTheme } from '../../contexts/theme'
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

/**
 * A card is defined as a 4x8 (height/rows x width/columns) grid.
 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
 | 2 |   |   |   |   |   |   |   |
 | 3 |   |   |   |   |   |   |   |
 | 4 |   |   |   |   |   |   |   |
 
The card width is the full screen width, and the card height is half of the screen width

Variation 1:
  Header: Small Logo (1x1) + Issuer Name (1x3) + Credential Name (1x4)
  Body: Reserved for Future Use (2x4)
  Footer: Issued or Expired Date (1x4)

  | L | Issuer    | Cred Name     |
  |             Body              |
  |             Body              |
  | Issued/Expired Date           |

 Variation 2:
  Header: Large Logo (1x4) + Credential Name (1x4)
  Body: Reserved for Future Use (2x4)
  Footer: Issued or Expired Date (1x4)

  | Logo          | Cred Name     |
  |             Body              |
  |             Body              |
  | Issued/Expired Date           |


Note: The small logo MUST be provided as 1x1 (height/width) ratio, while the large logo MUST be provided as 1x4 (height/width) ratio
 */
const cardHeight = width / 2 // a card height is half of the screen width
const cardHeaderHeight = cardHeight / 4 // a card has a total of 4 rows, and the header occupy 1 row

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
  const { t, i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundle } = useConfiguration()

  const [bundles, setBundles] = useState<BundlePair | undefined>(undefined)
  const metaLayer = bundles?.bundle1?.getMetaOverlay(i18n.language) ?? bundles?.bundle2?.getMetaOverlay(i18n.language)
  const overlay = bundles?.bundle1?.getCardLayoutOverlay() ?? bundles?.bundle2?.getCardLayoutOverlay()

  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const bundleLoaded = bundles?.bundle1 !== undefined || bundles?.bundle2 !== undefined

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
      height: cardHeight,
      borderRadius: borderRadius,
    },
    outerHeaderContainer: {
      flexDirection: 'column',
      backgroundColor: overlay?.header?.backgroundColor ?? transparent,
      height: cardHeaderHeight + borderPadding,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },
    innerHeaderContainer: {
      flexDirection: 'row',
      height: cardHeaderHeight,
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
    }
    OCABundle.resolve(credential).then(async (bundle) => {
      if (bundle !== undefined) {
        setBundles({ bundle1: bundle, bundle2: undefined })
      } else {
        await OCABundle.resolveDefaultBundle(credential).then((defaultBundle) => {
          setBundles({ bundle1: undefined, bundle2: defaultBundle })
        })
      }
    })
  }, [])

  useEffect(() => {
    setIsRevoked(credential.revocationNotification !== undefined)
  }, [credential.revocationNotification])

  const renderCredentialCardHeader = () => {
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
                  color:
                    overlay?.header?.color ??
                    credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
                  paddingHorizontal: 0.5 * paddingHorizontal,
                  flex: !overlay?.header?.imageSource ? 4 : 3,
                  textAlignVertical: 'center',
                },
              ]}
              testID={testIdWithKey('CredentialIssuer')}
              maxFontSizeMultiplier={1}
            >
              {metaLayer?.issuerName}
            </Text>
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              TextTheme.label,
              {
                color:
                  overlay?.header?.color ??
                  credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
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
              {t('CredentialDetails.Revoked')}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              TextTheme.caption,
              {
                color:
                  overlay?.footer?.color ??
                  credentialTextColor(overlay?.footer?.backgroundColor || overlay?.backgroundColor),
              },
            ]}
            testID={testIdWithKey('CredentialIssued')}
            maxFontSizeMultiplier={1}
          >
            {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString(i18n.language, dateFormatOptions)}
          </Text>
        )}
      </View>
    )
  }

  const renderCredentialCard = (revoked = false) => {
    return (
      <>
        {renderCredentialCardHeader()}
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
