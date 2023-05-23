import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

const iconSize = 24

const styles = StyleSheet.create({
  button: {
    marginRight: 0,
    marginLeft: 15,
    minWidth: iconSize,
  },
})

const SettingsMenu: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={t('Screens.Settings')}
      testID={testIdWithKey('Settings')}
      style={styles.button}
      onPress={() => navigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })}
      hitSlop={hitSlop}
    >
      <Icon name="menu" size={iconSize} color={ColorPallet.brand.headerIcon}></Icon>
    </TouchableOpacity>
  )
}

export default SettingsMenu
