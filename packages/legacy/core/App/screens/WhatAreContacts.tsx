import { NavigationProp, ParamListBase } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'

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
      marginHorizontal: 15,
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageContent}>
        <Text style={styles.title}>{t('WhatAreContacts.Title')}</Text>
        <Text style={TextTheme.normal}>{t('WhatAreContacts.Preamble')}</Text>
        <FlatList
          style={{ marginTop: 15, flexGrow: 0 }}
          scrollEnabled={false}
          data={[
            { key: t('WhatAreContacts.ListItemDirectMessage') },
            { key: t('WhatAreContacts.ListItemNewCredentials') },
            { key: t('WhatAreContacts.ListItemNotifiedOfUpdates') },
            { key: t('WhatAreContacts.ListItemRequest') },
          ]}
          renderItem={({ item }) => {
            return (
              <View style={{ marginBottom: 10, flexDirection: 'row' }}>
                <Text style={{ ...TextTheme.normal, marginRight: 5 }}>{'\u2022'}</Text>
                <Text style={[TextTheme.normal, { flexShrink: 1, flexWrap: 'wrap' }]}>{item.key}</Text>
              </View>
            )
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}></View>
        <Text style={TextTheme.normal}>
          {t('WhatAreContacts.RemoveContacts') + ' '}
          <Text onPress={goToContactList} style={[TextTheme.normal, styles.fakeLink]}>
            {t('WhatAreContacts.ContactsLink')}.
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default WhatAreContacts
