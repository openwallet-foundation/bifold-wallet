import React, { useEffect } from 'react'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import type { ContactStackParams } from 'navigators/ContactStack'
import { useConnectionById } from '@aries-framework/react-hooks'

import { SafeAreaScrollView, Label } from 'components'

interface Props {
  navigation: StackNavigationProp<ContactStackParams, 'Contact Details'>
  route: RouteProp<ContactStackParams, 'Contact Details'>
}

const ContactDetails: React.FC<Props> = ({ navigation, route }) => {
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
