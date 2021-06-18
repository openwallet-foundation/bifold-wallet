import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface Props {
  title: string
  checked: boolean
  onPress: () => void
}

const CheckBoxRow: React.FC<Props> = ({ title, checked, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        {checked ? (
          <Icon name={'check-box'} size={30} color={'#35823f'} />
        ) : (
          <Icon name={'check-box-outline-blank'} size={30} />
        )}
      </TouchableOpacity>
      <Text>{title}</Text>
    </View>
  )
}

export default CheckBoxRow

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 10,
  },
})
