import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord, ProofState } from '@credo-ts/core'
import { useAgent, useConnectionById, useProofById } from '@credo-ts/react-hooks'
import {
  GroupedSharedProofDataItem,
  ProofCustomMetadata,
  ProofMetadata,
  markProofAsViewed,
} from '@hyperledger/aries-bifold-verifier'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import InformationReceived from '../assets/img/information-received.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

interface VerifiedProofProps {
  record: ProofExchangeRecord
  isHistory?: boolean
  senderReview?: boolean
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetails>
}

interface UnverifiedProofProps {
  record: ProofExchangeRecord
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetails>
}

const VerifiedProof: React.FC<VerifiedProofProps> = ({
  record,
  navigation,
  isHistory,
  senderReview,
}: VerifiedProofProps) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [store] = useStore()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    iconContainer: {
      backgroundColor: ColorPallet.notification.info,
      width: 100,
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
      borderRadius: 50,
      borderColor: ColorPallet.notification.infoBorder,
      borderWidth: 3,
      alignSelf: 'center',
      overflow: 'hidden',
    },
    header: {
      paddingHorizontal: 30,
      paddingTop: 20,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    headerTitle: {
      ...TextTheme.bold,
    },
    headerDetails: {
      ...TextTheme.normal,
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
      fontWeight: TextTheme.bold.fontWeight,
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
    () =>
      connection
        ? getConnectionName(connection, store.preferences.alternateContactNames)
        : t('Verifier.ConnectionLessLabel'),
    [connection, store.preferences.alternateContactNames]
  )

  const [sharedProofDataItems, setSharedProofDataItems] = useState<GroupedSharedProofDataItem[]>([])

  const onSharedProofDataLoad = (data: GroupedSharedProofDataItem[]) => {
    setSharedProofDataItems(data)
  }

  const onGenerateNew = useCallback(() => {
    const metadata = record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
    if (metadata?.proof_request_template_id) {
      navigation.navigate(Screens.ProofRequesting, { templateId: metadata.proof_request_template_id })
    } else {
      navigation.navigate(Screens.ProofRequests, {})
    }
  }, [navigation])

  const onBack = useCallback(() => {
    navigation.navigate(Screens.ProofRequests, {})
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
                {senderReview ? (
                  <>
                    {t('ProofRequest.ReviewSentInformation', { count: sharedProofDataItems.length })}{' '}
                    <Text style={styles.label}>{connectionLabel}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.label}>{connectionLabel}</Text>{' '}
                    {t('ProofRequest.ShareFollowingInformation', { count: sharedProofDataItems.length })}
                  </>
                )}
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
          <View style={styles.iconContainer}>
            <InformationReceived></InformationReceived>
          </View>
          <Text>
            <Text style={styles.headerTitle}>{t('Verifier.InformationReceived') + ' '}</Text>
            <Text style={styles.headerDetails}>{t('Verifier.InformationReceivedDetails')}</Text>
          </Text>
        </View>
        <View style={styles.content}>
          <SharedProofData recordId={record.id} />
        </View>
        <View style={styles.footerButton}>
          <View style={{ marginBottom: 15 }}>
            <Button
              title={t('Verifier.GenerateNewQR')}
              accessibilityLabel={t('Verifier.GenerateNewQR')}
              testID={testIdWithKey('GenerateNewQR')}
              buttonType={ButtonType.Primary}
              onPress={onGenerateNew}
            />
          </View>
          <Button
            title={t('Verifier.BackToList')}
            accessibilityLabel={t('Verifier.BackToList')}
            testID={testIdWithKey('BackToList')}
            buttonType={ButtonType.Secondary}
            onPress={onBack}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = ({ record, navigation }) => {
  const { t } = useTranslation()
  const { TextTheme, Assets } = useTheme()

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 20,
      paddingVertical: 30,
    },
    headerTitleContainer: {
      marginTop: 70,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    headerTitle: {
      ...TextTheme.headingTwo,
      fontWeight: TextTheme.normal.fontWeight,
    },
    footerButtons: {
      margin: 20,
      marginTop: 'auto',
    },
    buttonContainer: {
      marginBottom: 10,
      width: '100%',
    },
  })

  const onGenerateNew = useCallback(() => {
    const metadata = record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
    if (metadata?.proof_request_template_id) {
      navigation.navigate(Screens.ProofRequesting, { templateId: metadata.proof_request_template_id })
    } else {
      navigation.navigate(Screens.ProofRequests, {})
    }
  }, [navigation])

  const onBackToList = useCallback(() => {
    navigation.navigate(Screens.ProofRequests, {})
  }, [navigation])

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} testID={testIdWithKey('UnverifiedProofView')}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          {record.state === ProofState.Abandoned && (
            <Text style={styles.headerTitle}>{t('ProofRequest.ProofRequestDeclined')}</Text>
          )}
          {record.isVerified === false && (
            <Text style={styles.headerTitle}>{t('Verifier.ProofVerificationFailed')}</Text>
          )}
        </View>
        <Assets.svg.verifierRequestDeclined style={{ alignSelf: 'center', marginTop: 20 }} height={200} />
      </View>
      <View style={styles.footerButtons}>
        <View style={styles.buttonContainer}>
          <Button
            title={t('Verifier.GenerateNewQR')}
            accessibilityLabel={t('Verifier.GenerateNewQR')}
            testID={testIdWithKey('GenerateNewQR')}
            buttonType={ButtonType.Primary}
            onPress={onGenerateNew}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={t('Verifier.BackToList')}
            accessibilityLabel={t('Verifier.BackToList')}
            testID={testIdWithKey('BackToList')}
            buttonType={ButtonType.Secondary}
            onPress={onBackToList}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const ProofDetails: React.FC<ProofDetailsProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { recordId, isHistory, senderReview } = route?.params
  const record = useProofById(recordId)
  const { agent } = useAgent()
  const [store] = useStore()

  useEffect(() => {
    return () => {
      if (!store.preferences.useDataRetention) {
        agent?.proofs.deleteById(recordId)
      }
      if ((record?.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata).delete_conn_after_seen) {
        agent?.connections.deleteById(record?.connectionId ?? '')
      }
    }
  }, [])

  useEffect(() => {
    if (agent && record && !record.metadata?.data?.customMetadata?.details_seen) {
      markProofAsViewed(agent, record)
    }
  }, [record])

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

  if (!record) return null

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {(record.isVerified || senderReview) && (
        <VerifiedProof record={record} isHistory={isHistory} navigation={navigation} senderReview={senderReview} />
      )}
      {!(record.isVerified || senderReview) && <UnverifiedProof record={record} navigation={navigation} />}
    </SafeAreaView>
  )
}

export default ProofDetails
