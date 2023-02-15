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
import { CardLayoutOverlay11, CredentialOverlay } from '../../types/oca'
import { Attribute } from '../../types/record'
import { credentialTextColor, isValidIndyCredential, toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCard11Props {
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

const CredentialCard11: React.FC<CredentialCard11Props> = ({ credential, style = {}, onPress = undefined }) => {
  const { i18n } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const { OCABundleResolver } = useConfiguration()

  const [isRevoked, setIsRevoked] = useState<boolean>(credential.revocationNotification !== undefined)

  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay11>>({})

  const primaryField = overlay?.presentationFields?.find(
    (field) => field.name === overlay?.cardLayoutOverlay?.primaryAttribute?.name
  )
  const secondaryField = overlay?.presentationFields?.find(
    (field) => field.name === overlay?.cardLayoutOverlay?.secondaryAttribute?.name
  )

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
          : overlay.cardLayoutOverlay?.secondaryBackgroundColor) ?? 'rgba(0, 0, 0, 0.24)',
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
      const bundle = await OCABundleResolver.resolve(credential, i18n.language)
      const defaultBundle = await OCABundleResolver.resolveDefaultBundle(credential, i18n.language)
      return { bundle, defaultBundle }
    }

    const resolvePresentationFields = async () => {
      const fields = await OCABundleResolver.presentationFields(credential, i18n.language)
      return { fields }
    }

    Promise.all([resolveBundle(), resolvePresentationFields()]).then(([{ bundle, defaultBundle }, { fields }]) => {
      const overlayBundle = bundle ?? defaultBundle
      const metaOverlay = overlayBundle?.metaOverlay
      const cardLayoutOverlay = overlayBundle?.cardLayoutOverlay as CardLayoutOverlay11

      setOverlay({
        ...overlay,
        bundle: overlayBundle,
        presentationFields: fields,
        metaOverlay,
        cardLayoutOverlay,
      })
    })
  }, [credential])

  useEffect(() => {
    setIsRevoked(credential.revocationNotification !== undefined)
  }, [credential.revocationNotification])

  const CredentialCardLogo: React.FC = () => {
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
            {(overlay.metaOverlay?.issuerName ?? overlay.metaOverlay?.name ?? 'C')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const AttributeLabel: React.FC<{ label: string }> = ({ label }) => {
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

  const AttributeValue: React.FC<{ value: string | number | null }> = ({ value }) => {
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

  const CredentialCardPrimaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <View style={{ flexDirection: 'row' }}>
          <CredentialCardLogo />
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
        {primaryField && (
          <View style={{ paddingTop: padding }}>
            <AttributeLabel label={primaryField.label ?? startCase(primaryField.name ?? '')} />
            <AttributeValue value={(primaryField as Attribute).value} />
          </View>
        )}
        {secondaryField && (
          <View style={{ paddingTop: padding }}>
            <AttributeLabel label={secondaryField.label ?? startCase(secondaryField.name ?? '')} />
            <AttributeValue value={(secondaryField as Attribute).value} />
          </View>
        )}
      </View>
    )
  }

  const CredentialCardSecondaryBody: React.FC = () => {
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

  const CredentialCardStatus: React.FC<{ status?: CredentialStatus }> = ({ status }) => {
    const Status: React.FC<{ status?: CredentialStatus }> = ({ status }) => {
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
        <Status status={status} />
      </View>
    )
  }

  const CredentialCard: React.FC<{ status?: CredentialStatus }> = ({ status }) => {
    return (
      <View style={styles.cardContainer}>
        <CredentialCardSecondaryBody />
        <CredentialCardPrimaryBody />
        <CredentialCardStatus status={status} />
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
      <CredentialCard status={isRevoked ? CredentialStatus.REVOKED : undefined} />
    </TouchableOpacity>
  ) : null
}

export default CredentialCard11
