import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { useTheme } from '../../contexts/theme'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
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
    >
      <Icon name="menu" size={24} color={ColorPallet.brand.headerIcon}></Icon>
    </TouchableOpacity>
  )
}

export default SettingsMenu
