import { useConnectionById } from '@aries-framework/react-hooks'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect } from 'react'

import { SafeAreaScrollView, Label } from 'components'
import { ContactStackParams, Screens } from 'types/navigators'

interface ContactDetailsProps {
  navigation: StackNavigationProp<ContactStackParams>
  route: RouteProp<ContactStackParams, Screens.ContactDetails>
}

const ContactDetails: React.FC<ContactDetailsProps> = ({ navigation, route }) => {
  const connection = useConnectionById(route?.params?.connectionId)

  useEffect(() => {
    navigation.setOptions({
      title: connection?.alias,
    })
  }, [])

  return (
    <SafeAreaScrollView>
      <Label title="Created" subtitle={JSON.stringify(connection?.createdAt)} />
      <Label title="Connection State" subtitle={connection?.state} />
    </SafeAreaScrollView>
  )
}

export default ContactDetails
