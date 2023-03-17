import type { StackScreenProps } from '@react-navigation/stack'

import { ConnectionRecord, ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProofCustomMetadata, ProofMetadata } from '../../verifier/types/metadata'
import { markProofAsViewed } from '../../verifier/utils/proof'
import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetailsHistory>

interface ProofDetailsHistoryProps {
  record: ProofExchangeRecord
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetailsHistory>
}

const VerifiedProof: React.FC<ProofDetailsHistoryProps> = ({ record, navigation }) => {
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      marginHorizontal: 30,
      marginTop: 10,
    },
    footer: {
      marginHorizontal: 30,
      marginVertical: 20,
    },
    footerButton: {
      marginTop: 10,
    },
  })

  const connection = record.connectionId ? useConnectionById(record.connectionId) : undefined
  const connectionLabel = connection ? connection?.alias || connection?.theirLabel : ''

  const onGenerateNew = useCallback(() => {
    const metadata = record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
    if (metadata.proof_request_template_id) {
      navigation.navigate(Screens.ProofRequesting, { templateId: metadata.proof_request_template_id })
    } else {
      navigation.navigate(Screens.ProofRequests, {})
    }
  }, [navigation])

  useEffect(() => {
    if (!connection) return
    navigation.setOptions({ title: connectionLabel }) //
  }, [connection])

  useEffect(() => {
    console.log(record)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginVertical: 20 }}>
          <Text style={{ color: 'white' }}>
            <Text style={{ fontWeight: 'bold' }}>{connectionLabel}</Text> is sharing the following information from 2
            credentials.
          </Text>
        </View>
        <SharedProofData recordId={record.id} />
      </View>
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Button
            title={t('Verifier.GenerateNewQR')}
            accessibilityLabel={t('Verifier.GenerateNewQR')}
            testID={testIdWithKey('GenerateNewQR')}
            buttonType={ButtonType.Primary}
            onPress={onGenerateNew}
          />
        </View>
      </View>
    </View>
  )
}

const ProofDetails: React.FC<ProofDetailsProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { recordId } = route?.params
  const record: ProofExchangeRecord = useProofById(recordId)
  const { agent } = useAgent()

  useEffect(() => {
    if (agent) markProofAsViewed(agent, record)
  }, [])

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      <VerifiedProof record={record} navigation={navigation} />
    </SafeAreaView>
  )
}

export default ProofDetails
