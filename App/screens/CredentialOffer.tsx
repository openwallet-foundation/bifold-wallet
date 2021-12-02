import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { ConnectionRecord, CredentialRecord, CredentialState } from '@aries-framework/core'
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

const INDY_CREDENTIAL_KEY = '_internal/indyCredential'

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  if (!agent?.credentials) {
    Toast.show({
      type: 'error',
      text1: t('Global.SomethingWentWrong'),
    })
    navigation.goBack()
    return null
  }

  const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
    try {
      if (!credentialId) {
        throw new Error(t('CredentialOffer.CredentialNotFound'))
      }
      return useCredentialById(credentialId)
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  const getConnectionRecordFromCredential = (connectionId?: string): ConnectionRecord | void => {
    if (connectionId) {
      return useConnectionById(connectionId)
    }
  }

  const credential = getCredentialRecord(route?.params?.credentialId)

  if (!credential) {
    Toast.show({
      type: 'error',
      text1: t('CredentialOffer.CredentialNotFound'),
    })
    navigation.goBack()
    return null
  }

  useEffect(() => {
    if (credential.state === CredentialState.Done) {
      Toast.show({
        type: 'success',
        text1: t('CredentialOffer.CredentialAccepted'),
      })
      navigation.goBack()
    }
  }, [credential])

  useEffect(() => {
    if (credential.state === CredentialState.Declined) {
      Toast.show({
        type: 'info',
        text1: t('CredentialOffer.CredentialRejected'),
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
      await agent.credentials.acceptOffer(credential.id)
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
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
            await agent.credentials.declineOffer(credential.id)
          } catch (e: unknown) {
            Toast.show({
              type: 'error',
              text1: (e as Error)?.message || t('Global.Failure'),
            })
          }
        },
      },
    ])
  }

  const connection = getConnectionRecordFromCredential(credential.connectionId)

  return (
    <View style={styles.container}>
      <ModularView
        title={parseSchema(credential.metadata.get<IndyCredentialMetadata>(INDY_CREDENTIAL_KEY)?.schemaId)}
        subtitle={connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={credential.credentialAttributes}
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
