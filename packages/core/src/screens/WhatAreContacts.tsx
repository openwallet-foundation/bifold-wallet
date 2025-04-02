import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'

import Link from '../components/texts/Link'
import { useTheme } from '../contexts/theme'
import { Screens, Stacks } from '../types/navigators'
import { ThemedText } from '../components/texts/ThemedText'

interface WhatAreContactsProps {
  navigation: NavigationProp<ParamListBase>
}

const WhatAreContacts: React.FC<WhatAreContactsProps> = ({ navigation }) => {
  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    pageContent: {
      marginTop: 30,
      paddingLeft: 25,
      paddingRight: 25,
    },
  })

  const goToContactList = () => {
    navigation.getParent()?.navigate(Stacks.ContactStack, { screen: Screens.Contacts })
  }

  const bulletPoints = [
    t('WhatAreContacts.ListItemDirectMessage'),
    t('WhatAreContacts.ListItemNewCredentials'),
    t('WhatAreContacts.ListItemNotifiedOfUpdates'),
    t('WhatAreContacts.ListItemRequest'),
  ].map((text, index) => {
    return (
      <View key={index} style={{ marginBottom: 10, flexDirection: 'row' }}>
        <ThemedText style={{ paddingRight: 5 }}>{'\u2022'}</ThemedText>
        <ThemedText style={{ flexShrink: 1 }}>{text}</ThemedText>
      </View>
    )
  })

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        directionalLockEnabled
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
      >
        <ThemedText variant="headingTwo" style={{ marginBottom: 15 }} accessibilityRole="header">
          {t('WhatAreContacts.Title')}
        </ThemedText>
        <ThemedText>{t('WhatAreContacts.Preamble')}</ThemedText>
        {bulletPoints}
        <ThemedText>
          {`${t('WhatAreContacts.RemoveContacts')} `}
          <Link linkText={t('WhatAreContacts.ContactsLink')} onPress={goToContactList} />
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  )
}

export default WhatAreContacts
