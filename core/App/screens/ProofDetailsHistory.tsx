import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { GroupedSharedProofDataItem } from '../../verifier/types/proof'
import { markProofAsViewed } from '../../verifier/utils/proof'
import SharedProofData from '../components/misc/SharedProofData'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetailsHistory>

interface ProofDetailsHistoryProps {
  record: ProofExchangeRecord
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetailsHistory>
}

const VerifiedProof: React.FC<ProofDetailsHistoryProps> = ({ record, navigation }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      marginHorizontal: 30,
      marginTop: 10,
    },
    descriptionContainer: { marginVertical: 20 },
    descriptionText: {
      color: ColorPallet.grayscale.white,
    },
    label: {
      fontWeight: 'bold',
    },
  })

  const connection = record.connectionId ? useConnectionById(record.connectionId) : undefined
  const connectionLabel = useMemo(
    () => (connection ? connection?.alias || connection?.theirLabel : t('Verifier.ConnectionLessLabel')),
    [connection]
  )

  const [sharedProofDataItems, setSharedProofDataItems] = useState<GroupedSharedProofDataItem[]>([])

  const onSharedProofDataLoad = (data: GroupedSharedProofDataItem[]) => {
    setSharedProofDataItems(data)
  }

  useEffect(() => {
    navigation.setOptions({ title: connectionLabel }) //
  }, [connectionLabel])

  return (
    <ScrollView>
      <View style={styles.container}>
        {sharedProofDataItems.length > 0 && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              <Text style={styles.label}>{connectionLabel}</Text>{' '}
              {t('ProofRequest.ShareFollowingInformation', { count: sharedProofDataItems.length })}
            </Text>
          </View>
        )}
        <SharedProofData recordId={record.id} onSharedProofDataLoad={onSharedProofDataLoad} />
      </View>
    </ScrollView>
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
