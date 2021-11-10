import type { CredentialRecord } from '@aries-framework/core'

import styled from '@emotion/native'
import React from 'react'
import { View, StyleSheet } from 'react-native'

import { shadow, borderRadius } from '../../globalStyles'
import { parseSchema } from '../../helpers'
import { schemaDescriptionFromID } from '../../utils/schema'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  credential: CredentialRecord
}

const Container = styled.View`
  margin-top: 15px;
  margin-horizontal: 10px;
  padding: 10px;
  border-radius 10px;
  background-color: ${(props) => props.theme.colors.shadow};
`

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  return (
    <Container>
      <Title>{parseSchema(credential.metadata.schemaId)}</Title>
    </Container>
  )
}

export default CredentialListItem
