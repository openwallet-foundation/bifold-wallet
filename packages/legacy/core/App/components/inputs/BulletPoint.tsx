import * as React from 'react'
import { StyleSheet, View, StyleProp, TextStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

interface BulletPointProps {
  text: string
  textStyle: StyleProp<TextStyle>
}

const BulletPoint: React.FC<BulletPointProps> = ({ text, textStyle }) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    iconContainer: {
      marginRight: 10,
      marginVertical: 6,
    },
  })

  return (
    <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={styles.iconContainer}>
        <Icon name={'circle'} size={9} color={ColorPallet.brand.modalIcon} />
      </View>
      <ThemedText style={[textStyle, { flexShrink: 1 }]}>{text}</ThemedText>
    </View>
  )
}

export default BulletPoint
