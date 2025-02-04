import { BrandingOverlay } from '@hyperledger/aries-oca'
import {
  Attribute,
  CredentialOverlay,
  Predicate,
  Field,
  BrandingOverlayType,
} from '@hyperledger/aries-oca/build/legacy'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import ImageModal from '../../components/modals/ImageModal'
import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import { toImageSource } from '../../utils/credential'
import { formatIfDate, isDataUrl, pTypeToText } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

import CardWatermark from './CardWatermark'
import CredentialCard11Logo from './CredentialCard11Logo'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import { Shade, shadeIsLightOrDark } from '../../utils/luminance'
import CredentialIssuerBody from './CredentialCard11Issuer'

interface VerifierCredentialCardProps {
  style?: ViewStyle
  displayItems?: Field[]
  elevated?: boolean
  credDefId?: string
  schemaId: string
  preview?: boolean
  onChangeValue?: (schema: string, label: string, name: string, value: string) => void
  brandingOverlayType?: BrandingOverlayType
}

/**
 * This component is meant to be used in the ProofRequestDetails screen to show what
 * a proof request will look like with proper branding etc. and allow for the changing
 * of predicate values. It is a greatly trimmed-down version of the CredentialCard11.
 */
const VerifierCredentialCard: React.FC<VerifierCredentialCardProps> = ({
  style = {},
  displayItems = [],
  elevated = false,
  credDefId,
  schemaId,
  preview,
  onChangeValue,
  brandingOverlayType = BrandingOverlayType.Branding10,
}) => {
  const [dimensions, setDimensions] = useState({ cardWidth: 0, cardHeight: 0 })
  const { i18n, t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])
  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({})
  const isBranding10 = brandingOverlayType === BrandingOverlayType.Branding10
  const { styles, borderRadius } = useCredentialCardStyles(overlay, brandingOverlayType, isBranding10)

  const attributeTypes = overlay.bundle?.captureBase.attributes
  const attributeFormats: Record<string, string | undefined> = (overlay.bundle as any)?.bundle.attributes
    .map((attr: any) => {
      return { name: attr.name, format: attr.format }
    })
    .reduce((prev: { [key: string]: string }, curr: { name: string; format?: string }) => {
      return { ...prev, [curr.name]: curr.format }
    }, {})

  const getCardWatermarkTextColor = (background?: string) => {
    if (isBranding10) return ColorPallet.grayscale.mediumGrey
    const shade = shadeIsLightOrDark(background ?? ColorPallet.grayscale.lightGrey)
    return shade == Shade.Light ? ColorPallet.grayscale.darkGrey : ColorPallet.grayscale.lightGrey
  }

  const parseAttribute = (item: (Attribute & Predicate) | undefined) => {
    let parsedItem = item
    if (item && !item.value) {
      parsedItem = pTypeToText(item, t, attributeTypes) as Attribute & Predicate
    }
    const parsedValue = formatIfDate(
      attributeFormats?.[item?.name ?? ''],
      parsedItem?.value ?? parsedItem?.pValue ?? null
    )
    return {
      label: item?.label ?? item?.name ?? '',
      value: item?.value ? parsedValue : `${parsedItem?.pType} ${parsedValue}`,
    }
  }

  useEffect(() => {
    const params = {
      identifiers: { schemaId, credentialDefinitionId: credDefId },
      attributes: displayItems,
      language: i18n.language,
    }
    bundleResolver.resolveAllBundles(params).then((bundle) => {
      setOverlay((o) => ({
        ...o,
        ...bundle,
        brandingOverlay: bundle.brandingOverlay as BrandingOverlay,
      }))
    })
  }, [schemaId, credDefId, displayItems, i18n.language, bundleResolver])

  const AttributeItem: React.FC<{ item: Attribute }> = ({ item }) => {
    const label = (item.name || item.label)!
    const ylabel = overlay.bundle?.labelOverlay?.attributeLabels[label] ?? startCase(label)
    const [value, setValue] = useState(item.value)
    const [showImageModal, setShowImageModal] = useState(false)

    useEffect(() => {
      setValue((v) => formatIfDate(item.format, v))
    }, [item.format])

    return (
      <View>
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
        {value && (
          <View>
            {isDataUrl(value) ? (
              <TouchableOpacity
                accessibilityLabel={t('Record.Zoom')}
                accessibilityRole="imagebutton"
                testID={testIdWithKey('zoom')}
                onPress={() => setShowImageModal(true)}
              >
                <Image style={styles.imageAttr} source={{ uri: value as string }} />
              </TouchableOpacity>
            ) : (
              <Text style={[TextTheme.bold, styles.textContainer]} testID={testIdWithKey('AttributeValue')}>
                {value}
              </Text>
            )}
          </View>
        )}
        {showImageModal && <ImageModal uri={value as string} onDismissPressed={() => setShowImageModal(false)} />}
      </View>
    )
  }

  const PredicateItem: React.FC<{
    item: Predicate
  }> = ({ item }) => {
    const { ColorPallet } = useTheme()
    const label = (item.label || item.name)!
    const ylabel = overlay.bundle?.labelOverlay?.attributeLabels[label] ?? startCase(label)
    const [currentValue, setCurrentValue] = useState(`${item.pValue ?? ''}`)

    const predicateStyles = StyleSheet.create({
      input: {
        textAlign: 'center',
        textAlignVertical: 'bottom',
        borderBottomColor: ColorPallet.grayscale.black,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderBottomWidth: 1,
        lineHeight: 19,
        padding: 0,
      },
      predicateLabel: {
        lineHeight: 19,
        opacity: 0.8,
      },
      predicateType: {
        lineHeight: isBranding10 ? 19 : styles.textContainer.lineHeight,
        marginRight: 5,
      },
    })

    return (
      <View>
        <Text
          style={[TextTheme.labelSubtitle, styles.textContainer, predicateStyles.predicateLabel]}
          testID={testIdWithKey('PredicateName')}
        >
          {ylabel}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {item.satisfied && !preview ? (
            <Icon style={{ marginRight: 5 }} size={24} name={'check-circle'} color={ColorPallet.semantic.success} />
          ) : null}
          <Text style={[TextTheme.bold, styles.textContainer, predicateStyles.predicateType]}>{item.pType}</Text>
          {/* Only allow editing parametrizable predicates in preview mode */}
          {item.parameterizable && preview && onChangeValue ? (
            <TextInput
              keyboardType="numeric"
              style={[TextTheme.bold, predicateStyles.input]}
              onChangeText={(value) => setCurrentValue(value)}
              onBlur={() => {
                onChangeValue(schemaId, item.label || item.name || '', item.name || '', currentValue)
              }}
              testID={testIdWithKey('PredicateInput')}
            >
              {currentValue}
            </TextInput>
          ) : (
            <Text style={[TextTheme.bold, styles.textContainer]} testID={testIdWithKey('PredicateValue')}>
              {item.pValue}
            </Text>
          )}
        </View>
      </View>
    )
  }

  const CardAttribute: React.FC<{ item: Attribute & Predicate }> = ({ item }) => {
    item.format = attributeFormats?.[item.name ?? '']
    let parsedPredicate: Predicate | undefined = undefined
    if (item instanceof Predicate) {
      parsedPredicate = pTypeToText(item, t, attributeTypes) as Predicate
      if (!parsedPredicate.parameterizable) {
        parsedPredicate.pValue = formatIfDate(parsedPredicate.format, parsedPredicate.pValue)
      }
    }

    return (
      <View style={styles.cardAttributeContainer}>
        {item instanceof Attribute && <AttributeItem item={item as Attribute} />}
        {item instanceof Predicate && <PredicateItem item={parsedPredicate as Predicate} />}
      </View>
    )
  }

  const renderCardAttribute = (item: Attribute & Predicate) => {
    return <CardAttribute item={item} />
  }

  const CredentialCardPrimaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <View>
          {isBranding10 && (
            <CredentialIssuerBody
              overlay={overlay}
              overlayType={brandingOverlayType}
              elevated={elevated}
              hasBody={overlay.metaOverlay?.issuer !== 'Unknown Contact'}
            />
          )}
          <View style={{ flexDirection: 'row' }}>
            <Text
              testID={testIdWithKey('CredentialName')}
              style={[TextTheme.bold, styles.textContainer, styles.credentialName]}
            >
              {overlay.metaOverlay?.name}
            </Text>
          </View>
        </View>
        <FlatList
          data={displayItems}
          scrollEnabled={false}
          initialNumToRender={displayItems?.length}
          keyExtractor={({ name }) => name}
          renderItem={({ item }) => {
            return renderCardAttribute(item as Attribute & Predicate)
          }}
        />
        {brandingOverlayType === BrandingOverlayType.Branding11 && (
          <CredentialIssuerBody
            overlay={overlay}
            overlayType={brandingOverlayType}
            elevated={elevated}
            hasBody={overlay.metaOverlay?.issuer !== 'Unknown Contact'}
          />
        )}
      </View>
    )
  }

  const CredentialCardSecondaryBody: React.FC = () => {
    return (
      <View testID={testIdWithKey('CredentialCardSecondaryBody')} style={styles.secondaryBodyContainer}>
        {overlay.brandingOverlay?.backgroundImageSlice &&
        (!displayItems || brandingOverlayType === BrandingOverlayType.Branding11) ? (
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
        ) : null}
      </View>
    )
  }

  const CredentialCard: React.FC = () => {
    return (
      <View
        style={styles.cardContainer}
        accessible={true}
        accessibilityLabel={
          `${overlay.metaOverlay?.issuer ? `${t('Credentials.IssuedBy')} ${overlay.metaOverlay?.issuer}` : ''}, ${
            overlay.metaOverlay?.watermark ?? ''
          } ${overlay.metaOverlay?.name ?? ''} ${t('Credentials.Credential')}.` +
          displayItems.map((item) => {
            const { label, value } = parseAttribute(item as (Attribute & Predicate) | undefined)
            if (label) {
              return value ? ` ${label}, ${value}` : ` ${label}`
            }
          })
        }
      >
        <CredentialCardSecondaryBody />
        {isBranding10 && (
          <CredentialCard11Logo
            noLogoText={overlay.metaOverlay?.name ?? overlay.metaOverlay?.issuer ?? 'C'}
            overlay={overlay}
            overlayType={brandingOverlayType}
            elevated={elevated}
          />
        )}
        <CredentialCardPrimaryBody />
      </View>
    )
  }

  return overlay.bundle ? (
    <View
      style={[
        styles.container,
        style,
        {
          elevation: elevated ? 5 : 0,
          overflow: 'hidden',
        },
      ]}
      onLayout={(event) => {
        setDimensions({ cardHeight: event.nativeEvent.layout.height, cardWidth: event.nativeEvent.layout.width })
      }}
    >
      <View testID={testIdWithKey('CredentialCard')}>
        {overlay.metaOverlay?.watermark && (
          <CardWatermark
            width={dimensions.cardWidth}
            height={dimensions.cardHeight}
            style={{ color: getCardWatermarkTextColor(overlay.brandingOverlay?.primaryBackgroundColor) }}
            watermark={overlay.metaOverlay?.watermark}
          />
        )}
        <CredentialCard />
      </View>
    </View>
  ) : null
}

export default VerifierCredentialCard
