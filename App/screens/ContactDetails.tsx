import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

function ContactDetails() {
  const navigation = useNavigation()
  const route = useRoute()

  useEffect(() => {
    navigation.setOptions({
      title: route?.params?.alias,
    })
  }, [])

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <Text>...other info, idk</Text>
    </View>
  )
}

export default ContactDetails
