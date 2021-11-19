import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import { ProofState, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Alert, View, StyleSheet } from 'react-native'
import Toast from 'react-native-toast-message'

import { backgroundColor } from '../globalStyles'
import { parseSchema } from '../helpers'

import { Button, ModularView, Label } from 'components'

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
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>(null)
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState<any>(null)
  const proofId = route?.params?.proofId
  const proof = useProofById(proofId)
  const connection = useConnectionById(proof?.connectionId)
  const { t } = useTranslation()

  useEffect(() => {
    if (proof?.state === ProofState.Done) {
      Toast.show({
        type: 'success',
        text1: t('Successfully Accepted Proof'),
      })
      navigation.goBack()
    }
  }, [proof])

  const getRetrievedCredentials = async () => {
    try {
      if (!proof?.requestMessage?.indyProofRequest) {
        Toast.show({
          type: 'error',
          text1: t('Proof not Found'),
        })
        throw new Error('Indy proof request not found')
      }
      const retrievedCreds = await agent?.proofs?.getRequestedCredentialsForProofRequest(
        proof?.requestMessage?.indyProofRequest,
        undefined
      )
      if (!retrievedCreds) {
        Toast.show({
          type: 'error',
          text1: t('Requested creds not found'),
        })
        throw new Error('Retrieved creds not found')
      }
      setRetrievedCredentials(retrievedCreds)
      setRetrievedCredentialsDisplay(transformAttributes(retrievedCreds?.requestedAttributes))
    } catch {
      Toast.show({
        type: 'error',
        text1: t('Failure'),
      })
    }
  }

  useEffect(() => {
    getRetrievedCredentials()
  }, [])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    Toast.show({
      type: 'info',
      text1: t('Accepting Proof'),
    })
    try {
      if (!proof) {
        Toast.show({
          type: 'error',
          text1: t('Proof not Found'),
        })
        throw new Error('Proof not found')
      }
      const automaticRequestedCreds = agent?.proofs?.autoSelectCredentialsForProofRequest(retrievedCredentials)
      if (!automaticRequestedCreds) {
        Toast.show({
          type: 'error',
          text1: t('Requested creds not found'),
        })
        throw new Error('Requested creds not found')
      }
      await agent?.proofs.acceptRequest(proof?.id, automaticRequestedCreds)
    } catch {
      Toast.show({
        type: 'error',
        text1: t('Failure'),
      })
      setButtonsVisible(true)
    }
  }

  const handleRejectPress = async () => {
    Alert.alert(t('Reject this Proof?'), t('This decision cannot be changed.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Confirm'),
        style: 'destructive',
        onPress: async () => {
          Toast.show({
            type: 'info',
            text1: t('Rejecting Proof'),
          })
          try {
            // await agent.proofs.rejectPresentation(id)
            navigation.goBack()
          } catch {
            Toast.show({
              type: 'error',
            })
          }
        },
      },
    ])
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
          <Button title={t('Accept')} onPress={handleAcceptPress} disabled={!buttonsVisible} />
          <Button title={t('Reject')} negative onPress={handleRejectPress} disabled={!buttonsVisible} />
      )}
    </View>
  )
}

export default CredentialOffer
