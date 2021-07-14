import React from 'react'
import { View, StyleSheet } from 'react-native'

import Title from '../texts/Title'

import { shadow } from '../../globalStyles'

interface Props {
  credential: any
}

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  return (
    <View key={credential.id} style={styles.container}>
      <Title>{credential.alias || credential.invitation.label}</Title>
    </View>
  )
}

export default CredentialListItem

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: shadow,
  },
})
