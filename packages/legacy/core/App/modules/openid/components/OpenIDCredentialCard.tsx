import React, { useMemo } from 'react'
import { CredentialDisplay, DisplayImage, W3cCredentialDisplay } from '../types'
import { useTranslation } from 'react-i18next'
import { GenericFn } from '../../../types/fn'
import {
  DeviceEventEmitter,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { testIdWithKey } from '../../../utils/testable'
import { credentialTextColor, toImageSource } from '../../../utils/credential'
import { useTheme } from '../../../contexts/theme'
import { SvgUri } from 'react-native-svg'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { getCredentialForDisplay } from '../display'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { getAttributeField } from '../utils/utils'

interface CredentialCardProps {
  credentialDisplay?: W3cCredentialDisplay
  credentialRecord?: W3cCredentialRecord | SdJwtVcRecord | MdocRecord
  onPress?: GenericFn
  style?: ViewStyle
}

const paddingVertical = 10
const paddingHorizontal = 10
const transparent = 'rgba(0,0,0,0)'
const borderRadius = 15
const borderPadding = 8

const OpenIDCredentialCard: React.FC<CredentialCardProps> = ({
  credentialDisplay,
  credentialRecord,
  style = {},
  onPress = undefined,
}) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()

  const display = useMemo((): CredentialDisplay | undefined => {
    if (credentialDisplay) return credentialDisplay.display

    if (!credentialRecord) {
      const error = new BifoldError(
        t('Error.Title1047'),
        t('Error.Message1047'),
        'Error[Logical] credentialDisplay and credentialRecord are undefined',
        1047
      )
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      return
    }
    const result = getCredentialForDisplay(credentialRecord as W3cCredentialRecord)
    return result.display
  }, [credentialDisplay, credentialRecord, t])

  const overlayAttribute = useMemo((): string | number | null | undefined => {
    if (!display?.primary_overlay_attribute || !credentialDisplay) return undefined
    return getAttributeField(credentialDisplay, display.primary_overlay_attribute)?.value
  }, [display, credentialDisplay])

  const { width } = useWindowDimensions()
  const cardHeight = width * 0.55 // a card height is half of the screen width
  const cardHeaderHeight = cardHeight / 4 // a card has a total of 4 rows, and the header occupy 1 row

  const styles = StyleSheet.create({
    container: {},
    issuerLogoContainer: {
      marginBottom: 30,
    },
    cardContainer: {
      backgroundColor: display?.backgroundColor ? display.backgroundColor : transparent,
      height: cardHeight,
      borderRadius: borderRadius,
    },
    outerHeaderContainer: {
      flexDirection: 'column',
      backgroundColor: transparent,
      height: cardHeaderHeight + borderPadding,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },
    innerHeaderContainer: {
      flexDirection: 'row',
      height: cardHeaderHeight,
      marginLeft: borderPadding,
      marginRight: borderPadding,
      marginTop: 20,
      marginBottom: borderPadding,
      backgroundColor: transparent,
    },
    innerHeaderContainerCredLogo: {
      flex: 1,
    },
    innerHeaderCredInfoContainer: {
      flex: 3,
      alignItems: 'flex-end',
      marginRight: paddingHorizontal,
    },
    bodyContainer: {
      flexGrow: 1,
    },
    footerContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal,
      paddingVertical,
      paddingLeft: paddingHorizontal + 10,
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
    credentialInfoContainer: {},
    titleFontCredentialName: {
      ...TextTheme.labelTitle,
      color: display?.textColor ?? credentialTextColor(ColorPallet, display?.backgroundColor),
      textAlignVertical: 'center',
      marginBottom: 8,
    },
    titleFontCredentialDescription: {
      ...TextTheme.label,
      color: display?.textColor ?? credentialTextColor(ColorPallet, display?.backgroundColor),
      textAlignVertical: 'center',
    },
  })

  //This should be implimented for credential log
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const logoContaineter = (logo: DisplayImage | undefined) => {
    const width = 64
    const height = 48
    const src = logo?.url
    if (!src) {
      return <View />
    }
    if (typeof src === 'string' && src.endsWith('.svg'))
      return <SvgUri role="img" width={width} height={height} uri={src} aria-label={logo.altText} />

    return (
      <Image
        source={toImageSource(src)}
        style={{
          flex: 4,
          resizeMode: 'contain',
          width: width,
          height: height,
        }}
      />
    )
  }

  const CardHeader: React.FC = () => {
    return (
      <View style={[styles.outerHeaderContainer]}>
        <View testID={testIdWithKey('CredentialCardHeader')} style={[styles.innerHeaderContainer]}>
          <View style={styles.innerHeaderContainerCredLogo}>{logoContaineter(display?.logo)}</View>
          <View style={styles.innerHeaderCredInfoContainer}>
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.titleFontCredentialName}
                testID={testIdWithKey('CredentialIssuer')}
                maxFontSizeMultiplier={1}
              >
                {display?.name}
              </Text>
            </View>
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.titleFontCredentialDescription}
                testID={testIdWithKey('CredentialName')}
                maxFontSizeMultiplier={1}
              >
                {display?.description}
              </Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  const CardBody: React.FC = () => {
    return <View style={styles.bodyContainer} testID={testIdWithKey('CredentialCardBody')}></View>
  }

  const CardFooter: React.FC = () => {
    if (!overlayAttribute) return null
    return (
      <View testID={testIdWithKey('CredentialCardFooter')} style={styles.footerContainer}>
        <Text
          style={[
            TextTheme.caption,
            {
              color: display?.textColor ?? credentialTextColor(ColorPallet, display?.backgroundColor),
            },
          ]}
          testID={testIdWithKey('CredentialIssued')}
          maxFontSizeMultiplier={1}
        >
          {overlayAttribute}
        </Text>
      </View>
    )
  }
  const CredentialCard: React.FC = () => {
    return (
      <>
        <CardHeader />
        <CardBody />
        <CardFooter />
      </>
    )
  }

  return (
    <View>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={`${display?.issuer.name ? `${t('Credentials.IssuedBy')} ${display?.issuer.name}` : ''}, ${t(
          'Credentials.Credential'
        )}.`}
        accessibilityRole="button"
        disabled={typeof onPress === 'undefined' ? true : false}
        onPress={onPress}
        style={[styles.cardContainer, style]}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <View style={[styles.flexGrow, { overflow: 'hidden' }]} testID={testIdWithKey('CredentialCard')}>
          {display?.backgroundImage ? (
            <ImageBackground
              source={toImageSource(display.backgroundImage.url)}
              style={styles.flexGrow}
              imageStyle={{ borderRadius }}
            >
              <CredentialCard />
            </ImageBackground>
          ) : (
            <CredentialCard />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default OpenIDCredentialCard
