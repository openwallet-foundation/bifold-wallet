import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useTheme } from '../../../contexts/theme'

interface CredentialRowCardProps {
  name: string
  issuer?: string
  onPress?(): void
  bgColor?: string
  hideBorder?: boolean
  showFullText?: boolean
}

export function OpenIDCredentialRowCard({ name, issuer, bgColor, onPress }: CredentialRowCardProps) {
  const { TextTheme } = useTheme()
  const { width } = useWindowDimensions()

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
      width: '30%',
      backgroundColor: 'red',
      marginRight: 10,
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
  })
  //
  return (
    <View style={style.container}>
      <TouchableOpacity onPress={onPress} style={style.rowContainer}>
        <View style={[style.issuerBadge, bgColor ? { backgroundColor: bgColor } : {}]} />
        <View style={[style.infoContainer, issuer ? { justifyContent: 'center' } : {}]}>
          <Text style={TextTheme.title}>{name}</Text>
          {issuer && <Text style={TextTheme.labelSubtitle}>{issuer}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  )
}
