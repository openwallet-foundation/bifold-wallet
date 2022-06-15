import { ProofRecord, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useCredentials, useProofById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import HeaderLeftBack from '../components/buttons/HeaderLeftBack'
import Title from '../components/texts/Title'
import { dateFormatOptions } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { HomeStackParams, Screens } from '../types/navigators'
import { connectionRecordFromId, getConnectionName, parsedSchema, processProofAttributes } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ProofRequestAttributeDetailsProps = StackScreenProps<HomeStackParams, Screens.ProofRequestAttributeDetails>

const ProofRequestAttributeDetails: React.FC<ProofRequestAttributeDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId, attributeName } = route?.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [credentials, setCredentials] = useState<RetrievedCredentials>()
  const proof = useProofById(proofId)
  const { ColorPallet, ListItems } = useTheme()

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeText,
      flexShrink: 1,
    },
    listItem: {
      ...ListItems.proofListItem,
    },
  })

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

  useMemo(() => {
    navigation.setOptions({
      title: t('ProofRequest.Details'),
      headerRight: undefined,
      headerLeft: () => (
        <HeaderLeftBack
          title={t('Global.Back')}
          onPress={() => {
            navigation.pop()
          }}
        />
      ),
      headerBackTitle: t('Global.Back'),
      headerBackAccessibilityLabel: t('Global.Back'),
      headerBackTestID: testIdWithKey('BackButton'),
    })
  }, [])

  useEffect(() => {
    const retrieveCredentialsForProof = async (proof: ProofRecord) => {
      try {
        const credentials = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
        if (!credentials) {
          throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
        }
        return credentials
      } catch (error: unknown) {
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      }
    }

    retrieveCredentialsForProof(proof)
      .then((credentials) => {
        setCredentials(credentials)
      })
      .catch((err: unknown) => {
        const error = new BifoldError(t('Error.Title1029'), t('Error.Message1029'), (err as Error).message, 1029)
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      })
  }, [])

  const { credentials: allCredentials } = useCredentials()
  const connection = connectionRecordFromId(proof.connectionId)
  const attributes = processProofAttributes(proof, credentials?.requestedAttributes)
  const matchingAttribute = attributes.find((attribute) => attribute.name === attributeName)
  const matchingCredentials = allCredentials.filter(
    (credential) => credential.credentialId === matchingAttribute?.credentialId
  )

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
            {t('ProofRequest.IsRequesting')}:
          </Text>
          <Text style={[ListItems.credentialTitle, { paddingVertical: 16 }]} testID={testIdWithKey('AttributeName')}>
            {attributeName}
          </Text>
          <Text style={styles.headerText}>{t('ProofRequest.WhichYouCanProvideFrom')}:</Text>
        </View>
      )}
      data={matchingCredentials}
      keyExtractor={(credential) => credential.credentialId || credential.id}
      renderItem={({ item: credential }) => (
        <View style={styles.listItem}>
          <Text style={ListItems.recordAttributeText} testID={testIdWithKey('CredentialName')}>
            {parsedSchema(credential).name}
          </Text>
          {matchingAttribute?.revoked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                style={{ paddingTop: 2, paddingHorizontal: 2 }}
                name="close"
                color={ListItems.proofError.color}
                size={ListItems.recordAttributeText.fontSize}
              ></Icon>
              <Text
                style={[ListItems.recordAttributeText, { color: ColorPallet.semantic.error }]}
                testID={testIdWithKey('RevokedOrNotAvailable')}
              >
                {t('CredentialDetails.Revoked')}
              </Text>
            </View>
          ) : (
            <Text style={ListItems.recordAttributeText} testID={testIdWithKey('Issued')}>
              {t('CredentialDetails.Issued')} {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
            </Text>
          )}
          <Text style={[ListItems.credentialTitle, { paddingVertical: 16 }]} testID={testIdWithKey('AttributeValue')}>
            {matchingAttribute?.value}
          </Text>
        </View>
      )}
    ></FlatList>
  )
}

export default ProofRequestAttributeDetails
