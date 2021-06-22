import React, { useEffect } from 'react'
import { View, Text } from 'react-native'

interface Props {
  navigation: any
  route: any
}

const ContactDetails: React.FC<Props> = ({ navigation, route }) => {
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
