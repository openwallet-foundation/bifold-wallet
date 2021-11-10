import type { CredentialRecord } from '@aries-framework/core'
import type { StackNavigationProp } from '@react-navigation/stack'

import { useCredentials } from '@aries-framework/react-hooks'
import styled, { css } from '@emotion/native'
import { useTheme } from '@emotion/react'
import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, TouchableOpacity, View } from 'react-native'

import { backgroundColor } from '../globalStyles'

import { CredentialListItem, Text } from 'components'

const ItemContainer = styled.TouchableOpacity``

const MessageText = styled.View`
  text-align: 'center';
  margin: 100px;
`

const ListCredentials: React.FC = () => {
  const { credentials } = useCredentials()
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<any, any>>()
  const theme = useTheme()

  const onItemSelected = (credential: CredentialRecord) => {
    navigation.navigate('Credential Details', { credential })
  }

  const emptyListComponent = () => <MessageText>{t('None yet!')}</MessageText>

  const keyForItem = (item: CredentialRecord) => String(item.credentialId)

  return (
    <FlatList
      data={credentials}
      style={css`
        background-color: ${theme.colors.backgroundColor};
      `}
      keyExtractor={keyForItem}
      ListEmptyComponent={emptyListComponent}
      renderItem={({ item, index }) => (
        <ItemContainer key={item.id} onPress={() => onItemSelected(item)} activeOpacity={0.8}>
          <CredentialListItem credential={item} />
        </ItemContainer>
      )}
    />
  )
}

export default ListCredentials
