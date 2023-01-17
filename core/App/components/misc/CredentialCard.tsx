import { CredentialExchangeRecord } from '@aries-framework/core'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CredentialStatus } from '../../types/credential-status'
import { GenericFn } from '../../types/fn'
import { CardLayoutOverlay_2_0, CardOverlayType, OCACredentialBundle } from '../../types/oca'
import { Attribute, Field } from '../../types/record'
import { luminanceForHexColor } from '../../utils/luminance'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
}

const transparent = 'rgba(0,0,0,0)'
const padding = 10
const borderRadius = 10
const flexWidth = 24

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

const toImageSource = (source: unknown): ImageSourcePropType => {
  if (typeof source === 'string') {
    return { uri: source as string }
  }
  return source as ImageSourcePropType
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {}, onPress = undefined }) => {
  const { i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundle } = useConfiguration()

  const [bundle, setBundle] = useState<OCACredentialBundle | undefined>(undefined)
  const [primaryField, setPrimaryField] = useState<Field | undefined>(undefined)
  const [secondaryField, setSecondaryField] = useState<Field | undefined>(undefined)

  const metaOverlay = bundle?.getMetaOverlay(i18n.language)
  const cardLayoutOverlay = bundle?.getCardLayoutOverlay<CardLayoutOverlay_2_0>(CardOverlayType.CARD_LAYOUT_20)
  const [isRevoked] = useState<boolean>(credential.revocationNotification !== undefined)

  const isValidIndyCredential = (credential: CredentialExchangeRecord) => {
    return credential && credential.credentials.find((c) => c.credentialRecordType === 'indy')
  }

  const credentialTextColor = (hex?: string) => {
    const midpoint = 255 / 2
    if ((luminanceForHexColor(hex ?? '') ?? 0) >= midpoint) {
      return ColorPallet.grayscale.darkGrey
    }
    return ColorPallet.grayscale.white
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: cardLayoutOverlay?.primaryBackgroundColor,
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
      backgroundColor: transparent,
      borderTopRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      padding,
      margin: -0.5 * padding,
    },
    logoContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      left: 0.5 * flexWidth + padding,
      top: 0.5 * flexWidth + padding,
      padding,
    },
    flexContainer: {
      width: flexWidth,
      height: flexWidth,
    },
    textContainer: {
      paddingVertical: 0.5 * flexWidth + padding,
      paddingHorizontal: 2 * padding,
      paddingLeft: 4 * padding,
      color: credentialTextColor(cardLayoutOverlay?.primaryBackgroundColor),
    },
  })

  useEffect(() => {
    if (!isValidIndyCredential(credential)) {
      return
    }

    const resolveBundle = async () => {
      const bundle = await OCABundle.resolve(credential)
      if (bundle) {
        setBundle(bundle)
      } else {
        const defaultBundle = await OCABundle.resolveDefaultBundle(credential)
        setBundle(defaultBundle)
      }
    }

    const resolvePresentationFields = async () => {
      const fields = await OCABundle.getCredentialPresentationFields(credential, i18n.language)
      setPrimaryField(fields.find((field) => field.name === cardLayoutOverlay?.primaryAttribute?.name) || undefined)
      setSecondaryField(fields.find((field) => field.name === cardLayoutOverlay?.secondaryAttribute?.name) || undefined)
    }

    Promise.all([resolveBundle(), resolvePresentationFields()]).then()
  }, [credential])

  const renderCredentialCardLogo = () => {
    return (
      <View style={styles.logoContainer}>
        <View style={styles.flexContainer}>
          {cardLayoutOverlay?.logo?.src ? (
            <Image
              source={toImageSource(cardLayoutOverlay?.logo.src)}
              style={{
                resizeMode: 'contain',
                maxHeight: flexWidth + padding,
                alignSelf: 'center',
                top: -0.5 * padding,
              }}
            />
          ) : (
            <Text
              style={[
                TextTheme.normal,
                {
                  fontSize: flexWidth,
                  fontWeight: 'bold',
                  alignSelf: 'center',
                  top: -0.5 * padding,
                  margin: -1,
                },
              ]}
            >
              {(metaOverlay?.issuerName || metaOverlay?.name || 'C')?.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>
    )
  }

  const renderCredentialCardPrimaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <Text
          testID={testIdWithKey('CredentialIssuer')}
          style={[
            TextTheme.labelSubtitle,
            styles.textContainer,
            {
              paddingBottom: 0.25 * padding,
            },
          ]}
        >
          {metaOverlay?.issuerName}
        </Text>
        <Text
          testID={testIdWithKey('CredentialName')}
          style={[
            TextTheme.labelTitle,
            styles.textContainer,
            {
              paddingTop: 0.25 * padding,
            },
          ]}
          maxFontSizeMultiplier={1}
        >
          {metaOverlay?.name}
        </Text>
        {primaryField && (
          <>
            <Text
              style={[
                TextTheme.labelText,
                styles.textContainer,
                {
                  fontStyle: 'normal',
                  paddingVertical: 0,
                },
              ]}
            >
              {primaryField.label ?? startCase(primaryField.name || '')}
            </Text>
            <Text
              style={[
                styles.textContainer,
                {
                  paddingTop: 0,
                },
              ]}
            >
              {(primaryField as Attribute).value}
            </Text>
          </>
        )}
        {secondaryField && (
          <>
            <Text
              style={[
                TextTheme.labelText,
                styles.textContainer,
                {
                  fontStyle: 'normal',
                  paddingVertical: 0,
                },
              ]}
            >
              {secondaryField.label ?? startCase(secondaryField.name || '')}
            </Text>
            <Text
              style={[
                styles.textContainer,
                {
                  paddingTop: 0,
                },
              ]}
            >
              {(secondaryField as Attribute).value}
            </Text>
          </>
        )}
      </View>
    )
  }

  const renderCredentialCardSecondaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardSecondaryBody')} style={styles.secondaryBodyContainer}>
        {cardLayoutOverlay?.backgroundImageSlice?.src ? (
          <ImageBackground
            source={toImageSource(cardLayoutOverlay?.backgroundImageSlice.src)}
            style={{ flexGrow: 1 }}
            imageStyle={{
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
            }}
          >
            {renderCredentialCardLogo()}
          </ImageBackground>
        ) : (
          renderCredentialCardLogo()
        )}
      </View>
    )
  }

  const renderCredentialCardStatus = (status?: CredentialStatus) => {
    const renderStatus = (status?: CredentialStatus) => {
      switch (status) {
        case CredentialStatus.REVOKED:
          return (
            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor: ColorPallet.notification.error,
                },
              ]}
            >
              <Icon size={24} style={{ color: ColorPallet.semantic.error }} name="error" />
            </View>
          )
        default:
          return (
            <View style={[styles.statusContainer]}>
              <View style={styles.flexContainer}></View>
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
      {bundle && renderCredentialCard(isRevoked ? CredentialStatus.REVOKED : undefined)}
    </TouchableOpacity>
  )
}

export default CredentialCard
