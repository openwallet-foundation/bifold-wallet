import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord, ProofState } from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { ProofCustomMetadata, ProofMetadata, GroupedSharedProofDataItem, markProofAsViewed } from '../../verifier'
import CheckInCircle from '../assets/img/check-in-circle.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

interface VerifiedProofProps {
  record: ProofExchangeRecord
  isHistory?: boolean
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetails>
}

interface UnverifiedProofProps {
  record: ProofExchangeRecord
}

const VerifiedProof: React.FC<VerifiedProofProps> = ({ record, navigation, isHistory }: VerifiedProofProps) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    header: {
      backgroundColor: ColorPallet.semantic.success,
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    headerTitle: {
      marginHorizontal: 10,
      color: ColorPallet.grayscale.white,
      fontSize: 34,
      fontWeight: 'bold',
    },
    headerDetails: {
      color: ColorPallet.grayscale.white,
      marginVertical: 10,
      fontSize: 18,
    },
    descriptionContainer: {
      marginHorizontal: 30,
      marginVertical: 30,
    },
    descriptionText: {
      fontSize: 18,
      color: TextTheme.normal.color,
    },
    label: {
      fontWeight: 'bold',
    },
    content: {
      flexGrow: 1,
      marginHorizontal: 30,
      marginTop: 10,
    },
    footerButton: {
      margin: 20,
    },
  })

  const connection = useConnectionById(record.connectionId || '')
  const connectionLabel = useMemo(
    () => (connection ? connection?.alias || connection?.theirLabel : t('Verifier.ConnectionLessLabel')),
    [connection]
  )

  const [sharedProofDataItems, setSharedProofDataItems] = useState<GroupedSharedProofDataItem[]>([])

  const onSharedProofDataLoad = (data: GroupedSharedProofDataItem[]) => {
    setSharedProofDataItems(data)
  }

  const onGenerateNew = useCallback(() => {
    const metadata = record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
    if (metadata.proof_request_template_id) {
      navigation.navigate(Screens.ProofRequesting, { templateId: metadata.proof_request_template_id })
    } else {
      navigation.navigate(Screens.ProofRequests, {})
    }
  }, [navigation])

  useEffect(() => {
    if (!connection || !isHistory) return
    navigation.setOptions({ title: connectionLabel })
  }, [connection])

  if (isHistory) {
    return (
      <ScrollView style={{ flexGrow: 1 }} testID={testIdWithKey('ProofDetailsHistoryView')}>
        <View style={styles.container}>
          {sharedProofDataItems.length > 0 && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                <Text style={styles.label}>{connectionLabel}</Text>{' '}
                {t('ProofRequest.ShareFollowingInformation', { count: sharedProofDataItems.length })}
              </Text>
            </View>
          )}
          <View style={styles.content}>
            <SharedProofData recordId={record.id} onSharedProofDataLoad={onSharedProofDataLoad} />
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} testID={testIdWithKey('ProofDetailsView')}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <CheckInCircle {...{ height: 45, width: 45 }} />
            <Text style={styles.headerTitle}>{t('Verifier.InformationReceived')}</Text>
          </View>
          <Text style={styles.headerDetails}>
            {connectionLabel} {t('Verifier.InformationReceivedDetails')}
          </Text>
        </View>
        <View style={styles.content}>
          <SharedProofData recordId={record.id} />
        </View>
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
    </ScrollView>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = ({ record }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    header: {
      flexGrow: 1,
      backgroundColor: ColorPallet.semantic.error,
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    headerTitle: {
      marginHorizontal: 8,
      color: ColorPallet.grayscale.white,
      fontSize: 34,
      fontWeight: 'bold',
    },
    headerDetails: {
      color: ColorPallet.grayscale.white,
      marginVertical: 10,
      fontSize: 18,
    },
  })

  return (
    <View testID={testIdWithKey('UnverifiedProofView')}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Icon name="bookmark-remove" size={45} color={'white'} />
          {record.state === ProofState.Abandoned && (
            <Text style={styles.headerTitle}>{t('Verifier.PresentationDeclined')}</Text>
          )}
          {record.isVerified === false && (
            <Text style={styles.headerTitle}>{t('Verifier.ProofVerificationFailed')}</Text>
          )}
        </View>
      </View>
    </View>
  )
}

const ProofDetails: React.FC<ProofDetailsProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { recordId, isHistory } = route?.params
  const record: ProofExchangeRecord = useProofById(recordId)
  const { agent } = useAgent()

  useEffect(() => {
    if (agent) markProofAsViewed(agent, record)
  }, [])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (route.params.isHistory) {
          navigation.goBack()
        } else {
          navigation.navigate(Screens.ProofRequests, {})
        }
        return true
      }

      BackHandler.addEventListener('hardwareBackPress', onBackPress)

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [])
  )

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record.isVerified && <VerifiedProof record={record} isHistory={isHistory} navigation={navigation} />}
      {!record.isVerified && <UnverifiedProof record={record} />}
    </SafeAreaView>
  )
}

export default ProofDetails
