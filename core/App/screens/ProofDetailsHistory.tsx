import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { markProofAsViewed } from '../../verifier/utils/proof'
import SharedProofData from '../components/misc/SharedProofData'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetailsHistory>

interface ProofDetailsHistoryProps {
  record: ProofExchangeRecord
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetailsHistory>
}

const VerifiedProof: React.FC<ProofDetailsHistoryProps> = ({ record, navigation }) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      marginHorizontal: 30,
      marginTop: 10,
    },
  })

  const connection = record.connectionId ? useConnectionById(record.connectionId) : undefined
  const connectionLabel = connection ? connection?.alias || connection?.theirLabel : ''

  useEffect(() => {
    if (!connection) return
    navigation.setOptions({ title: connectionLabel }) //
  }, [connection])

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
