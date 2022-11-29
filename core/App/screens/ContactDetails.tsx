import { useConnectionById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Label from '../components/texts/Label'
import SafeAreaScrollView from '../components/views/SafeAreaScrollView'
import { dateFormatOptions } from '../constants'
import { ContactStackParams, Screens } from '../types/navigators'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

const ContactDetails: React.FC<ContactDetailsProps> = ({ navigation, route }) => {
  const { connectionId } = route?.params
  const { t } = useTranslation()
  const connection = useConnectionById(connectionId)

  useEffect(() => {
    navigation.setOptions({
      headerTitle: connection?.alias,
    })
  }, [])

  return (
    <SafeAreaScrollView>
      <Label title={t('ContactDetails.Created')} subtitle={JSON.stringify(connection?.createdAt)} />
      <Label title={t('ContactDetails.ConnectionState')} subtitle={connection?.state} />
    </SafeAreaScrollView>
  )
}

export default ContactDetails
