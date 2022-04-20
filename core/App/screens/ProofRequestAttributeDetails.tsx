import { ProofRecord, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useCredentials, useProofById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Title from '../components/texts/Title'
import { dateFormatOptions } from '../constants'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { BifoldError } from '../types/error'
import { HomeStackParams, Screens } from '../types/navigators'
import { connectionRecordFromId, getConnectionName, parsedSchema, processProofAttributes } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { useThemeContext } from '../utils/themeContext'

type ProofRequestAttributeDetailsProps = StackScreenProps<HomeStackParams, Screens.ProofRequestAttributeDetails>

const ProofRequestAttributeDetails: React.FC<ProofRequestAttributeDetailsProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId, attributeName } = route?.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useContext(Context)
  const [credentials, setCredentials] = useState<RetrievedCredentials>()
  const proof = useProofById(proofId)
  const { ColorPallet, TextTheme } = useThemeContext()

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...TextTheme.normal,
      flexShrink: 1,
    },
    listItem: {
      paddingHorizontal: 25,
      paddingTop: 16,
      backgroundColor: ColorPallet.brand.primaryBackground,
      borderTopColor: ColorPallet.brand.secondaryBackground,
      borderBottomColor: ColorPallet.brand.secondaryBackground,
      borderTopWidth: 2,
      borderBottomWidth: 2,
    },
  })

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  if (!proof) {
    throw new Error('Unable to fetch proof from AFJ')
  }

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
          type: DispatchAction.SetError,
          payload: [{ error }],
        })
      }
    }

    retrieveCredentialsForProof(proof)
      .then((credentials) => {
        setCredentials(credentials)
      })
      .catch(() => {
        const error = new BifoldError(
          'Unable to update retrieved credentials',
          'There was a problem while updating retrieved credentials.',
          1026
        )
        dispatch({
          type: DispatchAction.SetError,
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
          <Text style={[TextTheme.headingFour, { paddingVertical: 16 }]} testID={testIdWithKey('AttributeName')}>
            {attributeName}
          </Text>
          <Text style={styles.headerText}>{t('ProofRequest.WhichYouCanProvideFrom')}:</Text>
        </View>
      )}
      data={matchingCredentials}
      keyExtractor={(credential) => credential.credentialId || credential.id}
      renderItem={({ item: credential }) => (
        <View style={styles.listItem}>
          <Text style={TextTheme.normal} testID={testIdWithKey('CredentialName')}>
            {parsedSchema(credential).name}
          </Text>
          {matchingAttribute?.revoked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                style={{ paddingTop: 2, paddingHorizontal: 2 }}
                name="close"
                color={ColorPallet.semantic.error}
                size={TextTheme.normal.fontSize}
              ></Icon>
              <Text
                style={[TextTheme.normal, { color: ColorPallet.semantic.error }]}
                testID={testIdWithKey('RevokedOrNotAvailable')}
              >
                {t('CredentialDetails.Revoked')}
              </Text>
            </View>
          ) : (
            <Text style={TextTheme.normal} testID={testIdWithKey('Issued')}>
              {t('CredentialDetails.Issued')} {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
            </Text>
          )}
          <Text style={[TextTheme.headingFour, { paddingVertical: 16 }]} testID={testIdWithKey('AttributeValue')}>
            {matchingAttribute?.value}
          </Text>
        </View>
      )}
    ></FlatList>
  )
}

export default ProofRequestAttributeDetails
