import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Label, Text } from 'components'

interface Props {
  navigation: any
  route: any
}

const ContactDetails: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation()

  const { alias, invitation, createdAt, state } = route?.params?.contact

  useEffect(() => {
    navigation.setOptions({
      title: alias,
    })
  }, [])

  return (
    <SafeAreaScrollView>
      <Label title={t('ContactDetails.created')} subtitle={JSON.stringify(createdAt)} />
      <Label title={t('ContactDetails.connectionState')} subtitle={state} />
    </SafeAreaScrollView>
  )
}

export default ContactDetails
