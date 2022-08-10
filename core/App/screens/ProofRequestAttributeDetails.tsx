import { ProofRecord, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useCredentials, useProofById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import RecordLoading from '../components/animated/RecordLoading'
import { dateFormatOptions } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { connectionRecordFromId, getConnectionName, parsedSchema, processProofAttributes } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ProofRequestAttributeDetailsProps = StackScreenProps<NotificationStackParams, Screens.ProofRequestAttributeDetails>

const ProofRequestAttributeDetails: React.FC<ProofRequestAttributeDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('ProofRequest route prams were not set properly')
  }

  const { proofId, attributeName } = route?.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const proof = useProofById(proofId)
  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  const [loading, setLoading] = React.useState<boolean>(true)
  const { ColorPallet, ListItems, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 25,
      paddingTop: 16,
    },
    headerText: {
      ...ListItems.recordAttributeText,
      flexShrink: 1,
    },
    footerContainer: {
      paddingHorizontal: 25,
    },
    container: {
      ...ListItems.recordContainer,
      paddingHorizontal: 25,
      paddingVertical: 16,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    border: {
      ...ListItems.recordBorder,
      paddingTop: 12,
      borderBottomColor: ColorPallet.brand.secondaryBackground,
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
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      }
    }

    retrieveCredentialsForProof(proof)
      .then((credentials) => {
        setRetrievedCredentials(credentials)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const error = new BifoldError(t('Error.Title1029'), t('Error.Message1029'), (err as Error).message, 1029)
        dispatch({
          type: DispatchAction.ERROR_ADDED,
          payload: [{ error }],
        })
      })
  }, [])

  const { records: credentials } = useCredentials()
  const connection = connectionRecordFromId(proof.connectionId)
  const attributes = processProofAttributes(proof, retrievedCredentials)
  const matchingAttribute = attributes.find((a) => a.name === attributeName)
  const matchingCredentials = credentials.filter(
    (credential) => !!credential.credentials.find((c) => c.credentialRecordId === matchingAttribute?.credentialId)
  )

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={matchingCredentials}
        keyExtractor={(credential) => credential.id}
        renderItem={({ item: credential, index }) => (
          <View style={styles.container}>
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
            <Text style={[ListItems.credentialTitle, { paddingTop: 16 }]} testID={testIdWithKey('AttributeValue')}>
              {matchingAttribute?.value}
            </Text>
            {
              <View
                style={[styles.border, index === matchingCredentials.length - 1 && { borderBottomWidth: 0 }]}
              ></View>
            }
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
              <Text style={[TextTheme.title]}>{getConnectionName(connection) || t('ContactDetails.AContact')}</Text>{' '}
              {t('ProofRequest.IsRequesting')}:
            </Text>
            <Text style={[ListItems.credentialTitle, { paddingVertical: 16 }]} testID={testIdWithKey('AttributeName')}>
              {startCase(attributeName || '')}
            </Text>
            <Text style={styles.headerText}>{t('ProofRequest.WhichYouCanProvideFrom')}:</Text>
            {<View style={[styles.border]}></View>}
          </View>
        )}
        ListFooterComponent={() =>
          loading ? (
            <View style={styles.footerContainer}>
              <RecordLoading />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

export default ProofRequestAttributeDetails
