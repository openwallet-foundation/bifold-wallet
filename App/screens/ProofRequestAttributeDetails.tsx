import { ProofRecord, RequestedAttribute } from '@aries-framework/core'
import { useAgent, useCredentials } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Title from '../components/texts/Title'
import { ToastType } from '../components/toast/BaseToast'
import { dateFormatOptions } from '../constants'
import { HomeStackParams, Screens } from '../types/navigators'
import {
  connectionRecordFromId,
  firstAttributeCredential,
  getConnectionName,
  parsedSchema,
  proofRecordFromId,
  valueFromAttributeCredential,
} from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { useThemeContext } from '../utils/themeContext'

type ProofRequestAttributeDetailsProps = StackScreenProps<HomeStackParams, Screens.ProofRequestAttributeDetails>

const ProofRequestAttributeDetails: React.FC<ProofRequestAttributeDetailsProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { credentials } = useCredentials()
  const { t } = useTranslation()

  const [retrievedCredentialAttributes, setRetrievedCredentialAttributes] = useState<[string, RequestedAttribute[]][]>(
    []
  )
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
  const { proofId, attributeName } = route?.params

  if (!(proofId && attributeName && agent?.proofs && credentials)) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })
    navigation.goBack()
    return null
  }

  const getProofRecord = (proofId?: string): ProofRecord | void => {
    try {
      const proof = proofRecordFromId(proofId)
      if (!proof) {
        throw new Error(t('ProofRequest.ProofNotFound'))
      }
      return proof
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  const getRetrievedCredentials = async (proof: ProofRecord) => {
    try {
      const creds = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
      if (!creds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      setRetrievedCredentialAttributes(Object.entries(creds?.requestedAttributes || {}))
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
    }
  }

  const proof = getProofRecord(proofId)

  if (!proof) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('ProofRequest.ProofNotFound'),
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

  const connection = connectionRecordFromId(proof.connectionId)
  const attributeCredentials = retrievedCredentialAttributes
    ?.filter(([name]) => name === attributeName)
    .map(([, [values]]) => values)
  const credentialIds = attributeCredentials.map((attributeCredential) => attributeCredential.credentialId)
  const matchingCredentials = credentials.filter((credential) =>
    credentialIds.includes(credential.credentialId || credential.id)
  )

  const attributeCredential = firstAttributeCredential(attributeCredentials) as RequestedAttribute

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <Title>{getConnectionName(connection) || t('ContactDetails.AContact')}</Title>{' '}
            {t('ProofRequest.IsRequestng')}:
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
          {attributeCredential.revoked ? (
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
            {valueFromAttributeCredential(attributeName, attributeCredential)}
          </Text>
        </View>
      )}
    ></FlatList>
  )
}

export default ProofRequestAttributeDetails
