import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { ProofState, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect } from 'react'
import { FlatList, Alert, View, StyleSheet } from 'react-native'

import { backgroundColor } from '../globalStyles'
import { parseSchema } from '../helpers'

import { Button, ModularView, Label, Success, Pending, Failure } from 'components'

interface Props {
  navigation: StackNavigationProp<HomeStackParams, 'Proof Request'>
  route: RouteProp<HomeStackParams, 'Proof Request'>
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
  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>(null)
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState<any>(null)

  const proofId = route?.params?.proofId

  const proof = useProofById(proofId)
  const connection = useConnectionById(proof?.connectionId)

  useEffect(() => {
    if (proof?.state === ProofState.Done) {
      setModalVisible('success')
    }
  }, [proof])

  const getRetrievedCredentials = async () => {
    try {
      if (!proof?.requestMessage?.indyProofRequest) {
        throw new Error('Indy proof request not found ')
      }
      const retrievedCreds = await agent?.proofs?.getRequestedCredentialsForProofRequest(
        proof?.requestMessage?.indyProofRequest,
        undefined
      )
      if (!retrievedCreds) {
        throw new Error('Retrieved creds not found')
      }
      setRetrievedCredentials(retrievedCreds)
      setRetrievedCredentialsDisplay(transformAttributes(retrievedCreds?.requestedAttributes))
    } catch (e) {
      console.error(e)
      setModalVisible('failure')
    }
  }

  useEffect(() => {
    getRetrievedCredentials()
  }, [])

  const handleAcceptPress = async () => {
    setModalVisible('pending')
    setTimeout(() => {
      setPendingMessage("This is taking Longer than expected. We'll continue processing in the background.")
    }, 15000)
    try {
      if (!proof) {
        throw new Error('Proof not found')
      }
      const automaticRequestedCreds = agent?.proofs?.autoSelectCredentialsForProofRequest(retrievedCredentials)
      if (!automaticRequestedCreds) {
        throw new Error('Requested creds not found')
      }
      await agent?.proofs.acceptRequest(proof?.id, automaticRequestedCreds)
    } catch (e) {
      console.error(e)
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
          } catch (e) {
            console.error(e)
            setModalVisible('failure')
          }
        },
      },
    ])
  }

  const exitProofRequest = () => {
    setModalVisible('')
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
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
        onPress={pendingMessage ? () => exitProofRequest() : undefined}
      />
      <Success
        visible={modalVisible === 'success'}
        banner="Successfully Accepted Proof"
        onPress={() => exitProofRequest()}
      />
      <Failure visible={modalVisible === 'failure'} onPress={() => setModalVisible('')} />
    </View>
  )
}

export default CredentialOffer
