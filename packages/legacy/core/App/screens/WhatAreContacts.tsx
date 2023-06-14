import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

import { useTheme } from '../contexts/theme'
import { Screens, Stacks } from '../types/navigators'

interface WhatAreContactsProps {
  navigation: NavigationProp<ParamListBase>
}

const WhatAreContacts: React.FC<WhatAreContactsProps> = ({ navigation }) => {
  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    title: {
      ...TextTheme.headingTwo,
      marginBottom: 15,
    },
    pageContent: {
      marginTop: 30,
      paddingLeft: 25,
      paddingRight: 25,
    },
    fakeLink: {
      color: ColorPallet.brand.link,
      textDecorationLine: 'underline',
    },
  })

  const goToContactList = () => {
    navigation
      .getParent()
      ?.navigate(Stacks.ContactStack, { screen: Screens.Contacts, params: { navigation: navigation } })
  }

  const bulletPoints = [
    t('WhatAreContacts.ListItemDirectMessage'),
    t('WhatAreContacts.ListItemNewCredentials'),
    t('WhatAreContacts.ListItemNotifiedOfUpdates'),
    t('WhatAreContacts.ListItemRequest'),
  ].map((text, index) => {
    return (
      <View key={index} style={{ marginBottom: 10, flexDirection: 'row' }}>
        <Text style={{ ...TextTheme.normal, paddingRight: 5 }}>{'\u2022'}</Text>
        <Text style={[TextTheme.normal, { flexShrink: 1 }]}>{text}</Text>
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
        <Text style={styles.title}>{t('WhatAreContacts.Title')}</Text>
        <Text style={TextTheme.normal}>{t('WhatAreContacts.Preamble')}</Text>
        {bulletPoints}
        <Text style={[TextTheme.normal, { marginBottom: 30 }]}>
          {`${t('WhatAreContacts.RemoveContacts')} `}
          <Text onPress={goToContactList} style={[TextTheme.normal, styles.fakeLink]}>
            {t('WhatAreContacts.ContactsLink')}.
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default WhatAreContacts
