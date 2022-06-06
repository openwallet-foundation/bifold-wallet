import type { CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'

import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'

import { CredentialStackParams, Screens } from '../../types/navigators'
import CredentialCard from '../misc/CredentialCard'

interface CredentialListItemProps {
  credential: CredentialRecord
  revoked?: boolean
}

const CredentialListItem: React.FC<CredentialListItemProps> = ({ credential, revoked = false }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={t('Credentials.CredentialDetails')}
      onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: credential.id })}
    >
      <CredentialCard credential={credential} revoked={revoked} />
    </TouchableOpacity>
  )
}

export default CredentialListItem
