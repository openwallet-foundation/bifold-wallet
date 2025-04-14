import { CredentialExchangeRecord } from '@credo-ts/core'
import { LegacyBrandingOverlay } from '@bifold/oca'
import { CredentialOverlay } from '@bifold/oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import {
  credentialTextColor,
  getCredentialIdentifiers,
  isValidAnonCredsCredential,
  toImageSource,
} from '../../utils/credential'
import { formatTime, useCredentialConnectionLabel } from '../../utils/helpers'
import { buildFieldsFromAnonCredsCredential } from '../../utils/oca'
import { testIdWithKey } from '../../utils/testable'

import CardWatermark from './CardWatermark'

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

const CredentialCard10: React.FC<CredentialCard10Props> = ({ credential, style = {}, onPress = undefined }) => {
  const { width } = useWindowDimensions()
  const cardHeight = width / 2 // a card height is half of the screen width
  const cardHeaderHeight = cardHeight / 4 // a card has a total of 4 rows, and the header occupy 1 row
  const { t, i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [overlay, setOverlay] = useState<CredentialOverlay<LegacyBrandingOverlay>>({})
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const credentialConnectionLabel = useCredentialConnectionLabel(credential)
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay?.brandingOverlay?.imageSource ? transparent : overlay?.brandingOverlay?.backgroundColor,
      height: cardHeight,
      borderRadius: borderRadius,
    },
    outerHeaderContainer: {
      flexDirection: 'column',
      backgroundColor: overlay?.brandingOverlay?.header?.backgroundColor ?? transparent,
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
      backgroundColor: overlay?.brandingOverlay?.header?.backgroundColor ?? transparent,
    },
    bodyContainer: {
      flexGrow: 1,
    },
    footerContainer: {
      flexDirection: 'row',
      backgroundColor: overlay?.brandingOverlay?.footer?.backgroundColor ?? transparent,
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
    watermark: {
      opacity: 0.16,
      fontSize: 22,
      transform: [{ rotate: '-30deg' }],
    },
  })

  useEffect(() => {
    if (!(credential && isValidAnonCredsCredential(credential))) {
      return
    }

    const params = {
      identifiers: getCredentialIdentifiers(credential),
      attributes: buildFieldsFromAnonCredsCredential(credential),
      meta: {
        credConnectionId: credential?.connectionId,
        alias: credentialConnectionLabel,
      },
      language: i18n.language,
    }
    bundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay((o) => ({
        ...o,
        ...bundle,
        brandingOverlay: bundle.brandingOverlay as LegacyBrandingOverlay,
      }))
    })
  }, [credential, credentialConnectionLabel, i18n.language, bundleResolver])

  useEffect(() => {
    setIsRevoked(credential.revocationNotification !== undefined)
  }, [credential.revocationNotification])

  const CredentialCardHeader: React.FC = () => {
    return (
      <View style={styles.outerHeaderContainer}>
        <View testID={testIdWithKey('CredentialCardHeader')} style={styles.innerHeaderContainer}>
          {overlay?.brandingOverlay?.header?.imageSource && (
            <Image
              source={toImageSource(overlay?.brandingOverlay?.header?.imageSource)}
              style={{
                flex: !overlay?.brandingOverlay?.header?.hideIssuer ? 1 : 4,
                resizeMode: 'contain',
                maxHeight: styles.outerHeaderContainer.height - borderPadding,
              }}
            />
          )}
          {overlay?.brandingOverlay?.header?.hideIssuer ? null : (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                TextTheme.label,
                {
                  color:
                    overlay?.brandingOverlay?.header?.color ??
                    credentialTextColor(
                      ColorPallet,
                      overlay?.brandingOverlay?.header?.backgroundColor || overlay?.brandingOverlay?.backgroundColor
                    ),
                  paddingHorizontal: 0.5 * paddingHorizontal,
                  flex: !overlay?.brandingOverlay?.header?.imageSource ? 4 : 3,
                  textAlignVertical: 'center',
                },
              ]}
              testID={testIdWithKey('CredentialIssuer')}
              maxFontSizeMultiplier={1}
            >
              {overlay?.metaOverlay?.issuer}
            </Text>
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              TextTheme.label,
              {
                color:
                  overlay?.brandingOverlay?.header?.color ??
                  credentialTextColor(
                    ColorPallet,
                    overlay?.brandingOverlay?.header?.backgroundColor || overlay?.brandingOverlay?.backgroundColor
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
                  overlay?.brandingOverlay?.footer?.color ??
                  credentialTextColor(
                    ColorPallet,
                    overlay?.brandingOverlay?.footer?.backgroundColor || overlay?.brandingOverlay?.backgroundColor
                  ),
              },
            ]}
            testID={testIdWithKey('CredentialIssued')}
            maxFontSizeMultiplier={1}
          >
            {t('CredentialDetails.Issued')}: {formatTime(credential.createdAt, { shortMonth: true })}
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
      accessible={true}
      accessibilityLabel={`${
        overlay.metaOverlay?.issuer ? `${t('Credentials.IssuedBy')} ${overlay.metaOverlay?.issuer}` : ''
      }, ${overlay.metaOverlay?.watermark ?? ''} ${overlay.metaOverlay?.name ?? ''} ${t('Credentials.Credential')}.`}
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      <View style={[styles.flexGrow, { overflow: 'hidden' }]} testID={testIdWithKey('CredentialCard')}>
        {overlay?.brandingOverlay?.imageSource ? (
          <ImageBackground
            source={toImageSource(overlay?.brandingOverlay?.imageSource)}
            style={styles.flexGrow}
            imageStyle={{ borderRadius }}
          >
            {overlay.metaOverlay?.watermark && (
              <CardWatermark
                width={width}
                height={cardHeight}
                style={styles.watermark}
                watermark={overlay.metaOverlay?.watermark}
              />
            )}
            <CredentialCard revoked={isRevoked} />
          </ImageBackground>
        ) : (
          <>
            {overlay.metaOverlay?.watermark && (
              <CardWatermark
                width={width}
                height={cardHeight}
                style={styles.watermark}
                watermark={overlay.metaOverlay?.watermark}
              />
            )}
            <CredentialCard revoked={isRevoked} />
          </>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default CredentialCard10
