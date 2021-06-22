import React, { useEffect } from 'react'

import { SafeAreaScrollView, Text } from 'components'

interface Props {
  navigation: any
  route: any
}

const CredentialDetails: React.FC<Props> = ({ navigation, route }) => {
  useEffect(() => {
    navigation.setOptions({
      title: route?.params?.alias,
    })
  }, [])

  return (
    <SafeAreaScrollView>
      <Text>...other info, idk</Text>
    </SafeAreaScrollView>
  )
}

export default CredentialDetails
