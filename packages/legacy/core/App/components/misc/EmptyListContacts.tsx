import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'

export interface EmptyListProps {
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const EmptyListContacts: React.FC<EmptyListProps> = ({ navigation }) => {
  const { t } = useTranslation()
  const { ListItems, Assets, ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      paddingTop: 100,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    text: {
      textAlign: 'center',
      paddingTop: 10,
    },
    fakeLink: {
      ...TextTheme.normal,
      color: ColorPallet.notification.infoText,
      textDecorationLine: 'underline',
    },
  })

  const navigateToWhatAreContacts = () => {
    navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.WhatAreContacts })
  }

  return (
    <View style={styles.container}>
      <Assets.svg.contactBook fill={ListItems.emptyList.color} height={120} />
      <Text style={[TextTheme.headingThree, styles.text, { paddingTop: 30 }]}>{t('Contacts.EmptyList')}</Text>
      <Text style={[ListItems.emptyList, styles.text]}>{t('Contacts.PeopleAndOrganizations')}</Text>
      <Text
        style={[styles.fakeLink, styles.text]}
        onPress={navigateToWhatAreContacts}
        testID={testIdWithKey('WhatAreContacts')}
      >
        {t('Contacts.WhatAreContacts')}
      </Text>
    </View>
  )
}

export default EmptyListContacts
