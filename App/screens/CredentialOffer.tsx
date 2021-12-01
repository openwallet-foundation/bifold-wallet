import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { CredentialState } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, FlatList, Alert, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { backgroundColor } from '../globalStyles'
import { parseSchema } from '../helpers'

import { Button, ModularView, Label } from 'components'

interface Props {
  navigation: StackNavigationProp<HomeStackParams, 'Credential Offer'>
  route: RouteProp<HomeStackParams, 'Credential Offer'>
}

const styles = StyleSheet.create({
  container: {
    backgroundColor,
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
})

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  const credentialId = route?.params?.credentialId

  const credential = useCredentialById(credentialId)
  const connection = useConnectionById(credential?.connectionId)
  const { t } = useTranslation()

  useEffect(() => {
    if (credential?.state === CredentialState.Done) {
      Toast.show({
        type: 'success',
        text1: t('CredentialOffer.SuccessfullyAcceptedCredential'),
      })
      navigation.goBack()
    }
  }, [credential])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    Toast.show({
      type: 'info',
      text1: t('CredentialOffer.AcceptingCredential'),
    })
    try {
      await agent?.credentials.acceptOffer(credentialId)
    } catch {
      Toast.show({
        type: 'error',
        text1: t('Global.Failure'),
      })
      setButtonsVisible(true)
    }
  }

  const handleRejectPress = async () => {
    Alert.alert(t('CredentialOffer.RejectThisCredential?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          Toast.show({
            type: 'info',
            text1: t('CredentialOffer.RejectingCredential'),
          })
          try {
            await agent?.credentials.declineOffer(credentialId)
            Toast.show({
              type: 'success',
              text1: t('CredentialOffer.SuccessfullyRejectedCredential'),
            })
            navigation.goBack()
          } catch {
            Toast.show({
              type: 'error',
              text1: t('Global.Failure'),
            })
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <ModularView
        title={parseSchema(credential?.metadata.schemaId)}
        subtitle={connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={credential?.credentialAttributes}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => <Label title={item.name} subtitle={item.value} />}
          />
        }
      />
      <Button title={t('Global.Accept')} onPress={handleAcceptPress} disabled={!buttonsVisible} />
      <Button title={t('Global.Reject')} negative onPress={handleRejectPress} disabled={!buttonsVisible} />
    </View>
  )
}

export default CredentialOffer
