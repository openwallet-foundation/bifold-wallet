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
      ...TextTheme.normal,
      fontWeight: 'bold',
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

  const onDone = useCallback(() => {
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
              title={t('Global.Done')}
              accessibilityLabel={t('Global.Done')}
              testID={testIdWithKey('Done')}
              buttonType={ButtonType.Primary}
              onPress={onDone}
            />
          </View>
          <Button
            title={t('Verifier.GenerateNewQR')}
            accessibilityLabel={t('Verifier.GenerateNewQR')}
            testID={testIdWithKey('GenerateNewQR')}
            buttonType={ButtonType.Secondary}
            onPress={onGenerateNew}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = ({ record, navigation }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    header: {
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
    footerButton: {
      margin: 20,
      marginTop: 'auto',
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} testID={testIdWithKey('UnverifiedProofView')}>
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
      <View style={styles.footerButton}>
        <Button
          title={t('Verifier.GenerateNewQR')}
          accessibilityLabel={t('Verifier.GenerateNewQR')}
          testID={testIdWithKey('GenerateNewQR')}
          buttonType={ButtonType.Primary}
          onPress={onGenerateNew}
        />
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
