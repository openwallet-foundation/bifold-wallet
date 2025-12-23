import React, { useMemo } from 'react'
import { View, Image, ImageBackground, TouchableOpacity } from 'react-native'
import { WalletCredentialCardData, CardAttribute } from '../../wallet/ui-types'
import { ThemedText } from '../texts/ThemedText'
import { testIdWithKey } from '../../utils/testable'
import useCredentialCardStyles from '../../hooks/credential-card-styles'
import CardWatermark from '../misc/CardWatermark'
import CredentialCardStatusBadge from './CredentialCardStatusBadge'
import CredentialCardAttributeList from './CredentialCardAttributeList'
import CredentialCardSecondaryBody from './CredentialCardSecondaryBody'

type Props = {
  data: WalletCredentialCardData
  onPress?: () => void
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  elevated?: boolean
}

/**
 * Card10Pure: overlay-free Card 10 UI that renders from WalletCredentialCardData.
 * - Passes 'Branding10' to the style hook for layout differences.
 * - No OCA resolution or overlay usage at render time.
 */
const Card10Pure: React.FC<Props> = ({ data, onPress, elevated, hasAltCredentials, onChangeAlt }) => {
  const { branding, hideSlice } = data
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
  const dataLabels = list.map((f) => `${f.label}, ${f.value ?? ''}`).join(', ')
  const accessibilityLabel = `${issuerAccessibilityLabel}, ${data.credentialName}, ${dataLabels}`

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
      <CredentialCardAttributeList
        list={list}
        textColor={textColor}
        showPiiWarning={!!data.proofContext}
        isNotInWallet={data.notInWallet}
        hasAltCredentials={hasAltCredentials}
        onChangeAlt={onChangeAlt}
        helpActionUrl={data.helpActionUrl}
        styles={styles}
      />
    </View>
  )

  const Main = () => (
    <View style={styles.cardContainer} accessible accessibilityLabel={accessibilityLabel}>
      <CredentialCardSecondaryBody
        hideSlice={hideSlice}
        secondaryBg={branding.secondaryBg}
        backgroundSliceUri={branding.backgroundSliceUri}
        borderRadius={borderRadius}
        containerStyle={styles.secondaryBodyContainer}
      />
      {/* Card10 places everything in the main body after a slim slice */}
      <PrimaryBody />
      <CredentialCardStatusBadge status={data.status} logoHeight={logoHeight} containerStyle={styles.statusContainer} />
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
