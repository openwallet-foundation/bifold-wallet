import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { ColorPallet } from '../../theme'
import { ContactStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
  },
})

type InfoProps = {
  connectionId: any
}

const InfoIcon: React.FC<InfoProps> = ({ connectionId }: any) => {
  const navigation = useNavigation<StackNavigationProp<ContactStackParams>>()
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      testID={testIdWithKey('Settings')}
      accessible={true}
      accessibilityLabel={t('Screens.Settings')}
      style={styles.button}
      onPress={() => navigation.navigate(Screens.ContactDetails, { connectionId: connectionId })}
    >
      <Icon name="information" size={24} color={ColorPallet.grayscale.white}></Icon>
    </TouchableOpacity>
  )
}

export default InfoIcon
