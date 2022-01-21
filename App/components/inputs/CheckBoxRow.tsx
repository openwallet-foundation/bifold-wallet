import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors } from '../../theme'
import Text from '../texts/Text'

interface Props {
  title: string
  accessibilityLabel?: string
  checked: boolean
  onPress: () => void
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 10,
  },
})

const CheckBoxRow: React.FC<Props> = ({ title, accessibilityLabel, checked, onPress }) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false

  return (
    <View style={styles.container}>
      <TouchableOpacity accessible={accessible} accessibilityLabel={accessibilityLabel} onPress={onPress}>
        {checked ? (
          <Icon name={'check-box'} size={30} color={Colors.primary} />
        ) : (
          <Icon name={'check-box-outline-blank'} size={30} color={Colors.primary} />
        )}
      </TouchableOpacity>
      <Text>{title}</Text>
    </View>
  )
}

export default CheckBoxRow
