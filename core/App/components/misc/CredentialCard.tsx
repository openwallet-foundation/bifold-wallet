import { CredentialExchangeRecord } from '@aries-framework/core'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ImageBackground, LayoutRectangle, StyleSheet, Text, View, ViewStyle, Image } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { dateFormatOptions } from '../../constants'
import { useConfiguration } from '../../contexts/configuration'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { getCurrentLanguage } from '../../localization'
import { GenericFn } from '../../types/fn'
import { OCACredentialBundle } from '../../types/oca'
import { getCredentialConnectionLabel, hashCode, hashToRGBA, parsedCredDefName } from '../../utils/helpers'
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
const { width } = Dimensions.get('window')

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {}, onPress = undefined }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundle } = useConfiguration()

  const [state] = useStore()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [headerDimensions, setHeaderDimensions] = useState<LayoutRectangle | null>(null)
  const [headerLogoDimensions, setHeaderLogoDimensions] = useState<LayoutRectangle | null>(null)

  const { revoked } = state.credential
  const [bundle, setBundle] = useState<OCACredentialBundle | undefined>(undefined)

  const overlay = bundle?.getCardLayoutOverlay()
  const metaLayer = bundle?.getMetaOverlay(getCurrentLanguage())
  const credentialLabel = metaLayer?.name ?? parsedCredDefName(credential)
  const credentialBackgroundColor = hashToRGBA(hashCode(credentialLabel))
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

  const credentialTextColor = (hex?: string) => {
    const midpoint = 255 / 2
    if ((luminanceForHexColour(hex ?? '') ?? 0) >= midpoint) {
      return ColorPallet.grayscale.darkGrey
    }
    return ColorPallet.grayscale.white
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: bundle
        ? overlay?.imageSource
          ? transparent
          : overlay?.backgroundColor ?? credentialBackgroundColor
        : transparent,
      height: width / 2,
      borderRadius: borderRadius,
    },
    headerContainer: {
      flexDirection: 'row',
      backgroundColor: bundle ? overlay?.header?.backgroundColor || transparent : transparent,
      height: width / 7.5,
      paddingHorizontal,
      paddingVertical,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
    },
    bodyContainer: {
      flexGrow: 1,
    },
    footerContainer: {
      flexDirection: 'row',
      backgroundColor: bundle ? overlay?.footer?.backgroundColor || transparent : transparent,
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
    logo: {
      width: 286, //286
      height: 208, //208
    },
  })

  useEffect(() => {
    OCABundle.resolve(credential).then((_bundle) => {
      if (_bundle !== undefined) {
        setBundle(_bundle)
      }
    })
  }, [])

  useEffect(() => {
    if (!credential) {
      return
    }
    const indyCredentialFormat = credential.credentials.find((c) => c.credentialRecordType === 'indy')
    if (!indyCredentialFormat) {
      return
    }
    const isRevoked = revoked.has(indyCredentialFormat.credentialRecordId)
    setIsRevoked(isRevoked)
  }, [credential])

  const renderCredentialCardHeader = () => {
    const calculatePercentageWidthWithLogo = (
      headerDimensions: LayoutRectangle,
      headerLogoDimensions: LayoutRectangle,
      halved = true
    ) => {
      const { width: header } = headerDimensions
      const { width: headerLogo } = headerLogoDimensions
      const remainingHeader = header - headerLogo
      return `${((halved ? 50 : 100) * (remainingHeader - 0.5 * paddingHorizontal)) / header}%`
    }

    const scaleCredentialName = (hideIssuer = false): string | number | undefined => {
      return hideIssuer ? '100%' : '50%'
    }

    const scaleCredentialNameByLogo = (
      headerDimensions: LayoutRectangle,
      headerLogoDimensions: LayoutRectangle,
      hideIssuer = false
    ): string | number | undefined => {
      return calculatePercentageWidthWithLogo(headerDimensions, headerLogoDimensions, !hideIssuer)
    }

    return (
      <View
        testID={testIdWithKey('CredentialCardHeader')}
        style={[styles.headerContainer]}
        onLayout={({ nativeEvent: { layout } }) => setHeaderDimensions(layout)}
      >
        {headerDimensions && overlay?.header?.imageSource && (
          <Image
            style={styles.logo}
            source={{ uri: overlay?.header?.imageSource as string }}
            height={headerDimensions.height - paddingVertical}
            width={headerDimensions.width / 3 - paddingHorizontal}
            onLayout={({ nativeEvent: { layout } }) => setHeaderLogoDimensions(layout)}
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
                  credentialTextColor(overlay?.header?.backgroundColor ?? credentialBackgroundColor),
                width:
                  headerDimensions && overlay?.header?.imageSource && headerLogoDimensions
                    ? calculatePercentageWidthWithLogo(headerDimensions, headerLogoDimensions)
                    : '50%',
                paddingHorizontal: 0.5 * paddingHorizontal,
              },
            ]}
            testID={testIdWithKey('CredentialIssuer')}
            maxFontSizeMultiplier={1}
          >
            {credentialConnectionLabel}
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
                credentialTextColor(overlay?.header?.backgroundColor ?? credentialBackgroundColor),
              width:
                overlay?.header?.imageSource && headerDimensions && headerLogoDimensions
                  ? scaleCredentialNameByLogo(headerDimensions, headerLogoDimensions, overlay?.header?.hideIssuer)
                  : scaleCredentialName(overlay?.header?.hideIssuer),
              textAlign: 'right',
              paddingHorizontal: 0.5 * paddingHorizontal,
            },
          ]}
          testID={testIdWithKey('CredentialName')}
          maxFontSizeMultiplier={1}
        >
          {credentialLabel}
        </Text>
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
                color:
                  overlay?.footer?.color ??
                  credentialTextColor(overlay?.footer?.backgroundColor ?? credentialBackgroundColor),
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
      <View style={styles.flexGrow} testID={testIdWithKey('CredentialCard')}>
        {bundle !== null && overlay?.imageSource ? (
          <ImageBackground
            source={{ uri: overlay?.imageSource as string }}
            style={styles.flexGrow}
            imageStyle={{ borderRadius }}
          >
            {renderCredentialCard(isRevoked)}
          </ImageBackground>
        ) : null}
        {bundle !== null && !overlay?.imageSource ? renderCredentialCard(isRevoked) : null}
      </View>
    </TouchableOpacity>
  )
}

export default CredentialCard
