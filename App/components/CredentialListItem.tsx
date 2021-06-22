import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface Props {
  credential: any
}

const CredentialListItem: React.FC<Props> = ({ credential }) => {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      key={credential.id}
      onPress={() => {
        navigation.navigate('CredentialDetails', { alias: credential.alias })
      }}
      style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}
    >
      <Text style={{ fontSize: 20 }}>{credential.alias ? credential.alias : credential.invitation.label}</Text>
      <Icon name="chevron-right" size={30} style={{ bottom: 2 }} />
    </TouchableOpacity>
  )
}

export default CredentialListItem

const styles = StyleSheet.create({})
