import React from 'react'
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface ScanTabProps {
  onPress: () => void
  active: boolean
  iconName: string
  title: string
}

const ScanTab: React.FC<ScanTabProps> = ({ onPress, active, iconName, title }) => {
  const { TabTheme, TextTheme } = useTheme()
  const { fontScale } = useWindowDimensions()
  const showLabels = fontScale * TabTheme.tabBarTextStyle.fontSize < 18

  const styles = StyleSheet.create({
    container: {
      ...TabTheme.tabBarContainerStyle,
    },
    text: {
      ...TabTheme.tabBarTextStyle,
      color: active ? TabTheme.tabBarActiveTintColor : TabTheme.tabBarInactiveTintColor,
      fontWeight: active ? TextTheme.bold.fontWeight : TextTheme.normal.fontWeight,
    },
  })
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityLabel={title}
      testID={testIdWithKey(title)}
    >
      <Icon name={iconName} size={30} color={styles.text.color}></Icon>
      {showLabels ? <Text style={styles.text}>{title}</Text> : null}
    </TouchableOpacity>
  )
}

export default ScanTab
