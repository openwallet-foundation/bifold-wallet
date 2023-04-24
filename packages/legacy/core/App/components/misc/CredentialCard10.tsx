import { CredentialExchangeRecord } from '@aries-framework/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ImageBackground, StyleSheet, Text, View, ViewStyle, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { CardLayoutOverlay10, CredentialOverlay } from '../../types/oca'
import {
  credentialTextColor,
  getCredentialIdentifiers,
  isValidIndyCredential,
  toImageSource,
} from '../../utils/credential'
import { formatTime, getCredentialConnectionLabel } from '../../utils/helpers'
import { buildFieldsFromIndyCredential } from '../../utils/oca'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCard10Props {
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

const CredentialCard10: React.FC<CredentialCard10Props> = ({ credential, style = {}, onPress = undefined }) => {
  const { t, i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay10>>({})
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay?.cardLayoutOverlay?.imageSource
        ? transparent
        : overlay?.cardLayoutOverlay?.backgroundColor,
      height: cardHeight,
      borderRadius: borderRadius,
    },
    outerHeaderContainer: {
      flexDirection: 'column',
      backgroundColor: overlay?.cardLayoutOverlay?.header?.backgroundColor ?? transparent,
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
      backgroundColor: overlay?.cardLayoutOverlay?.header?.backgroundColor ?? transparent,
    },
    bodyContainer: {
      flexGrow: 1,
    },
    footerContainer: {
      flexDirection: 'row',
      backgroundColor: overlay?.cardLayoutOverlay?.footer?.backgroundColor ?? transparent,
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
    if (!(credential && isValidIndyCredential(credential))) {
      return
    }

    const params = {
      identifiers: getCredentialIdentifiers(credential),
      attributes: buildFieldsFromIndyCredential(credential),
      meta: {
        credConnectionId: credential?.connectionId,
        alias: credentialConnectionLabel,
      },
      language: i18n.language,
    }
    OCABundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay({
        ...overlay,
        ...bundle,
        cardLayoutOverlay: bundle.cardLayoutOverlay as CardLayoutOverlay10,
      })
    })
  }, [])

  useEffect(() => {
    setIsRevoked(credential.revocationNotification !== undefined)
  }, [credential.revocationNotification])

  const CredentialCardHeader: React.FC = () => {
    return (
      <View style={[styles.outerHeaderContainer]}>
        <View testID={testIdWithKey('CredentialCardHeader')} style={[styles.innerHeaderContainer]}>
          {overlay?.cardLayoutOverlay?.header?.imageSource && (
            <Image
              source={toImageSource(overlay?.cardLayoutOverlay?.header?.imageSource)}
              style={{
                flex: !overlay?.cardLayoutOverlay?.header?.hideIssuer ? 1 : 4,
                resizeMode: 'contain',
                maxHeight: styles.outerHeaderContainer.height - borderPadding,
              }}
            />
          )}
          {overlay?.cardLayoutOverlay?.header?.hideIssuer ? null : (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                TextTheme.label,
                {
                  color:
                    overlay?.cardLayoutOverlay?.header?.color ??
                    credentialTextColor(
                      ColorPallet,
                      overlay?.cardLayoutOverlay?.header?.backgroundColor || overlay?.cardLayoutOverlay?.backgroundColor
                    ),
                  paddingHorizontal: 0.5 * paddingHorizontal,
                  flex: !overlay?.cardLayoutOverlay?.header?.imageSource ? 4 : 3,
                  textAlignVertical: 'center',
                },
              ]}
              testID={testIdWithKey('CredentialIssuer')}
              maxFontSizeMultiplier={1}
            >
              {overlay?.metaOverlay?.issuerName}
            </Text>
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              TextTheme.label,
              {
                color:
                  overlay?.cardLayoutOverlay?.header?.color ??
                  credentialTextColor(
                    ColorPallet,
                    overlay?.cardLayoutOverlay?.header?.backgroundColor || overlay?.cardLayoutOverlay?.backgroundColor
                  ),
                textAlign: 'right',
                paddingHorizontal: 0.5 * paddingHorizontal,
                flex: 4,
                textAlignVertical: 'center',
              },
            ]}
            testID={testIdWithKey('CredentialName')}
            maxFontSizeMultiplier={1}
          >
            {overlay?.metaOverlay?.name}
          </Text>
        </View>
      </View>
    )
  }

  const CredentialCardBody: React.FC = () => {
    return <View style={styles.bodyContainer} testID={testIdWithKey('CredentialCardBody')}></View>
  }

  const CredentialCardFooter: React.FC<{ revoked: boolean }> = ({ revoked = false }) => {
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
                  overlay?.cardLayoutOverlay?.footer?.color ??
                  credentialTextColor(
                    ColorPallet,
                    overlay?.cardLayoutOverlay?.footer?.backgroundColor || overlay?.cardLayoutOverlay?.backgroundColor
                  ),
              },
            ]}
            testID={testIdWithKey('CredentialIssued')}
            maxFontSizeMultiplier={1}
          >
            {t('CredentialDetails.Issued')}: {formatTime(credential.createdAt)}
          </Text>
        )}
      </View>
    )
  }

  const CredentialCard: React.FC<{ revoked?: boolean }> = ({ revoked = false }) => {
    return (
      <>
        <CredentialCardHeader />
        <CredentialCardBody />
        <CredentialCardFooter revoked={revoked} />
      </>
    )
  }

  return (
    <TouchableOpacity
      accessible={false}
      accessibilityLabel={typeof onPress === 'undefined' ? undefined : t('Credentials.CredentialDetails')}
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      <View style={styles.flexGrow} testID={testIdWithKey('CredentialCard')}>
        {overlay?.cardLayoutOverlay?.imageSource ? (
          <ImageBackground
            source={toImageSource(overlay?.cardLayoutOverlay?.imageSource)}
            style={styles.flexGrow}
            imageStyle={{ borderRadius }}
          >
            <CredentialCard revoked={isRevoked} />
          </ImageBackground>
        ) : (
          <CredentialCard revoked={isRevoked} />
        )}
      </View>
    </TouchableOpacity>
  )
}

export default CredentialCard10
