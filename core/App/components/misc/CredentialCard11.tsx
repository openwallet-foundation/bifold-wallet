import { CredentialExchangeRecord } from '@aries-framework/core'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Image, ImageBackground, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CredentialStatus } from '../../types/credential-status'
import { GenericFn } from '../../types/fn'
import { CardLayoutOverlay11, CredentialOverlay, OCABundle } from '../../types/oca'
import { Attribute, Field, Predicate } from '../../types/record'
import { credentialTextColor, toImageSource } from '../../utils/credential'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCard11Props {
  credential?: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
  proofItems?: (Attribute | Predicate)[]
  error?: boolean
  elevated?: boolean
  credName?: string
  credDefId?: string
  schemaId?: string
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

const CredentialCard11: React.FC<CredentialCard11Props> = ({
  credential,
  style = {},
  proofItems,
  onPress = undefined,
  error = false,
  elevated = false,
  credName,
  credDefId,
  schemaId,
}) => {
  const { i18n, t } = useTranslation()
  const { ColorPallet, TextTheme, ListItems } = useTheme()
  const { OCABundleResolver } = useConfiguration()

  const [isRevoked, setIsRevoked] = useState<boolean>(credential?.revocationNotification !== undefined)

  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay11>>({})

  const primaryField = overlay?.presentationFields?.find(
    (field) => field.name === overlay?.cardLayoutOverlay?.primaryAttribute?.name
  )
  const secondaryField = overlay?.presentationFields?.find(
    (field) => field.name === overlay?.cardLayoutOverlay?.secondaryAttribute?.name
  )

  const secondaryBackgroundColor = proofItems?.length
    ? overlay.cardLayoutOverlay?.primaryBackgroundColor
    : overlay.cardLayoutOverlay?.secondaryBackgroundColor

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
        (overlay.cardLayoutOverlay?.backgroundImageSlice?.src ? 'rgba(0, 0, 0, 0)' : secondaryBackgroundColor) ??
        'rgba(0, 0, 0, 0.24)',
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
    headerText: {
      ...TextTheme.labelSubtitle,
      ...ListItems.recordAttributeText,
      fontSize: 15,
      flexShrink: 1,
    },
    valueText: {
      ...TextTheme.normal,
      minHeight: ListItems.recordAttributeText.fontSize,
      paddingVertical: 4,
    },
    textContainer: {
      color: proofItems?.length
        ? TextTheme.normal.color
        : credentialTextColor(ColorPallet, overlay.cardLayoutOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
    errorText: {
      ...TextTheme.normal,
      color: ListItems.proofError.color,
    },
    errorIcon: {
      color: ListItems.proofError.color,
    },
  })

  useEffect(() => {
    const resolveBundle = async () => {
      let bundle: OCABundle | undefined
      let defaultBundle: OCABundle | undefined
      if (credential) {
        bundle = await OCABundleResolver.resolve(credential, i18n.language)
        defaultBundle = await OCABundleResolver.resolveDefaultBundle(credential, i18n.language)
      } else {
        bundle = await OCABundleResolver.resolveByCredDefOrSchema(credDefId, schemaId, i18n.language)
        defaultBundle = await OCABundleResolver.resolveDefaultBundleByCredDefOrSchema(
          credDefId,
          schemaId,
          credName,
          i18n.language
        )
      }
      return { bundle, defaultBundle }
    }

    const resolvePresentationFields = async () => {
      let fields: Field[] = []
      if (credential) {
        fields = await OCABundleResolver.presentationFields(credential, i18n.language)
      }
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
    setIsRevoked(credential?.revocationNotification !== undefined)
  }, [credential?.revocationNotification])

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={[styles.logoContainer, { elevation: elevated ? 5 : 0 }]}>
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
            {!error ? (
              (overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuerName ?? 'C')?.charAt(0).toUpperCase()
            ) : (
              <Icon name={'warning'} size={30} style={styles.errorIcon} />
            )}
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

  const renderCardAttribute = (item: Attribute & Predicate) => {
    return (
      <View style={{ marginTop: 15 }}>
        {!(item?.value || item?.pValue) || item?.revoked ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              style={{ paddingTop: 2, paddingHorizontal: 2 }}
              name="close"
              color={ListItems.proofError.color}
              size={ListItems.recordAttributeText.fontSize}
            />

            <Text
              style={[
                TextTheme.label,
                styles.headerText,
                {
                  lineHeight: 19,
                  opacity: 0.8,
                },
              ]}
              testID={testIdWithKey('RevokedOrNotAvailable')}
              numberOfLines={1}
            >
              {item.label ?? startCase(item.name ?? '')}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              TextTheme.label,
              styles.headerText,
              {
                lineHeight: 19,
                opacity: 0.8,
              },
            ]}
            testID={testIdWithKey('AttributeLabel')}
            numberOfLines={1}
          >
            {item.label ?? startCase(item.name ?? '')}
          </Text>
        )}
        {!(item?.value || item?.pValue) || item?.revoked ? null : (
          <Text
            style={[
              TextTheme.normal,
              styles.valueText,
              {
                fontWeight: 'bold',
                lineHeight: 24,
              },
            ]}
            testID={testIdWithKey('AttributeValue')}
          >
            {item?.value || `${item?.pType} ${item?.pValue}`}
          </Text>
        )}
      </View>
    )
  }

  const CredentialCardPrimaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <View style={{ flexDirection: 'row' }}>
          <CredentialCardLogo />
          <View style={{ marginLeft: -1 * padding, margin: -1 }}>
            <View>
              {overlay.metaOverlay?.issuerName !== '' && (
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
              )}
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
            {error && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon style={[styles.errorIcon]} name="close" size={30} />

                <Text style={[styles.errorText]} testID={testIdWithKey('RevokedOrNotAvailable')} numberOfLines={1}>
                  {t('ProofRequest.NotAvailableInYourWallet')}
                </Text>
              </View>
            )}
            <FlatList
              data={proofItems}
              scrollEnabled={false}
              renderItem={({ item }) => {
                return renderCardAttribute(item as Attribute & Predicate)
              }}
            />
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
      <View
        testID={testIdWithKey('CredentialCardSecondaryBody')}
        style={[
          styles.secondaryBodyContainer,
          {
            backgroundColor: !error ? styles.secondaryBodyContainer.backgroundColor : ColorPallet.notification.error,
          },
        ]}
      >
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
    <View style={[styles.container, style, { elevation: elevated ? 5 : 0 }]}>
      <TouchableOpacity
        disabled={typeof onPress === 'undefined' ? true : false}
        onPress={onPress}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <CredentialCard status={isRevoked ? CredentialStatus.REVOKED : undefined} />
      </TouchableOpacity>
    </View>
  ) : null
}

export default CredentialCard11
