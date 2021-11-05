import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { mainColor } from '../../globalStyles'
import Text from '../texts/Text'

interface Props {
  title: string
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

const CheckBoxRow: React.FC<Props> = ({ title, checked, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        {checked ? (
          <Icon name={'check-box'} size={30} color={mainColor} />
        ) : (
          <Icon name={'check-box-outline-blank'} size={30} color={mainColor} />
        )}
      </TouchableOpacity>
      <Text>{title}</Text>
    </View>
  )
}

export default CheckBoxRow
