import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { ColorPallet } from '../../theme'
import { RootStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

const iconSize = 24

const styles = StyleSheet.create({
  button: {
    marginRight: 10,
    marginLeft: 0,
    minWidth: iconSize,
  },
})

type InfoProps = {
  connectionId: string
}

const InfoIcon: React.FC<InfoProps> = ({ connectionId }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      testID={testIdWithKey('Settings')}
      accessible={true}
      accessibilityLabel={t('Screens.Settings')}
      style={styles.button}
      onPress={() =>
        navigation.navigate(Stacks.ContactStack, {
          screen: Screens.ContactDetails,
          params: { connectionId: connectionId },
        })
      }
      hitSlop={hitSlop}
    >
      <Icon name="information" size={iconSize} color={ColorPallet.brand.headerIcon}></Icon>
    </TouchableOpacity>
  )
}

export default InfoIcon
