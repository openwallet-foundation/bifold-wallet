import { useConnectionById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect } from 'react'

import { ContactStackParams, Screens } from '../types/navigators'

import { SafeAreaScrollView, Label } from 'components'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

const ContactDetails: React.FC<ContactDetailsProps> = ({ navigation, route }) => {
  const connectionId = route?.params?.connectionId.connectionId
  const connection = useConnectionById(connectionId)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: connection?.alias,
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
