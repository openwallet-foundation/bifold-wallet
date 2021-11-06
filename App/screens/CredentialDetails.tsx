import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Text, Label } from 'components'

interface Props {
  navigation: any
  route: any
}

const CredentialDetails: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation()
  
  const { credential } = route?.params?.credential

  const {
    attributes: { first_name, last_name, gender, age },
  } = credential

  useEffect(() => {
    navigation.setOptions({
      title: route?.params?.alias,
    })
  }, [])

  return (
    <SafeAreaScrollView>
      <Text>{first_name}</Text>
      <Text>{last_name}</Text>
      <Label title={t('CredentialDetails.gender')} subtitle={gender} />
      <Label title={t('CredentialDetails.age')} subtitle={age} />
    </SafeAreaScrollView>
  )
}

export default CredentialDetails
