import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, Alert } from 'react-native'
import { useAgent, useConnectionById, useCredentialById } from 'aries-hooks'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Button, ModularView, Label, Success, Pending, Failure } from 'components'

import { parseSchema } from '../helpers'
import { CredentialState } from '@aries-framework/core'

interface Props {
  navigation: any
  route: any
}

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation()
  
  const { agent } = useAgent()
  const [modalVisible, setModalVisible] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')

  const { connectionId, credentialAttributes, id, metadata } = route?.params?.notification

  const connection = useConnectionById(connectionId)
  const credential = useCredentialById(id)

  useEffect(() => {
    if(credential?.state === CredentialState.Done){
      setModalVisible('success')
    }
  }, [credential])

  const handleAcceptPress = async () => {
    setModalVisible('pending')

    setTimeout(() => {
      setPendingMessage(t('CredentialOffer.longerThanExpected'))
    }, 10000)

    try {
      await agent.credentials.acceptOffer(id)
    } catch {
      setModalVisible('failure')
    }
  }

  const handleRejectPress = async () => {
    Alert.alert(t('CredentialOffer.rejectThisCredential'), t('CredentialOffer.thisDecisionCannotBeChanged'), [
      { text: t('CredentialOffer.cancel'), onPress: () => {}, style: 'cancel' },
      {
        text: t('CredentialOffer.confirm'),
        style: 'destructive',
        onPress: async () => {
          setModalVisible('pending')
          try {
            await agent.credentials.declineOffer(id)
            setModalVisible('success')
          } catch {
            setModalVisible('failure')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaScrollView>
      <ModularView
        title={parseSchema(metadata.schemaId)}
        subtitle={connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={credentialAttributes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Label title={item.name} subtitle={item.value} />}
          />
        }
      />
      <Button title={t('CredentialOffer.accept')} onPress={handleAcceptPress} />
      <Button title={t('CredentialOffer.reject')} negative onPress={handleRejectPress} />
      <Pending
        visible={modalVisible === 'pending'}
        banner={t('CredentialOffer.acceptingCredential')}
        message={pendingMessage}
        onPress={
          pendingMessage
            ? () => {
                setModalVisible('')
                navigation.goBack()
              }
            : undefined
        }
      />
      <Success
        visible={modalVisible === 'success'}
        banner={t('CredentialOffer.successfullyAcceptedCredential')}
        onPress={() => {
          setModalVisible('')
          navigation.goBack()
        }}
      />
      <Failure visible={modalVisible === 'failure'} onPress={() => setModalVisible('')} />
    </SafeAreaScrollView>
  )
}

export default CredentialOffer

const styles = StyleSheet.create({})
