import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'

import { SafeAreaScrollView, Text } from 'components'
import { ToastType } from 'components/toast/BaseToast'
import { CredentialStackParams } from 'types/navigators'

interface CredentialDetailsProps {
  navigation: StackNavigationProp<CredentialStackParams, 'Credential Details'>
  route: RouteProp<CredentialStackParams, 'Credential Details'>
}

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

    return
  }

  const credential = getCredentialRecord(route.params.credentialId)

  if (!credential) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()

    return
  }

  return (
    <SafeAreaScrollView>
      <Text>
        {t('CredentialDetails.Id')} {credential.connectionId}
      </Text>
      <Text>
        {t('CredentialDetails.CreatedAt')} {credential.createdAt.toISOString()}
      </Text>
    </SafeAreaScrollView>
  )
}

export default CredentialDetails
