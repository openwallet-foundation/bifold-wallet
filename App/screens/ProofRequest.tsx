import React, { useState } from 'react'
import { StyleSheet, FlatList, Alert } from 'react-native'
import { useAgent, useConnectionById } from 'aries-hooks'

import { parseSchema } from '../helpers'

import { SafeAreaScrollView, Button, ModularView, Label, Success, Pending, Failure } from 'components'

interface Props {
  navigation: any
  route: any
}

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const [modalVisible, setModalVisible] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')

  console.log('PROOF', route.params.notification)

  const { id, connectionId, proposalMessage } = route.params.notification

  const connection = useConnectionById(connectionId)

  const handleAcceptPress = async () => {
    setModalVisible('pending')

    setTimeout(() => {
      setPendingMessage("This is taking Longer than expected. We'll continue processing in the background.")
    }, 15000)

    try {
      await agent.proofs.acceptPresentation(id)
    } catch {
      setModalVisible('failure')
    } finally {
      setModalVisible('success')
    }
  }

  const handleRejectPress = async () => {
    Alert.alert('Are you sure?', 'This proof will be rejected.', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Yes',
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
        title={'Verifier Name'}
        subtitle={connection.alias || connection.invitation?.label}
        content={
          <FlatList
            data={proposalMessage.presentationProposal.attributes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Label
                title={item.name}
                subtitle={item.value}
                label={item.credentialDefinitionId.split(':')[4].split('_')[0]}
              />
            )}
          />
        }
      />
      <Button title="Accept" onPress={handleAcceptPress} />
      <Button title="Reject" negative onPress={handleRejectPress} />
      <Pending
        visible={modalVisible === 'pending'}
        banner="Accepting Credential"
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
        banner="Successfully Accepted Credential"
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
