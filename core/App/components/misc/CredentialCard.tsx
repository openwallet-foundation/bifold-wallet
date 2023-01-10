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
// import { getCurrentLanguage } from '../../localization'
import { CredentialStatus } from '../../types/credential-status'
import { GenericFn } from '../../types/fn'
import { OCACredentialBundle } from '../../types/oca'
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
// const borderPadding = 8
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
  const overlay = bundles?.bundle1?.getCardLayoutOverlay() ?? bundles?.bundle2?.getCardLayoutOverlay()

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
    // outerHeaderContainer: {
    //   flexDirection: 'column',
    //   backgroundColor: overlay?.header?.backgroundColor ?? transparent,
    //   height: cardHeaderHeight + borderPadding,
    //   borderTopLeftRadius: borderRadius,
    //   borderTopRightRadius: borderRadius,
    // },
    // innerHeaderContainer: {
    //   flexDirection: 'row',
    //   height: cardHeaderHeight,
    //   marginLeft: borderPadding,
    //   marginRight: borderPadding,
    //   marginTop: borderPadding,
    //   marginBottom: borderPadding,
    //   backgroundColor: overlay?.header?.backgroundColor ?? transparent,
    // },
    primaryBodyContainer: {
      flex: 6,
    },
    statusContainer: {
      alignItems: 'center',
    },
    // flexGrow: {
    //   flexGrow: 1,
    // },
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

  const renderCredentialCardPrimaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        {overlay?.header?.hideIssuer ? null : (
          <Text
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              TextTheme.label,
              {
                paddingVertical: padding,
                paddingHorizontal: 2 * padding,
                color:
                  overlay?.header?.color ??
                  credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
              },
            ]}
          >
            {metaLayer?.issuerName}
          </Text>
        )}
      </View>
    )
  }

  const renderCredentialCardSecondaryBody = () => {
    return <View testID={testIdWithKey('CredentialCardSecondaryBody')} style={styles.secondaryBodyContainer} />
  }

  // const renderCredentialCardHeader = () => {
  //   return (
  //     <View style={[styles.outerHeaderContainer]}>
  //       <View testID={testIdWithKey('CredentialCardHeader')} style={[styles.innerHeaderContainer]}>
  //         {overlay?.header?.imageSource && (
  //           <Image
  //             source={toImageSource(overlay?.header?.imageSource)}
  //             style={{
  //               flex: !overlay?.header?.hideIssuer ? 1 : 4,
  //               resizeMode: 'contain',
  //               maxHeight: styles.outerHeaderContainer.height - borderPadding,
  //             }}
  //           />
  //         )}
  //         {overlay?.header?.hideIssuer ? null : (
  //           <Text
  //             numberOfLines={1}
  //             ellipsizeMode="tail"
  //             style={[
  //               TextTheme.label,
  //               {
  //                 color:
  //                   overlay?.header?.color ??
  //                   credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
  //                 paddingHorizontal: 0.5 * paddingHorizontal,
  //                 flex: !overlay?.header?.imageSource ? 4 : 3,
  //                 textAlignVertical: 'center',
  //               },
  //             ]}
  //             testID={testIdWithKey('CredentialIssuer')}
  //             maxFontSizeMultiplier={1}
  //           >
  //             {metaLayer?.issuerName}
  //           </Text>
  //         )}
  //         <Text
  //           numberOfLines={1}
  //           ellipsizeMode="tail"
  //           style={[
  //             TextTheme.label,
  //             {
  //               color:
  //                 overlay?.header?.color ??
  //                 credentialTextColor(overlay?.header?.backgroundColor || overlay?.backgroundColor),
  //               textAlign: 'right',
  //               paddingHorizontal: 0.5 * paddingHorizontal,
  //               flex: 4,
  //               textAlignVertical: 'center',
  //             },
  //           ]}
  //           testID={testIdWithKey('CredentialName')}
  //           maxFontSizeMultiplier={1}
  //         >
  //           {metaLayer?.name}
  //         </Text>
  //       </View>
  //     </View>
  //   )
  // }

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
