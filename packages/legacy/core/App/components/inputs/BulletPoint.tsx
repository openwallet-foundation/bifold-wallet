import * as React from 'react'
import { StyleSheet, Text, View, StyleProp, TextStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'

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
      <Text style={[textStyle, { flexShrink: 1 }]}>{text}</Text>
    </View>
  )
}

export default BulletPoint
