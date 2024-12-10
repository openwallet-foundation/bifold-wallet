import { CredentialExchangeRecord } from '@credo-ts/core'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import { Attribute, CredentialOverlay, Field, Predicate } from '@hyperledger/aries-oca/build/legacy'
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
import { shadeIsLightOrDark, Shade } from '../../utils/luminance'
import { testIdWithKey } from '../../utils/testable'

import CardWatermark from './CardWatermark'
import CredentialActionFooter from './CredentialCard11ActionFooter'

export enum CredentialErrors {
  Revoked, // Credential has been revoked
  NotInWallet, // Credential requested for proof does not exists in users wallet
  PredicateError, // Credential requested for proof contains a predicate match that is not satisfied
}

interface CredentialCard11Props {
  credential?: CredentialExchangeRecord
  onPress?: GenericFn
  style?: ViewStyle
  displayItems?: (Attribute | Predicate)[]
  elevated?: boolean
  credName?: string
  credDefId?: string
  schemaId?: string
  proof?: boolean
  credentialErrors: CredentialErrors[]
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
  elevated = false,
  credName,
  credDefId,
  schemaId,
  proof,
  hasAltCredentials,
  credentialErrors = [],
  handleAltCredChange,
}) => {
  const { width } = useWindowDimensions()
  const borderRadius = 10
  const padding = width * 0.05
  const logoHeight = width * 0.12
  const [dimensions, setDimensions] = useState({ cardWidth: 0, cardHeight: 0 })
  const { i18n, t } = useTranslation()
  const { ColorPallet, TextTheme, ListItems } = useTheme()
  const [flaggedAttributes, setFlaggedAttributes] = useState<string[]>()
  const [allPI, setAllPI] = useState<boolean>()
  const credentialConnectionLabel = useCredentialConnectionLabel(credential)
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

  const cardData: Field[] = useMemo(() => {
    const fields: Field[] = displayItems ?? []
    const primaryField = overlay?.presentationFields?.find(
      (field) => field.name === overlay?.brandingOverlay?.primaryAttribute
    )
    const secondaryField = overlay?.presentationFields?.find(
      (field) => field.name === overlay?.brandingOverlay?.secondaryAttribute
    )

    primaryField && fields.push(primaryField)
    secondaryField && fields.push(secondaryField)

    return fields
  }, [displayItems, overlay])

  const navigation = useNavigation()

  const getSecondaryBackgroundColor = (): string | undefined => {
    if (proof) {
      return overlay.brandingOverlay?.primaryBackgroundColor
    } else {
      return overlay.brandingOverlay?.backgroundImageSlice
        ? 'rgba(0, 0, 0, 0)'
        : overlay.brandingOverlay?.secondaryBackgroundColor
    }
  }

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
      flex: 1,
      padding,
      marginLeft: -1 * logoHeight + padding,
    },
    imageAttr: {
      height: 150,
      aspectRatio: 1,
      resizeMode: 'contain',
      borderRadius: borderRadius,
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
    selectedCred: {
      borderWidth: 5,
      borderRadius: 15,
      borderColor: ColorPallet.semantic.focus,
    },
    credActionText: {
      fontSize: 20,
      fontWeight: TextTheme.bold.fontWeight,
      color: ColorPallet.brand.link,
    },
  })

  const backgroundColorIfRevoked = (backgroundColor?: string) =>
    credentialErrors.includes(CredentialErrors.Revoked) ? ColorPallet.notification.errorBorder : backgroundColor

  const fontColorWithHighContrast = () => {
    if (proof) {
      return ColorPallet.grayscale.mediumGrey
    }

    const c =
      backgroundColorIfRevoked(overlay.brandingOverlay?.primaryBackgroundColor) ?? ColorPallet.grayscale.lightGrey
    const shade = shadeIsLightOrDark(c)

    return shade == Shade.Light ? ColorPallet.grayscale.darkGrey : ColorPallet.grayscale.lightGrey
  }

  const parseAttribute = useCallback(
    (item: Attribute & Predicate) => {
      let parsedItem = item
      if (item && item.pValue != null) {
        parsedItem = pTypeToText(item, t, overlay.bundle?.captureBase.attributes) as Attribute & Predicate
      }
      const parsedValue = formatIfDate(
        attributeFormats?.[item.name ?? ''],
        parsedItem?.value ?? parsedItem?.pValue ?? null
      )
      return {
        label: item.label ?? item.name ?? '',
        value: item.value !== undefined && item.value != null ? parsedValue : `${parsedItem?.pType} ${parsedValue}`,
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
              TextTheme.bold,
              {
                fontSize: 0.5 * logoHeight,
                alignSelf: 'center',
                color: '#000',
              },
            ]}
          >
            {(overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C')?.charAt(0).toUpperCase()}
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

  const AttributeErrorLabel: React.FC<{ errorMessage: string }> = ({ errorMessage }) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon
          testID={testIdWithKey('AttributeErrorIcon')}
          style={{ paddingTop: 2, paddingHorizontal: 2 }}
          name="close"
          color={ListItems.proofError.color}
          size={ListItems.recordAttributeText.fontSize}
        />
        <Text
          testID={testIdWithKey('AttributeErrorText')}
          style={[
            TextTheme.labelSubtitle,
            styles.textContainer,
            {
              lineHeight: 19,
              opacity: 0.8,
              color: ListItems.proofError.color,
            },
          ]}
        >
          {errorMessage}
        </Text>
      </View>
    )
  }

  const AttributeValue: React.FC<{ value: string | number | null; warn?: boolean }> = ({ value, warn }) => {
    return (
      <>
        {isDataUrl(value) ? (
          <Image style={styles.imageAttr} source={{ uri: value as string }} />
        ) : (
          <Text
            style={[
              TextTheme.bold,
              styles.textContainer,
              {
                lineHeight: 24,
              },
              { color: warn ? ColorPallet.notification.warnText : styles.textContainer.color },
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
    const parsedValue = formatIfDate(item.format, value) ?? ''
    return (
      <View style={{ marginTop: 15 }}>
        {/* Render attribute label */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {credentialErrors.includes(CredentialErrors.NotInWallet) && (
            <Icon
              testID={testIdWithKey('AttributeNameErrorIcon')}
              style={{ paddingTop: 2, paddingHorizontal: 2 }}
              name="close"
              color={ListItems.proofError.color}
              size={ListItems.recordAttributeText.fontSize}
            />
          )}
          <AttributeLabel label={label} />
        </View>
        {/* Render attribute value */}
        {!credentialErrors.includes(CredentialErrors.NotInWallet) && !item.hasError && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {flaggedAttributes?.includes(label) && !item.pValue && proof && (
              <Icon
                testID={testIdWithKey('AttributeNameWarningIcon')}
                style={{ paddingTop: 2, paddingHorizontal: 2 }}
                name="warning"
                color={ColorPallet.notification.warnIcon}
                size={ListItems.recordAttributeText.fontSize}
              />
            )}
            <AttributeValue warn={flaggedAttributes?.includes(label) && !item.pValue && proof} value={parsedValue} />
          </View>
        )}
        {/* Render attribute missing from credential error */}
        {!credentialErrors.includes(CredentialErrors.NotInWallet) && item.hasError && (
          <AttributeErrorLabel
            errorMessage={t('ProofRequest.MissingAttribute', {
              name: overlay.bundle?.labelOverlay?.attributeLabels[label] ?? startCase(label),
            })}
          />
        )}
        {/* Render predicate not satisfied error */}
        {!credentialErrors.includes(CredentialErrors.NotInWallet) &&
          item.satisfied != undefined &&
          item.satisfied === false && <AttributeErrorLabel errorMessage={t('ProofRequest.PredicateNotSatisfied')} />}
      </View>
    )
  }

  const CredentialCardPrimaryBodyFooter: React.FC = () => {
    if (hasAltCredentials && handleAltCredChange) {
      return (
        <CredentialActionFooter
          onPress={handleAltCredChange}
          text={t('ProofRequest.ChangeCredential')}
          testID={'ChangeCredential'}
        />
      )
    }
    if (Boolean(credentialErrors.length) && helpAction) {
      return (
        <CredentialActionFooter
          onPress={helpAction}
          text={t('ProofRequest.GetThisCredential')}
          testID={'GetThisCredential'}
        />
      )
    }
    return <></>
  }

  const CredentialCardPrimaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
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
                TextTheme.bold,
                styles.textContainer,
                {
                  lineHeight: 24,
                  flex: 1,
                  flexWrap: 'wrap',
                  color: allPI && proof ? ColorPallet.notification.warnText : styles.textContainer.color,
                },
              ]}
            >
              {overlay.metaOverlay?.name}
            </Text>
          </View>
        </View>

        {/* Render Error text at the top of the credential card */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {credentialErrors.includes(CredentialErrors.Revoked) && Boolean(proof) && (
            <>
              <Icon style={styles.errorIcon} name="close" size={30} />
              <Text style={styles.errorText} testID={testIdWithKey('RevokedOrNotAvailable')} numberOfLines={1}>
                {t('CredentialDetails.Revoked')}
              </Text>
            </>
          )}
          {credentialErrors.includes(CredentialErrors.NotInWallet) && (
            <>
              <Icon style={styles.errorIcon} name="close" size={30} />
              <Text style={styles.errorText} testID={testIdWithKey('RevokedOrNotAvailable')} numberOfLines={1}>
                {t('ProofRequest.NotAvailableInYourWallet')}
              </Text>
            </>
          )}
        </View>
        <FlatList
          data={cardData}
          scrollEnabled={false}
          initialNumToRender={cardData?.length}
          renderItem={({ item }) => {
            return renderCardAttribute(item as Attribute & Predicate)
          }}
          ListFooterComponent={<CredentialCardPrimaryBodyFooter />}
        />
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
            backgroundColor: backgroundColorIfRevoked(styles.secondaryBodyContainer.backgroundColor),
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
          !(Boolean(credentialErrors.length) || proof || getSecondaryBackgroundColor()) && (
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
            />
          )
        )}
      </View>
    )
  }

  const CredentialCardStatus: React.FC<{
    status?: 'error' | 'warning'
  }> = ({ status }) => {
    return (
      <View
        testID={testIdWithKey('CredentialCardStatus')}
        style={[styles.statusContainer, { position: 'absolute', right: 0, top: 0 }]}
      >
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
              size={0.7 * logoHeight}
              style={{ color: status === 'error' ? ColorPallet.semantic.error : ColorPallet.notification.warnIcon }}
              name={status}
            />
          </View>
        ) : (
          <View style={styles.statusContainer} />
        )}
      </View>
    )
  }

  const CredentialCard: React.FC<{ status?: 'error' | 'warning' }> = ({ status }) => {
    return (
      <View
        style={styles.cardContainer}
        accessible={true}
        accessibilityLabel={
          `${overlay.metaOverlay?.issuer ? `${t('Credentials.IssuedBy')} ${overlay.metaOverlay?.issuer}` : ''}, ${
            overlay.metaOverlay?.watermark ?? ''
          } ${overlay.metaOverlay?.name ?? ''} ${t('Credentials.Credential')}.` +
          cardData.map((item) => {
            const { label, value } = parseAttribute(item as Attribute & Predicate)
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

  const getCredentialStatus = (): 'error' | 'warning' | undefined => {
    if (credentialErrors.includes(CredentialErrors.Revoked) && !proof) {
      return 'error'
    } else if (allPI && proof) {
      return 'warning'
    }
    return undefined
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
        style={[
          styles.container,
          style,
          {
            backgroundColor:
              credentialErrors.includes(CredentialErrors.Revoked) && Boolean(proof)
                ? ColorPallet.notification.error
                : style.backgroundColor,
          },
        ]}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <View testID={testIdWithKey('CredentialCard')}>
          {overlay.metaOverlay?.watermark && (
            <CardWatermark
              width={dimensions.cardWidth}
              height={dimensions.cardHeight}
              style={{ color: fontColorWithHighContrast() }}
              watermark={overlay.metaOverlay?.watermark}
            />
          )}
          <CredentialCard
            // if the credential is revoked and we are not in a proof context
            // display a small error icon in the top right of the credential card
            status={getCredentialStatus()}
          />
        </View>
      </TouchableOpacity>
    </View>
  ) : null
}

export default CredentialCard11
