import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'

import { SafeAreaScrollView, Text } from 'components'
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
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  const credential = getCredentialRecord(route?.params?.credentialId)

  if (!credential) {
    Toast.show({
      type: 'error',
      text1: t('CredentialOffer.CredentialNotFound'),
    })
    navigation.goBack()
    return null
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
