import React, { useState } from 'react'
import { View, Image, ImageBackground, FlatList, TouchableOpacity, Linking } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { WalletCredentialCardData, CardAttribute } from '../../wallet/ui-types'
import { ThemedText } from '../texts/ThemedText'
import { testIdWithKey } from '../../utils/testable'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import CardWatermark from './CardWatermark'
import CredentialCardGenLogo from './CredentialCardGenLogo'
import startCase from 'lodash.startcase'
import { toImageSource } from '../../utils/credential'

type Props = {
  data: WalletCredentialCardData
  onPress?: () => void
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  elevated?: boolean
}

const Card11Pure: React.FC<Props> = ({ data, onPress, elevated, hasAltCredentials, onChangeAlt }) => {
  const [dimensions, setDimensions] = useState({ cardWidth: 0, cardHeight: 0 })

  const { branding, proofContext, hideSlice } = data
  const { styles, borderRadius, logoHeight } = useCredentialCardStyles(
    // NEW: pass simple colors (no overlay object)
    { primaryBackgroundColor: branding.primaryBg, secondaryBackgroundColor: branding.secondaryBg },
    branding.type,
    !!proofContext
  )

  const list = data.items
  const textColor = data.branding.preferredTextColor ?? styles.textContainer.color
  const issuerAccessibilityLabel = data.issuerName ? `Issued by ${data.issuerName}` : ''
  const accessibilityLabel =
    `${issuerAccessibilityLabel}, ${data.credentialName}, ` +
    list.map((f) => `${f.label}, ${String(f.value ?? '')}`).join(', ')

  const AttributeRow = ({ item }: { item: CardAttribute }) => {
    const warn = proofContext && (item.isPII ?? false) && !item.predicate?.present

    if (data.notInWallet || item.hasError || (item.predicate?.present && item.predicate.satisfied === false)) {
      const errorText = data.notInWallet
        ? 'Not available in your wallet'
        : item.predicate?.present
        ? 'Predicate not satisfied'
        : 'Missing attribute'
      return (
        <View style={styles.cardAttributeContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              style={{ paddingTop: 2, paddingHorizontal: 2 }}
              name="close"
              size={styles.recordAttributeText.fontSize}
            />
            <ThemedText variant="labelSubtitle" style={[styles.textContainer, { opacity: 0.8 }]}>
              {item.label}
            </ThemedText>
          </View>
          <ThemedText variant="labelSubtitle" style={[styles.textContainer, { opacity: 0.8 }]}>
            {errorText}
          </ThemedText>
        </View>
      )
    }

    return (
      <View style={styles.cardAttributeContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {warn && (
            <Icon
              style={{ paddingTop: 2, paddingHorizontal: 2 }}
              name="warning"
              size={styles.recordAttributeText.fontSize}
            />
          )}
          <ThemedText variant="labelSubtitle" style={[styles.textContainer, { lineHeight: 19, opacity: 0.8 }]}>
            {item.label}
          </ThemedText>
        </View>
        {typeof item.value === 'string' && /^data:image\//.test(item.value) ? (
          <Image style={styles.imageAttr} source={{ uri: item.value }} />
        ) : (
          <ThemedText variant="bold" style={[styles.textContainer, { color: textColor }]}>
            {item.value as any}
          </ThemedText>
        )}
      </View>
    )
  }

  const StatusBadge = () => (
    <View
      testID={testIdWithKey('CredentialCardStatus')}
      style={[styles.statusContainer, { position: 'absolute', right: 0, top: 0 }]}
    >
      {data.status ? (
        <View style={[styles.statusContainer, { backgroundColor: data.status === 'error' ? '#FDECEA' : '#FFF8E1' }]}>
          <Icon size={0.7 * logoHeight} name={data.status} />
        </View>
      ) : (
        <View style={styles.statusContainer} />
      )}
    </View>
  )

  const SecondaryBody = () => {
    if (hideSlice) {
      return (
        <View
          testID={testIdWithKey('CredentialCardSecondaryBody')}
          style={[styles.secondaryBodyContainer, { backgroundColor: 'transparent', overflow: 'hidden' }]}
        />
      )
    }
    const bg = branding.secondaryBg ?? styles.secondaryBodyContainer.backgroundColor ?? 'transparent'
    return (
      <View
        testID={testIdWithKey('CredentialCardSecondaryBody')}
        style={[styles.secondaryBodyContainer, { backgroundColor: bg, overflow: 'hidden' }]}
      >
        {branding.backgroundSliceUri ? (
          <ImageBackground
            source={{ uri: branding.backgroundSliceUri }}
            style={{ flexGrow: 1 }}
            imageStyle={{ borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }}
          />
        ) : (
          !(proofContext || branding.secondaryBg) && (
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

  const HelpOrAlt = () => {
    if (hasAltCredentials && onChangeAlt) {
      return (
        <TouchableOpacity onPress={onChangeAlt} accessibilityLabel="Change credential">
          <ThemedText variant="bold" style={[styles.textContainer]}>
            Change credential
          </ThemedText>
        </TouchableOpacity>
      )
    }
    if (data.helpActionUrl) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(data.helpActionUrl!)} accessibilityLabel="Get this credential">
          <ThemedText variant="bold" style={[styles.textContainer]}>
            Get this credential
          </ThemedText>
        </TouchableOpacity>
      )
    }
    return null
  }

  const PrimaryBody = () => {
    return (
      <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
        <View style={{ flexDirection: 'row' }}>
          <ThemedText
            variant="label"
            testID={testIdWithKey('CredentialIssuer')}
            style={[
              styles.textContainer,
              {
                lineHeight: 19,
                opacity: 0.8,
                flex: 1,
                flexWrap: 'wrap',
              },
            ]}
          >
            {data.issuerName}
          </ThemedText>
        </View>
        <View style={styles.primaryBodyNameContainer}>
          <ThemedText
            variant="bold"
            testID={testIdWithKey('CredentialName')}
            style={[styles.textContainer, styles.credentialName, { color: textColor }]}
          >
            {data.credentialName}
          </ThemedText>
        </View>

        {data.extraOverlayParameter && !proofContext && (
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <ThemedText
              variant="caption"
              style={{
                color: styles.textContainer.color,
              }}
            >
              {data.extraOverlayParameter.label ?? startCase(data.extraOverlayParameter.label || '')}:{' '}
              {data.extraOverlayParameter.value}
            </ThemedText>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {data.revoked && !proofContext && (
            <>
              <Icon style={styles.errorIcon} name="close" size={30} />
              <ThemedText style={styles.errorText} testID={testIdWithKey('RevokedOrNotAvailable')} numberOfLines={1}>
                Revoked
              </ThemedText>
            </>
          )}
          {data.notInWallet && (
            <>
              <Icon style={styles.errorIcon} name="close" size={30} />
              <ThemedText style={styles.errorText} testID={testIdWithKey('RevokedOrNotAvailable')}>
                Not available in your wallet
              </ThemedText>
            </>
          )}
        </View>

        {proofContext && (
          <FlatList
            data={list}
            scrollEnabled={false}
            initialNumToRender={list.length}
            keyExtractor={(i) => i.key}
            renderItem={({ item }) => <AttributeRow item={item} />}
            ListFooterComponent={<HelpOrAlt />}
          />
        )}
      </View>
    )
  }

  const Main = () => (
    <View style={styles.cardContainer} accessible accessibilityLabel={accessibilityLabel}>
      <SecondaryBody />
      <CredentialCardGenLogo
        noLogoText={branding.logoText ?? 'U'}
        logo={branding.logo1x1Uri}
        primaryBackgroundColor={branding.primaryBg}
        secondaryBackgroundColor={branding.secondaryBg}
        containerStyle={styles.logoContainer}
        logoHeight={logoHeight}
        elevated={elevated}
      />
      <PrimaryBody />
      <StatusBadge />
    </View>
  )

  return (
    <View
      style={[styles.container, { elevation: elevated ? 5 : 0, overflow: elevated ? 'visible' : 'hidden' }]}
      onLayout={(event) => {
        setDimensions({ cardHeight: event.nativeEvent.layout.height, cardWidth: event.nativeEvent.layout.width })
      }}
    >
      <TouchableOpacity
        accessible={false}
        accessibilityLabel={onPress ? 'Credential details' : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={styles.container}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <View testID={testIdWithKey('CredentialCard')} style={{ overflow: 'hidden' }}>
          {branding.watermark && (
            <CardWatermark
              width={dimensions.cardWidth}
              height={dimensions.cardHeight}
              style={{ color: branding.primaryBg }}
              watermark={branding.watermark}
            />
          )}
          {branding.backgroundFullUri && hideSlice ? (
            <ImageBackground source={toImageSource(branding.backgroundFullUri)}>
              <Main />
            </ImageBackground>
          ) : (
            <Main />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default Card11Pure
