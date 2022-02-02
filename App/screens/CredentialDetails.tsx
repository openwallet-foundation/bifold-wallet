import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

import { Colors, CredentialTheme, TextTheme } from '../theme'

import { CredentialListItem } from 'components'
import { CredentialStackParams } from 'types/navigators'

interface CredentialDetailsProps {
  navigation: StackNavigationProp<CredentialStackParams, 'Credential Details'>
  route: RouteProp<CredentialStackParams, 'Credential Details'>
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.background,
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  headerText: {
    ...TextTheme.normal,
  },
  footerContainer: {
    backgroundColor: CredentialTheme.background,
    height: '100%',
    paddingVertical: 16,
    paddingHorizontal: 25,
  },
  footerText: {
    ...TextTheme.normal,
    paddingTop: 16,
  },
  listItem: {
    paddingHorizontal: 25,
    paddingTop: 16,
    backgroundColor: CredentialTheme.background,
  },
  listItemBorder: {
    borderBottomColor: Colors.background,
    borderBottomWidth: 2,
    paddingTop: 12,
  },
  linkContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
  },
  link: {
    ...TextTheme.normal,
    color: Colors.link,
  },
  textContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
  text: {
    ...TextTheme.normal,
  },
  label: {
    ...TextTheme.label,
  },
  credentialValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
})

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const [shown, setShown] = useState<boolean[]>([])

  const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
    try {
      if (!credentialId) {
        throw new Error(t('CredentialOffer.CredentialNotFound'))
      }
      return useCredentialById(credentialId)
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  if (!route.params.credentialId) {
    Toast.show({
      type: 'error',
      text1: t('CredentialOffer.CredentialNotFound'),
    })
    navigation.goBack()
    return null
  }

  const credential = getCredentialRecord(route.params.credentialId)

  if (!credential) {
    Toast.show({
      type: 'error',
      text1: t('CredentialOffer.CredentialNotFound'),
    })
    navigation.goBack()
    return null
  }

  const resetShown = (): void => {
    setShown((credential.credentialAttributes || []).map(() => false))
  }

  useEffect(() => {
    resetShown()
  }, [])

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View style={styles.headerContainer}>
          <CredentialListItem credential={credential}></CredentialListItem>
          <View style={styles.headerTextContainer}>
            <TouchableOpacity style={styles.linkContainer} activeOpacity={1} onPress={() => resetShown()}>
              <Text style={[styles.headerText, styles.link]}>Hide all</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.footerContainer}>
          <TouchableOpacity activeOpacity={1}>
            <Text style={[styles.footerText, styles.link]}>{t('CredentialDetails.PrivacyPolicy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}>
            <Text style={[styles.footerText, styles.link]}>{t('CredentialDetails.TermsAndConditions')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}>
            <Text style={[styles.footerText, styles.link, { color: Colors.error }]}>
              {t('CredentialDetails.RemoveFromWallet')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      data={credential.credentialAttributes}
      renderItem={({ item: attribute, index }) => (
        <View style={styles.listItem}>
          <Text style={styles.label}>{startCase(attribute.name)}</Text>
          <View style={styles.credentialValueContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{shown[index] ? attribute.value : Array(10).fill('\u2022').join('')}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                const newShowState = [...shown]
                newShowState[index] = !shown[index]
                setShown(newShowState)
              }}
              style={styles.linkContainer}
            >
              <Text style={styles.link}>
                {shown[index] ? t('CredentialDetails.Hide') : t('CredentialDetails.Show')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listItemBorder}></View>
        </View>
      )}
    ></FlatList>
  )
}

export default CredentialDetails
