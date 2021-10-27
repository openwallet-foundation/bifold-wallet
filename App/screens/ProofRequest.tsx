import React, { useState, useEffect } from 'react'
import { FlatList, Alert } from 'react-native'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { SafeAreaScrollView, Button, ModularView, Label, Success, Pending, Failure } from 'components'

import { parseSchema } from '../helpers'
import { ProofState } from '@aries-framework/core'

interface Props {
  navigation: StackNavigationProp<HomeStackParams, 'Proof Request'>
  route: RouteProp<HomeStackParams, 'Proof Request'>
}

const transformAttributes = (attributes: any) => {
  const transformedAttributes = []

  for (const attribute in attributes) {
    transformedAttributes.push({
      name: attribute,
      value: attributes[attribute][0].credentialInfo.attributes[attribute],
      credentialDefinitionId: parseSchema(attributes[attribute][0].credentialInfo.schemaId),
    })
  }

  return transformedAttributes
}

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const [modalVisible, setModalVisible] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')
  const [retrievedCredentials, setRetrievedCredentials] = useState()
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState()

  const proof = useProofById(route?.params?.proofId)
  const connection = useConnectionById(proof?.connectionId)

  useEffect(() => {
    if (proof?.state === ProofState.Done) {
      setModalVisible('success')
    }
  }, [proof])

  const getRetrievedCredentials = async () => {
    const retrievedCreds = await agent.proofs.getRequestedCredentialsForProofRequest(
      proof?.requestMessage?.indyProofRequest,
      undefined
    )

    setRetrievedCredentials(retrievedCreds)
    setRetrievedCredentialsDisplay(transformAttributes(retrievedCreds?.requestedAttributes))
  }

  useEffect(() => {
    getRetrievedCredentials()
  }, [])

  const handleAcceptPress = async () => {
    setModalVisible('pending')

    setTimeout(() => {
      setPendingMessage("This is taking Longer than expected. We'll continue processing in the background.")
    }, 15000)

    const automaticRequestedCreds = agent?.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials)

    try {
      await agent?.proofs.acceptRequest(proof?.id, automaticRequestedCreds)
    } catch {
      setModalVisible('failure')
    }
  }

  const handleRejectPress = async () => {
    Alert.alert('Reject this Proof?', 'This decision cannot be changed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          setModalVisible('pending')
          try {
            // await agent.proofs.rejectPresentation(id)
          } catch {
            setModalVisible('failure')
          } finally {
            setModalVisible('success')
          }
        },
      },
    ])
  }

  return (
    <SafeAreaScrollView>
      <ModularView
        title={proof?.requestMessage?.indyProofRequest?.name || connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={retrievedCredentialsDisplay}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Label title={item.name} subtitle={item.value} label={item.credentialDefinitionId} />
            )}
          />
        }
      />
      <Button title="Accept" onPress={handleAcceptPress} />
      <Button title="Reject" negative onPress={handleRejectPress} />
      <Pending
        visible={modalVisible === 'pending'}
        banner="Accepting Proof"
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
        banner="Successfully Accepted Proof"
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
