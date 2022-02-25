import type { CredentialRecord } from '@aries-framework/core'
import type { StackNavigationProp } from '@react-navigation/stack'

import { useNavigation } from '@react-navigation/core'
import { DateTime } from 'luxon'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'

import { CredentialStackParams, Screens } from '../../types/navigators'

import CredentialCard from 'components/misc/CredentialCard'

interface CredentialListItemProps {
  credential: CredentialRecord
}

const CredentialListItem: React.FC<CredentialListItemProps> = ({ credential }) => {
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  const { t } = useTranslation()

  return (
    <TouchableOpacity onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: credential.id })}>
      <CredentialCard credential={credential} />
    </TouchableOpacity>
  )
}

export default CredentialListItem
