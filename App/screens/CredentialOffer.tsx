import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { ConnectionRecord, CredentialRecord, CredentialState } from '@aries-framework/core'
import { Metadata } from '@aries-framework/core/build/storage/Metadata'
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
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
    try {
      if (!credentialId) {
        throw new Error(t('Credential not found'))
      }
      return useCredentialById(credentialId)
    } catch (e: unknown) {
      // console.error(e)
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Failure'),
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
  const connection = getConnectionRecordFromCredential(credential?.connectionId)

  useEffect(() => {
    if (credential?.state === CredentialState.Done) {
      Toast.show({
        type: 'success',
        text1: t('Credential Accepted'),
      })
      navigation.goBack()
    }
  }, [credential])

  useEffect(() => {
    if (credential?.state === CredentialState.Declined) {
      Toast.show({
        type: 'info',
        text1: t('Credential Rejected'),
      })
      navigation.goBack()
    }
  }, [credential])

  const handleAcceptPress = async () => {
    if (!credential) {
      return
    }
    setButtonsVisible(false)
    Toast.show({
      type: 'info',
      text1: t('Accepting Credential'),
    })
    try {
      await agent?.credentials.acceptOffer(credential?.id)
    } catch (e: unknown) {
      // console.error(e)
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Failure'),
      })
      setButtonsVisible(true)
    }
  }

  const handleRejectPress = async () => {
    if (!credential) {
      return
    }
    Alert.alert(t('Reject this Credential?'), t('This decision cannot be changed.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Confirm'),
        style: 'destructive',
        onPress: async () => {
          Toast.show({
            type: 'info',
            text1: t('Rejecting Credential'),
          })
          try {
            await agent?.credentials.declineOffer(credential?.id)
          } catch (e: unknown) {
            // console.error(e)
            Toast.show({
              type: 'error',
              text1: (e as Error)?.message || t('Failure'),
            })
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <ModularView
        title={parseSchema((credential?.metadata as Metadata & { schemaId: string })?.schemaId)}
        subtitle={connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={credential?.credentialAttributes}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => <Label title={item.name} subtitle={item.value} />}
          />
        }
      />
      <Button title={t('Accept')} onPress={handleAcceptPress} disabled={!buttonsVisible} />
      <Button title={t('Reject')} negative onPress={handleRejectPress} disabled={!buttonsVisible} />
    </View>
  )
}

export default CredentialOffer
