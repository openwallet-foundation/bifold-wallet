import { ProofExchangeRecord, ProofState } from '@credo-ts/core'
import { useConnectionById } from '@credo-ts/react-hooks'
import { isPresentationReceived, useProofsByTemplateId } from '@hyperledger/aries-bifold-verifier'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import EmptyList from '../components/misc/EmptyList'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { formatTime, getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'

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
  const [store] = useStore()
  const connection = useConnectionById(record.connectionId ?? '')
  const theirLabel = useMemo(
    () => getConnectionName(connection, store.preferences.alternateContactNames),
    [connection, store.preferences.alternateContactNames]
  )

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
    },
    date: {
      ...ListItems.requestTemplateDate,
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
      accessibilityRole="button"
      testID={testIdWithKey('ProofDetails')}
    >
      <View style={style.leftContainer}>
        <View style={style.cardRow}>
          <ThemedText style={style.valueLabel}>{t('Verifier.PresentationFrom')}:</ThemedText>
          <ThemedText style={style.valueText}>{theirLabel || t('Verifier.ConnectionlessPresentation')}</ThemedText>
        </View>
        <View style={style.cardRow}>
          <ThemedText style={style.valueLabel}>{t('Verifier.PresentationState')}:</ThemedText>
          <ThemedText style={style.valueText}>{t(getPresentationStateLabel(record) as any)}</ThemedText>
        </View>
      </View>
      <View style={style.rightContainer}>
        {presentationReceived && <Icon style={style.icon} name={'chevron-right'} />}
        <ThemedText style={style.date}>{formatTime(record.createdAt, { shortMonth: true })}</ThemedText>
      </View>
    </TouchableOpacity>
  )
}

const ProofRequestUsageHistory: React.FC<ProofRequestUsageHistoryProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequestUsageHistory route params were not set properly')
  }

  const { templateId } = route.params

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
