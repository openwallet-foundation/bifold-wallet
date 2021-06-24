import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Text } from 'components'

interface Props {
  credential: any
}

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      key={credential.id}
      onPress={() => {
        navigation.navigate('CredentialDetails', { credential })
      }}
      style={styles.container}
    >
      <Text style={styles.text}>{credential.alias || credential.invitation.label}</Text>
      <Icon name="chevron-right" size={30} style={{ bottom: 2 }} />
    </TouchableOpacity>
  )
}

export default CredentialListItem

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 20,
  },
})
