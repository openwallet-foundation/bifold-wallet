import { CredentialExchangeRecord } from '@aries-framework/core'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { Attribute, CredentialOverlay, Predicate } from '@hyperledger/aries-oca/build/legacy'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions, FlatList, Image, ImageBackground, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { CredentialStatus } from '../../types/credential-status'
import { GenericFn } from '../../types/fn'
import { credentialTextColor, getCredentialIdentifiers, toImageSource } from '../../utils/credential'
import { getCredentialConnectionLabel, isDataUrl } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

import CardWatermark from './CardWatermark'

interface CredentialCard11Props {
  credential?: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
  displayItems?: (Attribute | Predicate)[]
  revoked?: boolean
  error?: boolean
  elevated?: boolean
  credName?: string
  credDefId?: string
  schemaId?: string
  proof?: boolean
}

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
  displayItems,
  onPress = undefined,
  error = false,
  elevated = false,
  credName,
  credDefId,
  schemaId,
  proof,
}) => {
  const { width } = useWindowDimensions()
  const borderRadius = 10
  const padding = width * 0.05
  const logoHeight = width * 0.12
  const { i18n, t } = useTranslation()
  const { ColorPallet, TextTheme, ListItems } = useTheme()
  const { OCABundleResolver } = useConfiguration()
  const [isRevoked, setIsRevoked] = useState<boolean>(credential?.revocationNotification !== undefined)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)
  const [isProofRevoked, setIsProofRevoked] = useState<boolean>(
    credential?.revocationNotification !== undefined && !!proof
  )

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({})

  const primaryField = overlay?.presentationFields?.find(
    (field) => field.name === overlay?.brandingOverlay?.primaryAttribute
  )
  const secondaryField = overlay?.presentationFields?.find(
    (field) => field.name === overlay?.brandingOverlay?.secondaryAttribute
  )

  const cardData = [...(displayItems ?? []), primaryField, secondaryField]

  const getSecondaryBackgroundColor = () => {
    if (proof) {
      return overlay.brandingOverlay?.primaryBackgroundColor
    } else {
      return overlay.brandingOverlay?.backgroundImageSlice
        ? 'rgba(0, 0, 0, 0)'
        : overlay.brandingOverlay?.secondaryBackgroundColor
    }
  }

  const [dimensions, setDimensions] = useState({ cardWidth: 0, cardHeight: 0 })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      borderRadius: borderRadius,
    },
    cardContainer: {
      flexDirection: 'row',
      minHeight: 0.33 * width,
    },
    secondaryBodyContainer: {
      width: logoHeight,
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
      backgroundColor: getSecondaryBackgroundColor() ?? overlay.brandingOverlay?.primaryBackgroundColor,
    },
    primaryBodyContainer: {
      flexGrow: 1,
      padding,
    },
    imageAttr: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: 10,
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
      top: padding,
      left: -1 * logoHeight + padding,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowOpacity: 0.3,
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
      color: proof
        ? TextTheme.normal.color
        : credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
      flexShrink: 1,
    },
    errorText: {
      ...TextTheme.normal,
      color: ListItems.proofError.color,
    },
    errorIcon: {
      color: ListItems.proofError.color,
    },
    watermark: {
      opacity: 0.16,
      fontSize: 22,
      transform: [{ rotate: '-30deg' }],
    },
  })

  useEffect(() => {
    const params = {
      identifiers: credential ? getCredentialIdentifiers(credential) : { schemaId, credentialDefinitionId: credDefId },
      attributes: proof ? [] : credential?.credentialAttributes,
      meta: {
        credName: credName,
        credConnectionId: credential?.connectionId,
        alias: credentialConnectionLabel,
      },
      language: i18n.language,
    }
    OCABundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay({
        ...overlay,
        ...bundle,
        brandingOverlay: bundle.brandingOverlay as BrandingOverlay,
      })
    })
  }, [credential, i18n.language])

  useEffect(() => {
    setIsRevoked(credential?.revocationNotification !== undefined && !proof)
    setIsProofRevoked(credential?.revocationNotification !== undefined && !!proof)
  }, [credential?.revocationNotification])

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={[styles.logoContainer, { elevation: elevated ? 5 : 0 }]}>
        {overlay.brandingOverlay?.logo ? (
          <Image
            source={toImageSource(overlay.brandingOverlay?.logo)}
            style={{
              resizeMode: 'cover',
              width: logoHeight,
              height: logoHeight,
              borderRadius: 8,
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
                color: '#000',
              },
            ]}
          >
            {!error ? (
              (overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')?.charAt(0).toUpperCase()
            ) : (
              <Icon name={'warning'} size={30} style={styles.errorIcon} />
            )}
          </Text>
        )}
      </View>
    )
  }

  const AttributeLabel: React.FC<{ label: string }> = ({ label }) => {
    const ylabel = overlay.bundle?.labelOverlay?.attributeLabels[label] ?? startCase(label)

    return (
      <Text
        style={[
          TextTheme.labelSubtitle,
          styles.textContainer,
          {
            lineHeight: 19,
            opacity: 0.8,
          },
        ]}
        testID={testIdWithKey('AttributeName')}
      >
        {ylabel}
      </Text>
    )
  }

  const AttributeValue: React.FC<{ value: string | number | null }> = ({ value }) => {
    return (
      <>
        {isDataUrl(value) ? (
          <Image style={styles.imageAttr} source={{ uri: value as string }}></Image>
        ) : (
          <Text
            style={[
              TextTheme.normal,
              styles.textContainer,
              {
                lineHeight: 24,
                fontWeight: 'bold',
              },
            ]}
            testID={testIdWithKey('AttributeValue')}
          >
            {value}
          </Text>
        )}
      </>
    )
  }

  const parseAttribute = (item: (Attribute & Predicate) | undefined) => {
    return { label: item?.label ?? item?.name ?? '', value: item?.value || `${item?.pType} ${item?.pValue}` }
  }

  const renderCardAttribute = (item: Attribute & Predicate) => {
    const { label, value } = parseAttribute(item)
    return (
      item && (
        <View style={{ marginTop: 15 }}>
          {!(item?.value || item?.satisfied) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                style={{ paddingTop: 2, paddingHorizontal: 2 }}
                name="close"
                color={ListItems.proofError.color}
                size={ListItems.recordAttributeText.fontSize}
              />
              <AttributeLabel label={label} />
            </View>
          ) : (
            <AttributeLabel label={label} />
          )}
          {!(item?.value || item?.pValue) ? null : <AttributeValue value={value} />}
          {item?.satisfied != undefined && item?.satisfied === false ? (
            <Text style={[styles.errorText]} numberOfLines={1}>
              {t('ProofRequest.PredicateNotSatisfied')}
            </Text>
          ) : null}
        </View>
      )
    )
  }

  const CredentialCardPrimaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <View style={{ marginLeft: -1 * logoHeight + padding, margin: -1 }}>
          <View>
            {!(overlay.metaOverlay?.issuer === 'Unknown Contact' && proof) && (
              <View style={{ flexDirection: 'row' }}>
                <Text
                  testID={testIdWithKey('CredentialIssuer')}
                  style={[
                    TextTheme.label,
                    styles.textContainer,
                    {
                      lineHeight: 19,
                      opacity: 0.8,
                      flex: 1,
                      flexWrap: 'wrap',
                    },
                  ]}
                >
                  {overlay.metaOverlay?.issuer}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row' }}>
              <Text
                testID={testIdWithKey('CredentialName')}
                style={[
                  TextTheme.normal,
                  styles.textContainer,
                  {
                    fontWeight: 'bold',
                    lineHeight: 24,
                    flex: 1,
                    flexWrap: 'wrap',
                  },
                ]}
              >
                {overlay.metaOverlay?.name}
              </Text>
            </View>
          </View>
          {(error || isProofRevoked) && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon style={[styles.errorIcon]} name="close" size={30} />

              <Text style={[styles.errorText]} testID={testIdWithKey('RevokedOrNotAvailable')} numberOfLines={1}>
                {error ? t('ProofRequest.NotAvailableInYourWallet') : t('CredentialDetails.Revoked')}
              </Text>
            </View>
          )}
          <FlatList
            data={cardData}
            scrollEnabled={false}
            initialNumToRender={cardData?.length}
            renderItem={({ item }) => {
              return renderCardAttribute(item as Attribute & Predicate)
            }}
          />
        </View>
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
            backgroundColor:
              error || isProofRevoked
                ? ColorPallet.notification.errorBorder
                : styles.secondaryBodyContainer.backgroundColor,
          },
        ]}
      >
        {overlay.brandingOverlay?.backgroundImageSlice && !displayItems ? (
          <ImageBackground
            source={toImageSource(overlay.brandingOverlay?.backgroundImageSlice)}
            style={{ flexGrow: 1 }}
            imageStyle={{
              borderTopLeftRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
            }}
          >
            {null}
          </ImageBackground>
        ) : (
          !(error || proof || getSecondaryBackgroundColor()) && (
            <View
              style={[
                {
                  position: 'absolute',
                  width: logoHeight,
                  height: '100%',
                  borderTopLeftRadius: borderRadius,
                  borderBottomLeftRadius: borderRadius,
                  backgroundColor: 'rgba(0,0,0,0.24)',
                },
              ]}
            ></View>
          )
        )}
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
              <Icon size={0.7 * logoHeight} style={{ color: ColorPallet.semantic.error }} name="error" />
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
      <View
        style={styles.cardContainer}
        accessible={true}
        accessibilityLabel={
          `${overlay.metaOverlay?.issuer ? `${t('Credentials.IssuedBy')} ${overlay.metaOverlay?.issuer}` : ''}, ${
            overlay.metaOverlay?.watermark ?? ''
          } ${overlay.metaOverlay?.name ?? ''} ${t('Credentials.Credential')}.` +
          cardData.map((item) => {
            const { label, value } = parseAttribute(item as (Attribute & Predicate) | undefined)
            if (label && value) {
              return ` ${label}, ${value}`
            }
          })
        }
      >
        <CredentialCardSecondaryBody />
        <CredentialCardLogo />
        <CredentialCardPrimaryBody />
        <CredentialCardStatus status={status} />
      </View>
    )
  }
  return overlay.bundle ? (
    <View
      style={[styles.container, style, { elevation: elevated ? 5 : 0, overflow: 'hidden' }]}
      onLayout={(event) => {
        setDimensions({ cardHeight: event.nativeEvent.layout.height, cardWidth: event.nativeEvent.layout.width })
      }}
    >
      <TouchableOpacity
        accessible={false}
        accessibilityLabel={typeof onPress === 'undefined' ? undefined : t('Credentials.CredentialDetails')}
        disabled={typeof onPress === 'undefined' ? true : false}
        onPress={onPress}
        style={[
          styles.container,
          style,
          { backgroundColor: isProofRevoked ? ColorPallet.notification.error : style.backgroundColor },
        ]}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <View testID={testIdWithKey('CredentialCard')}>
          {overlay.metaOverlay?.watermark && (
            <CardWatermark
              width={dimensions.cardWidth}
              height={dimensions.cardHeight}
              style={styles.watermark}
              watermark={overlay.metaOverlay?.watermark}
            />
          )}
          <CredentialCard status={isRevoked ? CredentialStatus.REVOKED : undefined} />
        </View>
      </TouchableOpacity>
    </View>
  ) : null
}

export default CredentialCard11
