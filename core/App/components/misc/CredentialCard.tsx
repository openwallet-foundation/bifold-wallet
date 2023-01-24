import { CredentialExchangeRecord } from '@aries-framework/core'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ImageBackground, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CredentialStatus } from '../../types/credential-status'
import { GenericFn } from '../../types/fn'
import { CardLayoutOverlay, CardOverlayType, MetaOverlay, OCACredentialBundle } from '../../types/oca'
import { Attribute, Field } from '../../types/record'
import { credentialTextColor, isValidIndyCredential, toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
}

const borderRadius = 10
const padding = 16
const logoHeight = 40

/*
  A card is defined as a nx8 (height/rows x width/columns) grid.
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
  | 2 |   |   |   |   |   |   |   |
  | 3 |   |   |   |   |   |   |   |
  | 4 |   |   |   |   |   |   |   |
  ...
 
  The card width is the full screen width.

  Secondary Body (1): 
  Primary Body   (2): Small Logo (1x1) -> L (shifted left by 50%)
                      Issuer Name (1x6)
                      Credential Name (1x6)
                      Primary Attribute 1 (1x6)
                      Primary Attribute 2 (1x6)
  Status         (3): Icon (1x1) -> S

   (1)            (2)           (3)
  | L | Issuer Name            | S |
  |   | Credential Name        |   |
  |   |                        |   |
  |   | Primary Attribute 1    |   |
  |   | Primary Attribute 2    |   |
  ...

  Note: The small logo MUST be provided as 1x1 (height/width) ratio.
 */

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {}, onPress = undefined }) => {
  const { i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundle } = useConfiguration()

  const [isRevoked, setIsRevoked] = useState<boolean>(credential.revocationNotification !== undefined)

  const [overlay, setOverlay] = useState<{
    bundle: OCACredentialBundle | undefined
    primaryField: Field | undefined
    secondaryField: Field | undefined
    metaOverlay: MetaOverlay | undefined
    cardLayoutOverlay: CardLayoutOverlay | undefined
  }>({
    bundle: undefined,
    primaryField: undefined,
    secondaryField: undefined,
    metaOverlay: undefined,
    cardLayoutOverlay: undefined,
  })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.cardLayoutOverlay?.primaryBackgroundColor,
      borderRadius: borderRadius,
    },
    cardContainer: {
      flexGrow: 1,
      flexDirection: 'row',
    },
    secondaryBodyContainer: {
      width: logoHeight,
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      backgroundColor:
        (overlay.cardLayoutOverlay?.backgroundImageSlice?.src
          ? 'rgba(0, 0, 0, 0)'
          : overlay.cardLayoutOverlay?.secondaryBackgroundColor) || 'rgba(0, 0, 0, 0.24)',
    },
    primaryBodyContainer: {
      flex: 6,
      padding,
    },
    statusContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderTopRightRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      height: logoHeight,
      width: logoHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoContainer: {
      top: 1,
      left: -1 * (0.5 * logoHeight + padding),
      height: logoHeight,
      width: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      color: credentialTextColor(ColorPallet, overlay.cardLayoutOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
  })

  useEffect(() => {
    if (!(credential && isValidIndyCredential(credential))) {
      return
    }

    const resolveBundle = async () => {
      const bundle = await OCABundle.resolve(credential)
      const defaultBundle = await OCABundle.resolveDefaultBundle(credential)
      return { bundle, defaultBundle }
    }

    const resolvePresentationFields = async () => {
      const fields = await OCABundle.getCredentialPresentationFields(credential, i18n.language)
      return { fields }
    }

    Promise.all([resolveBundle(), resolvePresentationFields()]).then(([{ bundle, defaultBundle }, { fields }]) => {
      const overlayBundle = bundle || defaultBundle
      const metaOverlay = overlayBundle?.getMetaOverlay(i18n.language)
      const cardLayoutOverlay = overlayBundle?.getCardLayoutOverlay<CardLayoutOverlay>(CardOverlayType.CARD_LAYOUT_10)

      setOverlay({
        ...overlay,
        bundle: overlayBundle,
        primaryField: fields.find((field) => field.name === cardLayoutOverlay?.primaryAttribute?.name) || undefined,
        secondaryField: fields.find((field) => field.name === cardLayoutOverlay?.secondaryAttribute?.name) || undefined,
        metaOverlay,
        cardLayoutOverlay,
      })
    })
  }, [credential])

  useEffect(() => {
    setIsRevoked(credential.revocationNotification !== undefined)
  }, [credential.revocationNotification])

  const renderCredentialCardLogo = () => {
    return (
      <View style={styles.logoContainer}>
        {overlay.cardLayoutOverlay?.logo?.src ? (
          <Image
            source={toImageSource(overlay.cardLayoutOverlay?.logo.src)}
            style={{
              maxHeight: logoHeight,
              resizeMode: 'center',
            }}
          />
        ) : (
          <Text
            style={[
              TextTheme.normal,
              {
                fontSize: 0.5 * logoHeight,
                fontWeight: 'bold',
                alignSelf: 'center',
              },
            ]}
          >
            {(overlay.metaOverlay?.issuerName || overlay.metaOverlay?.name || 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const renderAttributeLabel = (label: string) => {
    return (
      <Text
        style={[
          TextTheme.labelSubtitle,
          styles.textContainer,
          {
            lineHeight: 19,
            opacity: 0.8,
            marginLeft: 24,
          },
        ]}
      >
        {label}
      </Text>
    )
  }

  const renderAttributeValue = (value: string | number | null) => {
    return (
      <Text
        style={[
          TextTheme.normal,
          styles.textContainer,
          {
            lineHeight: 24,
            fontWeight: 'bold',
            marginLeft: 24,
          },
        ]}
      >
        {value}
      </Text>
    )
  }

  const renderCredentialCardPrimaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <View style={{ flexDirection: 'row' }}>
          {renderCredentialCardLogo()}
          <View style={{ marginLeft: -1 * padding, margin: -1 }}>
            <Text
              testID={testIdWithKey('CredentialIssuer')}
              style={[
                TextTheme.label,
                styles.textContainer,
                {
                  lineHeight: 19,
                  opacity: 0.8,
                },
              ]}
              numberOfLines={1}
            >
              {overlay.metaOverlay?.issuerName}
            </Text>
            <Text
              testID={testIdWithKey('CredentialName')}
              style={[
                TextTheme.normal,
                styles.textContainer,
                {
                  lineHeight: 24,
                },
              ]}
              numberOfLines={1}
            >
              {overlay.metaOverlay?.name}
            </Text>
          </View>
        </View>
        {overlay.primaryField && (
          <View style={{ paddingTop: padding }}>
            {renderAttributeLabel(overlay.primaryField.label ?? startCase(overlay.primaryField.name || ''))}
            {renderAttributeValue((overlay.primaryField as Attribute).value)}
          </View>
        )}
        {overlay.secondaryField && (
          <View style={{ paddingTop: padding }}>
            {renderAttributeLabel(overlay.secondaryField.label ?? startCase(overlay.secondaryField.name || ''))}
            {renderAttributeValue((overlay.secondaryField as Attribute).value)}
          </View>
        )}
      </View>
    )
  }

  const renderCredentialCardSecondaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardSecondaryBody')} style={styles.secondaryBodyContainer}>
        {overlay.cardLayoutOverlay?.backgroundImageSlice?.src ? (
          <ImageBackground
            source={toImageSource(overlay.cardLayoutOverlay?.backgroundImageSlice.src)}
            style={{ flexGrow: 1 }}
            imageStyle={{
              resizeMode: 'cover',
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
            }}
          >
            {null}
          </ImageBackground>
        ) : null}
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
          return <View style={[styles.statusContainer]} />
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

  return overlay.bundle ? (
    <TouchableOpacity
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      {renderCredentialCard(isRevoked ? CredentialStatus.REVOKED : undefined)}
    </TouchableOpacity>
  ) : null
}

export default CredentialCard
