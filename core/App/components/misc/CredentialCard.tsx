import { CredentialExchangeRecord, CredentialState } from '@aries-framework/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dimensions,
  // ImageBackground,
  // ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  // Image,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

// import { dateFormatOptions } from '../../constants'
import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CredentialStatus } from '../../types/credential-status'
import { GenericFn } from '../../types/fn'
import { CardOverlayType, OCACredentialBundle } from '../../types/oca'
import { luminanceForHexColor } from '../../utils/luminance'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
}

const transparent = 'rgba(0,0,0,0)'
const padding = 10
const borderRadius = 15
const { width } = Dimensions.get('window')

/*
  A card is defined as a nx8 (height/rows x width/columns) grid.
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
  | 2 |   |   |   |   |   |   |   |
  | 3 |   |   |   |   |   |   |   |
  | 4 |   |   |   |   |   |   |   |
  ...
 
  The card width is the full screen width.

  Secondary Body (1): Small Logo (1x1) -> L (shifted right by 50%)
  Primary Body   (2): Issuer Name (1x6)
                      Credential Name (1x6)
                      Primary Attribute 1 (1x6)
                      Primary Attribute 2 (1x6)
  Status         (3):  Icon (1x1) -> S

   (1)            (2)           (3)
  | L | Issuer Name            | S |
  |   | Credential Name        |   |
  |   |                        |   |
  |   | Primary Attribute 1    |   |
  |   | Primary Attribute 2    |   |
  ...

  Note: The small logo MUST be provided as 1x1 (height/width) ratio.
 */
const cardHeight = width / 2 // a card height is half of the screen width
// const cardHeaderHeight = cardHeight / 4 // a card has a total of 4 rows, and the header occupy 1 row

// const toImageSource = (source: unknown): ImageSourcePropType => {
//   if (typeof source === 'string') {
//     return { uri: source as string }
//   }
//   return source as ImageSourcePropType
// }

interface BundlePair {
  bundle1?: OCACredentialBundle
  bundle2?: OCACredentialBundle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {}, onPress = undefined }) => {
  const { i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundle } = useConfiguration()

  const [bundles, setBundles] = useState<BundlePair | undefined>(undefined)
  const metaLayer = bundles?.bundle1?.getMetaOverlay(i18n.language) ?? bundles?.bundle2?.getMetaOverlay(i18n.language)
  const overlay =
    bundles?.bundle1?.getCardLayoutOverlay(CardOverlayType.CARD_LAYOUT_20) ??
    bundles?.bundle2?.getCardLayoutOverlay(CardOverlayType.CARD_LAYOUT_20)

  const [isRevoked] = useState<boolean>(credential.revocationNotification !== undefined)
  const bundleLoaded = bundles?.bundle1 !== undefined || bundles?.bundle2 !== undefined

  const credentialTextColor = (hex?: string) => {
    const midpoint = 255 / 2
    if ((luminanceForHexColor(hex ?? '') ?? 0) >= midpoint) {
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
    cardContainer: {
      flexGrow: 1,
      flexDirection: 'row',
    },
    secondaryBodyContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.24)',
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
    },
    primaryBodyContainer: {
      flex: 6,
    },
    statusContainer: {
      alignItems: 'center',
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
    // TODO: Refactor
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

  const renderCredentialCardPrimaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        {overlay?.header?.hideIssuer ? null : (
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.labelSubtitle,
              {
                paddingVertical: padding,
                paddingHorizontal: 2 * padding,
                paddingBottom: 0.25 * padding,
                color:
                  overlay?.header?.color ??
                  credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
              },
            ]}
          >
            {metaLayer?.issuerName}
          </Text>
        )}
        <Text
          testID={testIdWithKey('CredentialName')}
          style={[
            TextTheme.labelTitle,
            {
              paddingVertical: padding,
              paddingHorizontal: 2 * padding,
              paddingTop: 0.25 * padding,
              color:
                overlay?.header?.color ??
                credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
            },
          ]}
          maxFontSizeMultiplier={1}
        >
          {metaLayer?.name}
        </Text>
      </View>
    )
  }

  const renderCredentialCardSecondaryBody = () => {
    return <View testID={testIdWithKey('CredentialCardSecondaryBody')} style={styles.secondaryBodyContainer} />
  }

  const renderCredentialCardStatus = (status?: CredentialStatus) => {
    const renderStatus = (status?: CredentialStatus) => {
      switch (status) {
        case CredentialStatus.REVOKED:
          return (
            <View
              style={{
                backgroundColor: ColorPallet.notification.error,
                borderTopRightRadius: borderRadius,
                borderBottomLeftRadius: borderRadius,
                padding: 10,
              }}
            >
              <Icon size={24} style={{ color: ColorPallet.semantic.error }} name="error" />
            </View>
          )
        default:
          return (
            <View
              style={{
                backgroundColor: transparent,
                borderTopRightRadius: borderRadius,
                borderBottomLeftRadius: borderRadius,
                padding: 10,
              }}
            >
              <View style={{ width: 24, height: 24 }} />
            </View>
          )
      }
    }

    return (
      <View testID={testIdWithKey('CredentialCardStatus')} style={styles.statusContainer}>
        {renderStatus(status)}
      </View>
    )
  }

  const renderCredentialCard = (status?: CredentialStatus) => {
    return (
      <View style={styles.cardContainer}>
        {renderCredentialCardSecondaryBody()}
        {renderCredentialCardPrimaryBody()}
        {renderCredentialCardStatus(status)}
      </View>
    )
  }

  return (
    <TouchableOpacity
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      {bundleLoaded === true
        ? // <View testID={testIdWithKey('CredentialCard')}>
          //   {overlay?.imageSource ? (
          //     <ImageBackground
          //       source={toImageSource(overlay?.imageSource)}
          //       style={styles.flexGrow}
          //       imageStyle={{ borderRadius }}
          //     >
          //       {renderCredentialCard(isRevoked)}
          //     </ImageBackground>
          //   ) : (
          //     renderCredentialCard(isRevoked)
          //   )}
          // </View>
          renderCredentialCard(isRevoked ? CredentialStatus.REVOKED : undefined)
        : null}
    </TouchableOpacity>
  )
}

export default CredentialCard
