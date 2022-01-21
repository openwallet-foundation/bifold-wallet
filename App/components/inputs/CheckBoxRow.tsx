import React from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors, TextTheme } from '../../Theme'

interface Props {
  title: string
  accessibilityLabel?: string
  checked: boolean
  onPress: () => void
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  text: {
    flexShrink: 1,
    ...TextTheme.normal,
    marginLeft: 10,
  },
})

const CheckBoxRow: React.FC<Props> = ({ title, accessibilityLabel, checked, onPress }) => {
  const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false

  return (
    <View style={style.container}>
      <TouchableOpacity accessible={accessible} accessibilityLabel={accessibilityLabel} onPress={onPress}>
        {checked ? (
          <Icon name={'check-box'} size={36} color={Colors.primary} />
        ) : (
          <Icon name={'check-box-outline-blank'} size={36} color={Colors.primary} />
        )}
      </TouchableOpacity>
      <Text style={[style.text]}>{title}</Text>
    </View>
  )
}

export default CheckBoxRow
