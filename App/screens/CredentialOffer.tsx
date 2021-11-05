import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { CredentialState } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, FlatList, Alert, View } from 'react-native'

import { backgroundColor } from '../globalStyles'
import { parseSchema } from '../helpers'

import { Button, ModularView, Label, Success, Pending, Failure } from 'components'

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
  const [modalVisible, setModalVisible] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')
  const credentialId = route?.params?.credentialId
  const credential = useCredentialById(credentialId)
  const connection = useConnectionById(credential?.connectionId)
  const { t } = useTranslation()

  useEffect(() => {
    if (credential?.state === CredentialState.Done) {
      setModalVisible('success')
    }
  }, [credential])

  const handleAcceptPress = async () => {
    setModalVisible('pending')
    setTimeout(() => {
      setPendingMessage(t('Pending delay'))
    }, 10000)
    try {
      await agent?.credentials.acceptOffer(credentialId)
    } catch {
      setModalVisible('failure')
    }
  }

  const handleRejectPress = async () => {
    Alert.alert(t('Reject this Credential?'), t('This decision cannot be changed.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Confirm'),
        style: 'destructive',
        onPress: async () => {
          setModalVisible('pending')
          try {
            await agent?.credentials.declineOffer(credentialId)
            setModalVisible('success')
          } catch {
            setModalVisible('failure')
          }
        },
      },
    ])
  }

  const exitCredentialOffer = () => {
    setModalVisible('')
    navigation.goBack()
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
      <Button title={t('Accept')} onPress={handleAcceptPress} />
      <Button title={t('Reject')} negative onPress={handleRejectPress} />
      <Pending
        visible={modalVisible === 'pending'}
        banner={t('Accepting Credential')}
        message={pendingMessage}
        onPress={pendingMessage ? exitCredentialOffer : undefined}
      />
      <Success
        visible={modalVisible === 'success'}
        banner={t('Successfully Accepted Credential')}
        onPress={() => {
          setModalVisible('')
          navigation.goBack()
        }}
      />
      <Failure visible={modalVisible === 'failure'} onPress={() => setModalVisible('')} />
    </View>
  )
}

export default CredentialOffer
