import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { ColorPallet, TextTheme } from '../theme'
import { CredentialStackParams, Screens } from '../types/navigators'

import CredentialCard from 'components/misc/CredentialCard'
import Record from 'components/record/Record'
import { ToastType } from 'components/toast/BaseToast'

interface CredentialDetailsProps {
  navigation: StackNavigationProp<CredentialStackParams>
  route: RouteProp<CredentialStackParams, Screens.CredentialDetails>
}

const styles = StyleSheet.create({
  headerText: {
    ...TextTheme.normal,
  },
  footerText: {
    ...TextTheme.normal,
    paddingTop: 16,
  },
  linkContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
})

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  const { t } = useTranslation()

  const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
    try {
      if (!credentialId) {
        throw new Error(t('CredentialOffer.CredentialNotFound'))
      }

      return useCredentialById(credentialId)
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('CredentialOffer.CredentialNotFound'),
      })

      navigation.goBack()
    }
  }

  if (!route.params.credentialId) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()
    return null
  }

  const credential = getCredentialRecord(route.params.credentialId)

  if (!credential) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()
    return null
  }

  return (
    <Record
      header={() => <CredentialCard credential={credential} style={{ marginHorizontal: 15, marginTop: 16 }} />}
      footer={() => (
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity activeOpacity={1}>
            <Text style={[styles.footerText, styles.link, { color: ColorPallet.semantic.error }]}>
              {t('CredentialDetails.RemoveFromWallet')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      attributes={credential.credentialAttributes}
      hideAttributeValues={true}
    />
  )
}

export default CredentialDetails
