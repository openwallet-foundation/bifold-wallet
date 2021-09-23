import React, { useState, useEffect } from 'react'
import { FlatList, Alert } from 'react-native'
import { useAgent, useConnectionById } from 'aries-hooks'

import { SafeAreaScrollView, Button, ModularView, Label, Success, Pending, Failure } from 'components'

import { parseSchema } from '../helpers'

interface Props {
  navigation: any
  route: any
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
  const [retrievedCredentials, setRetrievedCredentials] = useState<any>()
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState<any>()

  const { id, connectionId, requestMessage } = route.params.notification
  const connection = useConnectionById(connectionId)

  const getRetrievedCredentials = async () => {
    const retrievedCreds = await agent.proofs.getRequestedCredentialsForProofRequest(
      requestMessage.indyProofRequest,
      undefined
    )

    setRetrievedCredentials(retrievedCreds)
    setRetrievedCredentialsDisplay(transformAttributes(retrievedCreds.requestedAttributes))
  }

  useEffect(() => {
    getRetrievedCredentials()
  }, [])

  const handleAcceptPress = async () => {
    setModalVisible('pending')

    setTimeout(() => {
      setPendingMessage("This is taking Longer than expected. We'll continue processing in the background.")
    }, 15000)

    const automaticRequestedCreds = agent.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials)

    try {
      await agent.proofs.acceptRequest(id, automaticRequestedCreds)
    } catch {
      setModalVisible('failure')
    } finally {
      setModalVisible('success')
    }
  }

  const handleRejectPress = async () => {
    Alert.alert('Reject this Proof?', 'This decision cannot be changed.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
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
        title={requestMessage.indyProofRequest.name || connection.alias || connection.invitation?.label}
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
