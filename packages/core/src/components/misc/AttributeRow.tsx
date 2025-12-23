import React from 'react'
import { View, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ThemedText } from '../texts/ThemedText'
import type { CardAttribute } from '../../wallet/ui-types'

type Props = {
  item: CardAttribute
  textColor: string
  showPiiWarning: boolean
  isNotInWallet?: boolean
  styles: any // ideally type this from your style hook return
}

function isDataImage(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\//.test(value)
}

export const CredentialAttributeRow: React.FC<Props> = ({ item, textColor, showPiiWarning, isNotInWallet, styles }) => {
  const warn = showPiiWarning && (item.isPII ?? false) && !item.predicate?.present

  const predicateFailed = item.predicate?.present && item.predicate.satisfied === false
  const hasError = Boolean(isNotInWallet || item.hasError || predicateFailed)

  if (hasError) {
    const errorText = isNotInWallet
      ? 'Not available in your wallet'
      : predicateFailed
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

      {isDataImage(item.value) ? (
        <Image style={styles.imageAttr} source={{ uri: item.value }} />
      ) : (
        <ThemedText variant="bold" style={[styles.textContainer, { color: textColor }]}>
          {String(item.value ?? '')}
        </ThemedText>
      )}
    </View>
  )
}
