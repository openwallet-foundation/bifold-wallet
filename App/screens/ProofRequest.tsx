import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import {
  ConnectionRecord,
  ProofRecord,
  ProofState,
  RequestedAttribute,
  RetrievedCredentials,
} from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Alert, View, StyleSheet } from 'react-native'
import Toast from 'react-native-toast-message'

import { Colors } from '../Theme'
import { parseSchema } from '../helpers'

import { Button, ModularView, Label } from 'components'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams, 'Proof Request'>
  route: RouteProp<HomeStackParams, 'Proof Request'>
}

interface CredentialDisplay {
  name: string
  value: string
  credentialDefinitionId: string
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
})

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState<CredentialDisplay[]>()

  if (!agent?.proofs) {
    Toast.show({
      type: 'error',
      text1: t('Global.SomethingWentWrong'),
    })
    navigation.goBack()
    return null
  }

  const transformAttributes = (attributes: Record<string, RequestedAttribute[]>): CredentialDisplay[] => {
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

  const getProofRecord = (proofId?: string): ProofRecord | void => {
    try {
      if (!proofId) {
        throw new Error(t('ProofRequest.ProofNotFound'))
      }
      return useProofById(proofId)
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  const getConnectionRecordFromProof = (connectionId?: string): ConnectionRecord | void => {
    if (connectionId) {
      return useConnectionById(connectionId)
    }
  }

  const getRetrievedCredentials = async (proof: ProofRecord) => {
    try {
      const creds = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
      if (!creds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      setRetrievedCredentials(creds)
      setRetrievedCredentialsDisplay(transformAttributes(creds.requestedAttributes))
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
      })
    }
  }

  const proof = getProofRecord(route?.params?.proofId)

  if (!proof) {
    Toast.show({
      type: 'error',
      text1: t('ProofRequest.ProofNotFound'),
    })
    navigation.goBack()
    return null
  }

  useEffect(() => {
    try {
      getRetrievedCredentials(proof)
    } catch (e: unknown) {
      navigation.goBack()
    }
  }, [])

  useEffect(() => {
    if (proof.state === ProofState.Done) {
      Toast.show({
        type: 'success',
        text1: t('ProofRequest.ProofAccepted'),
      })
      navigation.goBack()
    }
  }, [proof])

  useEffect(() => {
    if (proof.state === ProofState.Declined) {
      Toast.show({
        type: 'info',
        text1: t('ProofRequest.ProofRejected'),
      })
      navigation.goBack()
    }
  }, [proof])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    Toast.show({
      type: 'info',
      text1: t('ProofRequest.AcceptingProof'),
    })
    try {
      const automaticRequestedCreds =
        retrievedCredentials && agent.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials)
      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      await agent.proofs.acceptRequest(proof.id, automaticRequestedCreds)
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Global.Failure'),
      })
      setButtonsVisible(true)
    }
  }

  const handleRejectPress = async () => {
    Alert.alert(t('ProofRequest.RejectThisProof?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          Toast.show({
            type: 'info',
            text1: t('ProofRequest.RejectingProof'),
          })
          try {
            await agent.proofs.declineRequest(proof.id)
          } catch (e: unknown) {
            Toast.show({
              type: 'error',
              text1: t('Global.Failure'),
            })
          }
        },
      },
    ])
  }

  const connection = getConnectionRecordFromProof(proof.connectionId)

  return (
    <View style={styles.container}>
      <ModularView
        title={proof.requestMessage?.indyProofRequest?.name || connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={retrievedCredentialsDisplay}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <Label title={item.name} subtitle={item.value} label={item.credentialDefinitionId} />
            )}
          />
        }
      />
      <Button title={t('Global.Accept')} onPress={handleAcceptPress} disabled={!buttonsVisible} />
      <Button title={t('Global.Reject')} negative onPress={handleRejectPress} disabled={!buttonsVisible} />
    </View>
  )
}

export default CredentialOffer
