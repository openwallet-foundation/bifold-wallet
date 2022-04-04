import type { CredentialRecord } from '@aries-framework/core'

import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'

import { CredentialStackParams, Screens } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import CredentialCard from '../misc/CredentialCard'

interface CredentialListItemProps {
  credential: CredentialRecord
}

const CredentialListItem: React.FC<CredentialListItemProps> = ({ credential }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={t('Credentials.CredentialDetails')}
      testID={testIdWithKey('CredentialDetails')}
      onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: credential.id })}
    >
      <CredentialCard credential={credential} />
    </TouchableOpacity>
  )
}

export default CredentialListItem
