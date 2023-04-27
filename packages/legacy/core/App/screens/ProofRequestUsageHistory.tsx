import { ProofExchangeRecord, ProofState } from '@aries-framework/core'
import { useConnectionById } from '@aries-framework/react-hooks'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useProofsByTemplateId, isPresentationReceived } from '../../verifier'
import EmptyList from '../components/misc/EmptyList'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { formatTime } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ProofRequestUsageHistoryProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequestUsageHistory>

interface ProofRequestUsageHistoryRecordProps {
  navigation: StackNavigationProp<ProofRequestsStackParams>
  record: ProofExchangeRecord
}

const getPresentationStateLabel = (record: ProofExchangeRecord) => {
  switch (record.state) {
    case ProofState.RequestSent:
      return 'Verifier.RequestSent'
    case ProofState.PresentationReceived:
      return 'Verifier.PresentationReceived'
    case ProofState.Declined:
    case ProofState.Abandoned:
      return 'Verifier.ProofRequestRejected'
    case ProofState.Done:
      return record.isVerified ? 'Verifier.PresentationReceived' : 'Verifier.PresentationFailed'
    default:
      return ''
  }
}

const ProofRequestUsageHistoryRecord: React.FC<ProofRequestUsageHistoryRecordProps> = ({ record, navigation }) => {
  const { t } = useTranslation()
  const { ListItems, ColorPallet } = useTheme()

  const connection = record.connectionId ? useConnectionById(record.connectionId) : undefined

  const style = StyleSheet.create({
    card: {
      ...ListItems.requestTemplateBackground,
      flexGrow: 1,
      flexDirection: 'row',
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    leftContainer: {
      flexDirection: 'column',
      marginVertical: 10,
    },
    cardRow: {
      flexDirection: 'row',
      marginVertical: 2,
    },
    valueLabel: {
      color: ColorPallet.grayscale.black,
    },
    valueText: {
      ...ListItems.requestTemplateTitle,
      fontSize: 16,
      marginLeft: 4,
    },
    rightContainer: {
      flexGrow: 1,
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    icon: {
      ...ListItems.requestTemplateIcon,
      fontSize: 36,
    },
    date: {
      ...ListItems.requestTemplateDate,
      fontSize: 10,
    },
  })

  const presentationReceived = useMemo(() => isPresentationReceived(record), [record])

  const onDetails = useCallback(() => {
    navigation.navigate(Screens.ProofDetails, { recordId: record.id, isHistory: true })
  }, [navigation, record])

  return (
    <TouchableOpacity
      style={style.card}
      onPress={onDetails}
      disabled={!presentationReceived}
      accessibilityLabel={t('Screens.ProofDetails')}
      testID={testIdWithKey('ProofDetails')}
    >
      <View style={style.leftContainer}>
        <View style={style.cardRow}>
          <Text style={style.valueLabel}>{t('Verifier.PresentationFrom')}:</Text>
          <Text style={style.valueText}>{connection?.theirLabel || t('Verifier.ConnectionlessPresentation')}</Text>
        </View>
        <View style={style.cardRow}>
          <Text style={style.valueLabel}>{t('Verifier.PresentationState')}:</Text>
          <Text style={style.valueText}>{t(getPresentationStateLabel(record) as any)}</Text>
        </View>
      </View>
      <View style={style.rightContainer}>
        {presentationReceived && <Icon style={style.icon} name={'chevron-right'} />}
        <Text style={style.date}>{formatTime(record.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const ProofRequestUsageHistory: React.FC<ProofRequestUsageHistoryProps> = ({ route, navigation }) => {
  const { templateId } = route?.params

  const style = StyleSheet.create({
    container: {
      flexGrow: 1,
      margin: 20,
      elevation: 5,
    },
  })

  const proofs = useProofsByTemplateId(templateId)

  return (
    <SafeAreaView style={style.container} edges={['left', 'right']}>
      <FlatList
        data={proofs}
        keyExtractor={(proof) => proof.id}
        renderItem={({ item }) => <ProofRequestUsageHistoryRecord record={item} navigation={navigation} />}
        ListEmptyComponent={() => <EmptyList />}
      />
    </SafeAreaView>
  )
}

export default ProofRequestUsageHistory
