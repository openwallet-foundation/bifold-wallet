import type { StackNavigationProp } from '@react-navigation/stack'
import type { CredentialStackParams } from 'navigators/CredentialStack'

import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Text } from 'components'
interface ICredentialDetailsProps {
  navigation: StackNavigationProp<CredentialStackParams, 'Credential Details'>
  route: RouteProp<CredentialStackParams, 'Credential Details'>
}

const CredentialDetails: React.FC<ICredentialDetailsProps> = ({ route }) => {
  const credential = route.params
  const { t } = useTranslation()

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
