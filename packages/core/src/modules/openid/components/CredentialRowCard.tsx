import { Image, StyleSheet, Text, useWindowDimensions, View, TouchableOpacity } from 'react-native'
import { useTheme } from '../../../contexts/theme'

interface CredentialRowCardProps {
  name: string
  issuer?: string
  onPress?(): void
  bgColor?: string
  bgImage?: string
  txtColor?: string
  hideBorder?: boolean
  showFullText?: boolean
}

export function OpenIDCredentialRowCard({ name, issuer, bgColor, bgImage, txtColor, onPress }: CredentialRowCardProps) {
  const { TextTheme } = useTheme()
  const { width } = useWindowDimensions()

  const badgeWidth = 0.25 * width
  const badgeHeight = 0.6 * badgeWidth

  const style = StyleSheet.create({
    container: {},
    rowContainer: {
      flexDirection: 'row',
      borderRadius: 8,
      backgroundColor: '#202020',
      padding: 5,
      minHeight: 0.2 * width,
    },
    issuerBadge: {
      borderRadius: 8,
      width: badgeHeight,
      height: badgeHeight,
      backgroundColor: 'red',
      marginRight: 10,
      overflow: 'hidden',
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    imageStyle: { width: badgeWidth, height: badgeHeight, borderRadius: 8 },
  })
  //
  return (
    <View style={style.container}>
      <TouchableOpacity
        onPress={onPress}
        style={style.rowContainer}
        accessibilityLabel={name}
        accessibilityRole="button"
      >
        <View style={[style.issuerBadge, bgColor ? { backgroundColor: bgColor } : {}]}>
          {bgImage ? <Image style={style.imageStyle} source={{ uri: bgImage }} resizeMode="cover" /> : null}
        </View>
        <View style={[style.infoContainer, issuer ? { justifyContent: 'center' } : {}]}>
          <Text style={[TextTheme.title, txtColor ? { color: txtColor } : {}]}>{name}</Text>
          {issuer && <Text style={[TextTheme.labelSubtitle, txtColor ? { color: txtColor } : {}]}>{issuer}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  )
}
