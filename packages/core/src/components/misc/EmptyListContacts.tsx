import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ContactStackParams, Screens, Stacks } from '../../types/navigators'
import Link from '../texts/Link'
import { ThemedText } from '../texts/ThemedText'

export interface EmptyListProps {
  navigation: StackNavigationProp<ContactStackParams, Screens.Contacts>
}

const EmptyListContacts: React.FC<EmptyListProps> = ({ navigation }) => {
  const { t } = useTranslation()
  const { ListItems, Assets, ColorPalette } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      paddingTop: 100,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    text: {
      textAlign: 'center',
      marginTop: 10,
    },
    link: {
      textAlign: 'center',
      marginTop: 10,
      alignSelf: 'center',
    },
  })

  const navigateToWhatAreContacts = () => {
    navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.WhatAreContacts })
  }

  return (
    <View style={styles.container}>
      <Assets.svg.contactBook fill={ListItems.emptyList.color} height={120} />
      <ThemedText variant="headingThree" style={[styles.text, { marginTop: 30 }]} accessibilityRole="header">
        {t('Contacts.EmptyList')}
      </ThemedText>
      <ThemedText style={[ListItems.emptyList, styles.text]}>{t('Contacts.PeopleAndOrganizations')}</ThemedText>
      <Link style={styles.link} linkText={t('Contacts.WhatAreContacts')} onPress={navigateToWhatAreContacts} />
    </View>
  )
}

export default EmptyListContacts
