import React from 'react'
import { StyleSheet } from 'react-native'

import { SafeAreaScrollView, Button, Title, Text } from 'components'

interface Props {
  navigation: any
  route: any
}

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const notification = route?.params?.notification

  return (
    <SafeAreaScrollView>
      <Title>{notification.title}</Title>
      <Button title="Accept" onPress={() => navigation.goBack()} />
      <Button title="Reject" negative onPress={() => navigation.goBack()} />
    </SafeAreaScrollView>
  )
}

export default CredentialOffer

const styles = StyleSheet.create({})
