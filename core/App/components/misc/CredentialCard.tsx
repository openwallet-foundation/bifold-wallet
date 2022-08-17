import { CredentialExchangeRecord } from '@aries-framework/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, ImageBackground, LayoutRectangle, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
// import Icon from 'react-native-vector-icons/MaterialIcons'
import Image from 'react-native-scalable-image'

import { Overlay } from '../../assets/img/credential-branding/credential-branding'
import { dateFormatOptions } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { getCredentialConnectionLabel, hashCode, hashToRGBA, parsedCredDefName } from '../../utils/helpers'
import { luminanceForHexColour } from '../../utils/luminance'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  overlay?: Overlay
  revoked?: boolean
  onPress?: GenericFn
  style?: ViewStyle
}

const paddingVertical = 10
const paddingHorizontal = 10
const transparent = 'rgba(0,0,0,0)'
const borderRadius = 15
const { width } = Dimensions.get('window')

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  revoked = false,
  style = {},
  onPress = undefined,
  overlay = undefined,
}) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()

  const credentialLabel = parsedCredDefName(credential)
  const credentialBackgroundColor = hashToRGBA(hashCode(credentialLabel))
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

  const [headerDimensions, setHeaderDimensions] = useState<LayoutRectangle | null>(null)
  const [headerLogoDimensions, setHeaderLogoDimensions] = useState<LayoutRectangle | null>(null)

  const credentialTextColor = (hex?: string) => {
    const midpoint = 255 / 2
    if ((luminanceForHexColour(hex ?? '') ?? 0) >= midpoint) {
      return ColorPallet.grayscale.darkGrey
    }
    return ColorPallet.grayscale.white
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay?.imageSource ? transparent : overlay?.backgroundColor ?? credentialBackgroundColor,
      height: width / 2,
      borderRadius: borderRadius,
    },
    headerContainer: {
      flexDirection: 'row',
      backgroundColor: overlay?.header?.backgroundColor || transparent,
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
      backgroundColor: overlay?.footer?.backgroundColor || transparent,
      paddingHorizontal,
      paddingVertical,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
    },
  })

  const renderCredentialCardHeader = () => {
    const calculatePercentageWidthWithLogo = (
      headerDimensions: LayoutRectangle,
      headerLogoDimensions: LayoutRectangle,
      halved = true
    ) => {
      return `${
        (100 * (headerDimensions.width - headerLogoDimensions.width - 8)) / headerDimensions.width / (halved ? 2 : 1)
      }%`
    }

    return (
      <View
        testID={testIdWithKey('CredentialCardHeader')}
        style={[styles.headerContainer]}
        onLayout={({ nativeEvent: { layout } }) => setHeaderDimensions(layout)}
      >
        {headerDimensions && overlay?.header?.imageSource && (
          <Image
            source={overlay?.header?.imageSource}
            height={headerDimensions.height - paddingVertical}
            width={headerDimensions.width / 3 - paddingHorizontal}
            onLayout={({ nativeEvent: { layout } }) => setHeaderLogoDimensions(layout)}
          />
        )}
        {overlay?.header?.hideIssuer ? null : (
          <Text
            numberOfLines={2}
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
          numberOfLines={2}
          style={[
            TextTheme.label,
            {
              color:
                overlay?.header?.color ??
                credentialTextColor(overlay?.header?.backgroundColor ?? credentialBackgroundColor),
              width:
                headerDimensions && overlay?.header?.imageSource && headerLogoDimensions
                  ? overlay?.header?.hideIssuer
                    ? calculatePercentageWidthWithLogo(headerDimensions, headerLogoDimensions, false)
                    : calculatePercentageWidthWithLogo(headerDimensions, headerLogoDimensions)
                  : overlay?.header?.hideIssuer
                  ? '100%'
                  : '50%',
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
    return <View style={styles.bodyContainer}></View>
  }

  const renderCredentialCardFooter = (revoked = false) => {
    return (
      <View testID={testIdWithKey('CredentialCardFooter')} style={styles.footerContainer}>
        {revoked ? null : (
          // TODO: Fix revocation styling
          // <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          //   <Icon
          //     style={{ marginRight: 5 }}
          //     name="cancel"
          //     color={ColorPallet.semantic.error}
          //     size={ListItems.credentialTitle.fontSize}
          //   ></Icon>
          //   <Text
          //     style={[ListItems.credentialDetails, { color: ColorPallet.semantic.error, fontWeight: 'bold' }]}
          //     testID={testIdWithKey('CredentialRevoked')}
          //   >
          //     Revoked
          //   </Text>
          // </View>
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
      {overlay?.imageSource ? (
        <ImageBackground source={overlay?.imageSource} style={{ flexGrow: 1 }} imageStyle={{ borderRadius }}>
          {renderCredentialCard(revoked)}
        </ImageBackground>
      ) : (
        renderCredentialCard(revoked)
      )}
    </TouchableOpacity>
  )
}

export default CredentialCard
