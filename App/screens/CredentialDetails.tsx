import type { StackNavigationProp } from '@react-navigation/stack'
import type { CredentialStackParams } from 'navigators/CredentialStack'

import { RouteProp } from '@react-navigation/native'
import React from 'react'

import { SafeAreaScrollView, Text } from 'components'

interface ICredentialDetailsProps {
  navigation: StackNavigationProp<CredentialStackParams, 'Credential Details'>
  route: RouteProp<CredentialStackParams, 'Credential Details'>
}

const CredentialDetails: React.FC<ICredentialDetailsProps> = ({ route }) => {
  const credential = route.params

  return (
    <SafeAreaScrollView>
      <Text>Id: {credential.connectionId}</Text>
      <Text>Created At: {credential.createdAt.toISOString()}</Text>
    </SafeAreaScrollView>
  )
}

export default CredentialDetails
