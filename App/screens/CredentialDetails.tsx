import React, { useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

function CredentialDetails() {
  const navigation = useNavigation()
  const route = useRoute()

  useEffect(() => {
    navigation.setOptions({
      title: route?.params?.alias,
      headerBackTitleVisible: false,
    })
  }, [])

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <Text>...other info, idk</Text>
    </View>
  )
}

export default CredentialDetails
