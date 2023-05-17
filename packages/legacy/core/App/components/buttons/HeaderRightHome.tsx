import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { Screens, TabStacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

const defaultIconSize = 26

const HeaderRightHome: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { ColorPallet } = useTheme()
  const style = StyleSheet.create({
    container: {
      marginRight: 14,
    },
  })

  return (
    <TouchableOpacity
      accessibilityLabel={t('Global.Home')}
      testID={testIdWithKey('HomeButton')}
      style={[style.container]}
      onPress={() => {
        navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
      }}
      hitSlop={hitSlop}
    >
      <Icon name="home" size={defaultIconSize} color={ColorPallet.brand.headerIcon} />
    </TouchableOpacity>
  )
}

export default HeaderRightHome
