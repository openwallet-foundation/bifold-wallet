import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface Props {
  onPress: () => void
  active: boolean
  iconName: string
  title: string
}

const ScanTab: React.FC<Props> = ({ onPress, active, iconName, title }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.grayscale.white,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    text: {
      ...TextTheme.normal,
    },
    textActive: {
      color: ColorPallet.brand.primary,
    },
  })
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityLabel={title}
      testID={testIdWithKey(title)}
    >
      <Icon name={iconName} size={20} color={active ? styles.textActive.color : styles.text.color}></Icon>
      <Text style={[styles.text, active && styles.textActive]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default ScanTab
