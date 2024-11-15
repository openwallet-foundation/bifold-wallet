import { CredentialExchangeRecord } from '@credo-ts/core'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { Attribute, CredentialOverlay, Predicate } from '@hyperledger/aries-oca/build/legacy'
import { useNavigation } from '@react-navigation/native'
import startCase from 'lodash.startcase'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FlatList,
  Image,
  ImageBackground,
  Linking,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { credentialTextColor, getCredentialIdentifiers, toImageSource } from '../../utils/credential'
import { formatIfDate, useCredentialConnectionLabel, isDataUrl, pTypeToText } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

import CardWatermark from './CardWatermark'
import CredentialActionFooter from './CredentialCard11ActionFooter'
import { backgroundColorIfErrorState, fontColorWithHighContrast } from '../../utils/brandingColors'
import { CredentialCard11And12Theme } from '../../theme'

interface CredentialCard12Props {
  credential?: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
  displayItems?: (Attribute | Predicate)[]
  revoked?: boolean
  error?: boolean
  predicateError?: boolean
  elevated?: boolean
  credName?: string
  credDefId?: string
  schemaId?: string
  proof?: boolean
  hasAltCredentials?: boolean
  handleAltCredChange?: () => void
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
  Primary Body   (2): 
                      Credential Name (1x6)
                      Primary Attribute 1 (1x6)
                      Primary Attribute 2 (1x6)
                      Small Logo (1x1) + Issuer Name -> (Max width %80, aligned )
  Status         (3): Icon (1x1) -> S

   (1)            (2)           (3)
  |   | Credential Name        | S |
  |   |                        |   |
  |   | Primary Attribute 1    |   |
  |   | Primary Attribute 2    |   |
  |   |                        |   |
  |   |          Logo + Issuer |   |
  ...

  Note: The small logo MUST be provided as 1x1 (height/width) ratio.
 */

const CredentialCard12: React.FC<CredentialCard12Props> = ({
  credential,
  style = {},
  displayItems,
  onPress = undefined,
  error = false,
  predicateError = false,
  elevated = false,
  credName,
  credDefId,
  schemaId,
  proof,
  hasAltCredentials,
  handleAltCredChange,
}) => {
  const { width } = useWindowDimensions()
  const borderRadius = 10
  const padding = 16
  const logoWidth = width * 0.12
  const [dimensions, setDimensions] = useState({ cardWidth: 0, cardHeight: 0 })
  const { i18n, t } = useTranslation()
  const { ColorPallet, TextTheme, ListItems } = useTheme()
  const [isRevoked, setIsRevoked] = useState<boolean>(credential?.revocationNotification !== undefined)
  const [flaggedAttributes, setFlaggedAttributes] = useState<string[]>()
  const [allPI, setAllPI] = useState<boolean>()
  const credentialConnectionLabel = useCredentialConnectionLabel(credential)
  const [isProofRevoked, setIsProofRevoked] = useState<boolean>(
    credential?.revocationNotification !== undefined && !!proof
  )
  const [bundleResolver, credHelpActionOverrides] = useServices([
    TOKENS.UTIL_OCA_RESOLVER,
    TOKENS.CRED_HELP_ACTION_OVERRIDES,
  ])
  const [helpAction, setHelpAction] = useState<GenericFn>()
  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({})
  const attributeFormats: Record<string, string | undefined> = useMemo(() => {
    return (overlay.bundle as any)?.bundle.attributes
      .map((attr: any) => {
        return { name: attr.name, format: attr.format }
      })
      .reduce((prev: { [key: string]: string }, curr: { name: string; format?: string }) => {
        return { ...prev, [curr.name]: curr.format }
      }, {})
  }, [overlay])

  const cardData = useMemo(() => {
    const primaryField = overlay?.presentationFields?.find(
      (field) => field.name === overlay?.brandingOverlay?.primaryAttribute
    )
    const secondaryField = overlay?.presentationFields?.find(
      (field) => field.name === overlay?.brandingOverlay?.secondaryAttribute
    )

    return [...(displayItems ?? []), primaryField, secondaryField]
  }, [displayItems, overlay])

  const navigation = useNavigation()

  const getSecondaryBackgroundColor = () => {
    return overlay.brandingOverlay?.backgroundImageSlice
      ? 'rgba(0, 0, 0, 0)'
      : overlay.brandingOverlay?.secondaryBackgroundColor
  }

  const styles = StyleSheet.create({
    container: {
      ...CredentialCard11And12Theme.container,
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
    },
    cardContainer: {
      ...CredentialCard11And12Theme.cardContainer,
      minHeight: 0.33 * width,
    },
    secondaryBodyContainer: {
      ...CredentialCard11And12Theme.secondaryBodyContainer,
      width: logoWidth,
      backgroundColor: getSecondaryBackgroundColor() ?? overlay.brandingOverlay?.primaryBackgroundColor,
    },
    primaryBodyContainer: {
      ...CredentialCard11And12Theme.primaryBodyContainer,
      padding,
      justifyContent: 'space-between',
    },
    imageAttr: {
      ...CredentialCard11And12Theme.imageAttr,
    },
    statusContainer: {
      ...CredentialCard11And12Theme.statusContainer,
      height: logoWidth,
      width: logoWidth,
    },
    logoContainer: {
      width: logoWidth,
      height: logoWidth,
      ...CredentialCard11And12Theme.logoContainer,
    },
    headerText: {
      ...CredentialCard11And12Theme.headerText,
    },
    valueText: {
      ...CredentialCard11And12Theme.valueText,
    },
    textContainer: {
      color: proof
        ? TextTheme.normal.color
        : credentialTextColor(ColorPallet, overlay.brandingOverlay?.primaryBackgroundColor),
      ...CredentialCard11And12Theme.textContainer,
    },
    errorText: {
      ...CredentialCard11And12Theme.errorText,
    },
    errorIcon: {
      ...CredentialCard11And12Theme.errorIcon,
    },
    selectedCred: {
      ...CredentialCard11And12Theme.selectedCred,
    },
    seperator: {
      ...CredentialCard11And12Theme.seperator,
    },
    credActionText: {
      ...CredentialCard11And12Theme.credActionText,
    },
  })

  const parseAttribute = useCallback(
    (item: (Attribute & Predicate) | undefined) => {
      let parsedItem = item
      if (item && item.pValue != null) {
        parsedItem = pTypeToText(item, t, overlay.bundle?.captureBase.attributes) as Attribute & Predicate
      }
      const parsedValue = formatIfDate(
        attributeFormats?.[item?.name ?? ''],
        parsedItem?.value ?? parsedItem?.pValue ?? null
      )
      return {
        label: item?.label ?? item?.name ?? '',
        value: item?.value !== undefined && item?.value != null ? parsedValue : `${parsedItem?.pType} ${parsedValue}`,
      }
    },
    [t, overlay, attributeFormats]
  )

  useEffect(() => {
    setAllPI(
      credential &&
        cardData.every((item) => {
          if (item === undefined) {
            return true
          } else if (item instanceof Attribute) {
            const { label } = parseAttribute(item as Attribute & Predicate)
            return flaggedAttributes?.includes(label)
          } else {
            // Predicates are not PII
            return false
          }
        })
    )
  }, [credential, cardData, parseAttribute, flaggedAttributes])

  useEffect(() => {
    const params = {
      identifiers: credential ? getCredentialIdentifiers(credential) : { schemaId, credentialDefinitionId: credDefId },
      attributes: proof ? [] : credential?.credentialAttributes,
      meta: {
        credName,
        credConnectionId: credential?.connectionId,
        alias: credentialConnectionLabel,
      },
      language: i18n.language,
    }
    bundleResolver.resolveAllBundles(params).then((bundle: any) => {
      if (proof) {
        setFlaggedAttributes((bundle as any).bundle.bundle.flaggedAttributes.map((attr: any) => attr.name))
        const credHelpUrl =
          (bundle as any).bundle.bundle.metadata.credentialSupportUrl[params.language] ??
          Object.values((bundle as any).bundle.bundle.metadata.credentialSupportUrl)?.[0]

        // Check if there is a help action override for this credential
        const override = credHelpActionOverrides?.find(
          (override) =>
            (credDefId && override.credDefIds.includes(credDefId)) ||
            (schemaId && override.schemaIds.includes(schemaId))
        )
        if (override) {
          setHelpAction(() => () => {
            override.action(navigation)
          })
        } else if (credHelpUrl) {
          setHelpAction(() => () => {
            Linking.openURL(credHelpUrl)
          })
        }
      }
      setOverlay((o) => ({
        ...o,
        ...bundle,
        brandingOverlay: bundle.brandingOverlay as BrandingOverlay,
      }))
    })
  }, [
    credential,
    schemaId,
    credDefId,
    credName,
    credentialConnectionLabel,
    i18n.language,
    bundleResolver,
    proof,
    credHelpActionOverrides,
    navigation,
  ])

  useEffect(() => {
    setIsRevoked(credential?.revocationNotification !== undefined && !proof)
    setIsProofRevoked(credential?.revocationNotification !== undefined && !!proof)
  }, [credential?.revocationNotification, proof])

  const CredentialCardLogo: React.FC = () => {
    return (
      <View style={[styles.logoContainer]}>
        {overlay.brandingOverlay?.logo ? (
          <Image
            source={toImageSource(overlay.brandingOverlay?.logo)}
            style={{
              resizeMode: 'cover',
              width: logoWidth,
              height: logoWidth,
              borderRadius: 8,
            }}
          />
        ) : (
          <Text
            style={[
              TextTheme.bold,
              {
                fontSize: 0.5 * logoWidth,
                alignSelf: 'center',
                color: overlay.brandingOverlay?.secondaryBackgroundColor ?? '#000',
              },
            ]}
          >
            {(overlay.metaOverlay?.issuer ?? 'I')?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
    )
  }

  const AttributeLabel: React.FC<{ label: string }> = ({ label }) => {
    const ylabel = overlay.bundle?.labelOverlay?.attributeLabels[label] ?? startCase(label)
    const labelColor = proof
      ? overlay.brandingOverlay?.secondaryBackgroundColor
      : overlay.brandingOverlay?.primaryBackgroundColor
    return (
      <Text
        style={[
          TextTheme.labelSubtitle,
          styles.textContainer,
          {
            fontWeight: '600',
            lineHeight: 18,
            opacity: 0.7,
            color:
              error || isProofRevoked
                ? backgroundColorIfErrorState(
                    ColorPallet,
                    error,
                    predicateError,
                    isProofRevoked,
                    styles.secondaryBodyContainer.backgroundColor
                  )
                : credentialTextColor(ColorPallet, labelColor),
          },
        ]}
        testID={testIdWithKey('AttributeName')}
      >
        {ylabel}
      </Text>
    )
  }

  const AttributeValue: React.FC<{ value: string | number | null; warn?: boolean }> = ({ value, warn }) => {
    return (
      <>
        {isDataUrl(value) ? (
          <Image style={styles.imageAttr} source={{ uri: value as string }}></Image>
        ) : (
          <Text
            style={[
              TextTheme.bold,
              styles.textContainer,
              {
                fontSize: 16,
                lineHeight: 24,
              },
              {
                color: warn ? ColorPallet.notification.warnText : styles.textContainer.color,
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

  const renderCardAttribute = (item: Attribute & Predicate) => {
    const { label, value } = parseAttribute(item)
    const parsedValue = formatIfDate(item?.format, value) ?? ''
    return (
      <View style={{ marginBottom: item ? 16 : 0, gap: 4 }}>
        {item && (
          <>
            <AttributeLabel label={label} />
            {!(item?.value || item?.pValue) ? null : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {flaggedAttributes?.includes(label) && !item.pValue && !allPI && proof && (
                  <Icon
                    style={{ paddingTop: 2, paddingHorizontal: 2 }}
                    name="warning"
                    color={ColorPallet.notification.warnIcon}
                    size={ListItems.recordAttributeText.fontSize}
                  />
                )}
                {!error ? (
                  <AttributeValue
                    warn={flaggedAttributes?.includes(label) && !item.pValue && proof}
                    value={parsedValue}
                  />
                ) : null}
              </View>
            )}
            {!error && item?.satisfied != undefined && item?.satisfied === false ? (
              <Text style={styles.errorText} numberOfLines={1}>
                {t('ProofRequest.PredicateNotSatisfied')}
              </Text>
            ) : null}
          </>
        )}
      </View>
    )
  }

  const CredentialCardPrimaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={[styles.primaryBodyContainer, style]}>
        <View style={{ flexDirection: 'row', marginBottom: 19 }}>
          <Text
            testID={testIdWithKey('CredentialName')}
            style={[
              TextTheme.normal,
              styles.textContainer,
              {
                fontSize: 14,
                fontWeight: '600',
                lineHeight: 16,
                flex: 1,
                maxWidth: '85%',
                flexWrap: 'wrap',
                color: allPI && proof ? ColorPallet.notification.warnText : styles.textContainer.color,
              },
            ]}
          >
            {overlay.metaOverlay?.name}
          </Text>
        </View>
        {(error || isProofRevoked) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Icon style={styles.errorIcon} name="close" size={30} />

            <Text style={styles.errorText} testID={testIdWithKey('RevokedOrNotAvailable')} numberOfLines={1}>
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
          ListFooterComponent={
            hasAltCredentials && handleAltCredChange ? (
              <View style={{ marginBottom: 16 }}>
                <CredentialActionFooter
                  onPress={handleAltCredChange}
                  text={t('ProofRequest.ChangeCredential')}
                  testID={'ChangeCredential'}
                />
              </View>
            ) : error && helpAction ? (
              <CredentialActionFooter
                onPress={helpAction}
                text={t('ProofRequest.GetThisCredential')}
                testID={'GetThisCredential'}
              />
            ) : null
          }
        />
        {!(overlay.metaOverlay?.issuer === 'Unknown Contact' && proof) && (
          <View
            style={{
              flex: 1,
              alignSelf: 'flex-end',
              justifyContent: 'flex-end',
              maxWidth: '80%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-end',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <CredentialCardLogo />
              <Text
                testID={testIdWithKey('CredentialIssuer')}
                style={[
                  TextTheme.normal,
                  styles.textContainer,
                  {
                    fontWeight: '500',
                    fontSize: 12,
                    lineHeight: 19,
                    opacity: 0.8,
                    flexWrap: 'wrap',
                  },
                ]}
              >
                {overlay.metaOverlay?.issuer}
              </Text>
            </View>
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
            backgroundColor: backgroundColorIfErrorState(
              ColorPallet,
              error,
              predicateError,
              isProofRevoked,
              styles.secondaryBodyContainer.backgroundColor
            ),
            overflow: 'hidden',
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
          />
        ) : (
          !(error || predicateError || proof || getSecondaryBackgroundColor()) && (
            <View
              style={[
                {
                  position: 'absolute',
                  width: logoWidth,
                  height: '100%',
                  borderTopLeftRadius: borderRadius,
                  borderBottomLeftRadius: borderRadius,
                  backgroundColor: 'rgba(0,0,0,0.24)',
                },
              ]}
            />
          )
        )}
      </View>
    )
  }

  const CredentialCardStatus: React.FC<{ status?: 'error' | 'warn' }> = ({ status }) => {
    const Status: React.FC<{ status?: 'error' | 'warn' }> = ({ status }) => {
      return (
        <>
          {status ? (
            <View
              style={[
                styles.statusContainer,
                {
                  backgroundColor: status === 'error' ? ColorPallet.notification.error : ColorPallet.notification.warn,
                },
              ]}
            >
              <Icon
                size={0.7 * logoWidth}
                style={{ color: status === 'error' ? ColorPallet.semantic.error : ColorPallet.notification.warnIcon }}
                name={status === 'error' ? 'error' : 'warning'}
              />
            </View>
          ) : (
            <View style={styles.statusContainer} />
          )}
        </>
      )
    }

    return (
      <View
        testID={testIdWithKey('CredentialCardStatus')}
        style={[styles.statusContainer, { position: 'absolute', right: 0, top: 0 }]}
      >
        <Status status={status} />
      </View>
    )
  }

  const CredentialCard: React.FC<{ status?: 'error' | 'warn' }> = ({ status }) => {
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
        <CredentialCardPrimaryBody />
        <CredentialCardStatus status={status} />
      </View>
    )
  }
  return overlay.bundle ? (
    <View
      style={[
        styles.container,
        style,
        { elevation: elevated ? 5 : 0, overflow: 'hidden' },
        hasAltCredentials ? styles.selectedCred : undefined,
      ]}
      onLayout={(event) => {
        setDimensions({ cardHeight: event.nativeEvent.layout.height, cardWidth: event.nativeEvent.layout.width })
      }}
    >
      <TouchableOpacity
        accessible={false}
        accessibilityLabel={typeof onPress === 'undefined' ? undefined : t('Credentials.CredentialDetails')}
        disabled={typeof onPress === 'undefined' ? true : false}
        onPress={onPress}
        style={[styles.container, style, { backgroundColor: style.backgroundColor }]}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <View testID={testIdWithKey('CredentialCard')}>
          {overlay.metaOverlay?.watermark && (
            <CardWatermark
              width={dimensions.cardWidth}
              height={dimensions.cardHeight}
              style={{
                color: fontColorWithHighContrast(
                  ColorPallet,
                  error,
                  predicateError,
                  isProofRevoked,
                  overlay.brandingOverlay?.primaryBackgroundColor,
                  proof
                ),
              }}
              watermark={overlay.metaOverlay?.watermark}
            />
          )}
          <CredentialCard status={isRevoked ? 'error' : allPI && proof ? 'warn' : undefined} />
        </View>
      </TouchableOpacity>
    </View>
  ) : null
}

export default CredentialCard12
