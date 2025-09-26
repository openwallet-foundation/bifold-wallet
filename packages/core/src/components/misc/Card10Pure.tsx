import React, { useMemo } from 'react'
import { View, Image, ImageBackground, FlatList, TouchableOpacity, Linking } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { WalletCredentialCardData, CardAttribute } from '../../wallet/ui-types'
import { ThemedText } from '../texts/ThemedText'
import { testIdWithKey } from '../../utils/testable'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import CardWatermark from '../misc/CardWatermark'

type Props = {
  data: WalletCredentialCardData
  onPress?: () => void
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  elevated?: boolean
  hideSlice?: boolean
}

/**
 * Card10Pure: overlay-free Card 10 UI that renders from WalletCredentialCardData.
 * - Passes 'Branding10' to the style hook for layout differences.
 * - No OCA resolution or overlay usage at render time.
 */
const Card10Pure: React.FC<Props> = ({ data, onPress, elevated, hideSlice, hasAltCredentials, onChangeAlt }) => {
  const { branding } = data
  const { styles, borderRadius, logoHeight } = useCredentialCardStyles(
    { primaryBackgroundColor: branding.primaryBg, secondaryBackgroundColor: branding.secondaryBg },
    'Branding10',
    !!data.proofContext
  )

  const byKey: Record<string, CardAttribute> = useMemo(
    () => Object.fromEntries(data.items.map((i) => [i.key, i])),
    [data.items]
  )
  const primary = data.primaryAttributeKey ? byKey[data.primaryAttributeKey] : undefined
  const secondary = data.secondaryAttributeKey ? byKey[data.secondaryAttributeKey] : undefined
  const list = useMemo(
    () =>
      [primary, secondary, ...data.items.filter((i) => i.key !== primary?.key && i.key !== secondary?.key)].filter(
        Boolean
      ) as CardAttribute[],
    [primary, secondary, data.items]
  )

  const textColor = data.branding.preferredTextColor ?? styles.textContainer.color

  const issuerAccessibilityLabel = data.issuerName ? `Issued by ${data.issuerName}` : ''
  const accessibilityLabel =
    `${issuerAccessibilityLabel}, ${data.credentialName}, ` +
    list.map((f) => `${f.label}, ${String(f.value ?? '')}`).join(', ')

  const AttributeRow = ({ item }: { item: CardAttribute }) => {
    const warn = data.proofContext && (item.isPII ?? false) && !item.predicate?.present

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
        ) : null}
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

  const Header = () => (
    <View style={[styles.primaryBodyNameContainer, { flexDirection: 'row', alignItems: 'center' }]}>
      {/* Card10 shows issuer and name side-by-side in the header row */}
      {branding.logo1x1Uri ? (
        <Image source={{ uri: branding.logo1x1Uri }} style={{ width: logoHeight, height: logoHeight, borderRadius }} />
      ) : (
        <View style={{ width: logoHeight, height: logoHeight }} />
      )}
      <View style={{ flex: 1, paddingLeft: 8 }}>
        <ThemedText variant="label" testID={testIdWithKey('CredentialIssuer')} style={[styles.textContainer]}>
          {data.issuerName}
        </ThemedText>
        <ThemedText variant="bold" testID={testIdWithKey('CredentialName')} style={[styles.textContainer]}>
          {data.credentialName}
        </ThemedText>
      </View>
    </View>
  )

  const PrimaryBody = () => (
    <View testID={testIdWithKey('CredentialCardPrimaryBody')} style={styles.primaryBodyContainer}>
      <Header />
      <FlatList
        data={list}
        scrollEnabled={false}
        initialNumToRender={list.length}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => <AttributeRow item={item} />}
        ListFooterComponent={<HelpOrAlt />}
      />
    </View>
  )

  const Main = () => (
    <View style={styles.cardContainer} accessible accessibilityLabel={accessibilityLabel}>
      <SecondaryBody />
      {/* Card10 places everything in the main body after a slim slice */}
      <PrimaryBody />
      <StatusBadge />
    </View>
  )

  return (
    <View style={[styles.container, { elevation: elevated ? 5 : 0, overflow: elevated ? 'visible' : 'hidden' }]}>
      <TouchableOpacity
        accessible={false}
        accessibilityLabel={onPress ? 'Credential details' : undefined}
        disabled={!onPress}
        onPress={onPress}
        style={styles.container}
        testID={testIdWithKey('ShowCredentialDetails')}
      >
        <View testID={testIdWithKey('CredentialCard')} style={{ overflow: 'hidden' }}>
          {branding.watermark && <CardWatermark width={0} height={0} style={{}} watermark={branding.watermark} />}
          {branding.backgroundFullUri && hideSlice ? (
            <ImageBackground source={{ uri: branding.backgroundFullUri }}>
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

export default Card10Pure
