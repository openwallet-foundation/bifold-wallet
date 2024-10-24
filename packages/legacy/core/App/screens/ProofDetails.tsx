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
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { useStore } from '../contexts/store'
import { TOKENS, useServices } from '../container-api'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { useOutOfBandByConnectionId } from '../hooks/connections'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

type VerifiedProofProps = {
  record: ProofExchangeRecord
  isHistory?: boolean
  senderReview?: boolean
  connectionLabel: string
  onBackPressed: () => void
  onGenerateNewPressed: () => void
}

type UnverifiedProofProps = {
  record: ProofExchangeRecord
  onBackPressed: () => void
  onGenerateNewPressed: () => void
}

const VerifiedProof: React.FC<VerifiedProofProps> = ({
  record,
  isHistory,
  senderReview,
  connectionLabel,
  onBackPressed,
  onGenerateNewPressed,
}: VerifiedProofProps) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [sharedProofDataItems, setSharedProofDataItems] = useState<GroupedSharedProofDataItem[]>([])
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
      ...TextTheme.normal,
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

  const onSharedProofDataLoad = useCallback((data: GroupedSharedProofDataItem[]) => {
    setSharedProofDataItems(data)
  }, [])

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
          <View style={styles.iconContainer}>{<Assets.svg.informationReceived />}</View>
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
              onPress={onGenerateNewPressed}
            />
          </View>
          <Button
            title={t('Verifier.BackToList')}
            accessibilityLabel={t('Verifier.BackToList')}
            testID={testIdWithKey('BackToList')}
            buttonType={ButtonType.Secondary}
            onPress={onBackPressed}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = ({ record, onBackPressed, onGenerateNewPressed }) => {
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
            onPress={onGenerateNewPressed}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={t('Verifier.BackToList')}
            accessibilityLabel={t('Verifier.BackToList')}
            testID={testIdWithKey('BackToList')}
            buttonType={ButtonType.Secondary}
            onPress={onBackPressed}
          />
        </View>
      </View>
    </ScrollView>
  )
}

const ProofDetails: React.FC<ProofDetailsProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route params were not set properly')
  }

  const { recordId, isHistory, senderReview } = route.params
  const record = useProofById(recordId)
  const connection = useConnectionById(record?.connectionId ?? '')
  const goalCode = useOutOfBandByConnectionId(connection?.id ?? '')?.outOfBandInvitation.goalCode
  const { t } = useTranslation()
  const { agent } = useAgent()
  const [store] = useStore()
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  const connectionLabel = useMemo(
    () =>
      connection
        ? getConnectionName(connection, store.preferences.alternateContactNames)
        : t('Verifier.ConnectionLessLabel'),
    [connection, store.preferences.alternateContactNames, t]
  )

  const cleanup = useCallback((): Promise<PromiseSettledResult<void>[]> | undefined => {
    if (!agent) {
      return
    }

    const promises = Array<Promise<void>>()
    if (!store.preferences.useDataRetention) {
      promises.push(agent.proofs.deleteById(recordId))
    }

    if (
      record &&
      record.connectionId &&
      ((record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata).delete_conn_after_seen ||
        goalCode?.endsWith('verify.once'))
    ) {
      promises.push(agent.connections.deleteById(record.connectionId))
    }

    return Promise.allSettled(promises)
  }, [store.preferences.useDataRetention, agent, recordId, record, goalCode])

  const onBackPressed = useCallback(() => {
    cleanup()?.catch((err) => logger.error(`Error cleaning up proof, ${err}`))

    if (route.params.isHistory) {
      navigation.goBack()
      return null
    }

    navigation.navigate(Screens.ProofRequests, {})

    return null
  }, [navigation, cleanup, route.params.isHistory, logger])

  const onGenerateNewPressed = useCallback(() => {
    if (!record) {
      return
    }

    cleanup()?.catch((err) => logger.error(`Error cleaning up proof, ${err}`))

    const metadata = record.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
    if (metadata?.proof_request_template_id) {
      navigation.navigate(Screens.ProofRequesting, { templateId: metadata.proof_request_template_id })
    } else {
      navigation.navigate(Screens.ProofRequests, {})
    }
  }, [record, navigation, cleanup, logger])

  useEffect(() => {
    if (agent && record && !record.metadata?.data?.customMetadata?.details_seen) {
      markProofAsViewed(agent, record)
    }
  }, [agent, record])

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', onBackPressed)

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPressed)
    }, [onBackPressed])
  )

  useEffect(() => {
    if (!connectionLabel || !isHistory) {
      return
    }

    navigation.setOptions({ title: connectionLabel })
  }, [isHistory, navigation, connectionLabel])

  if (!record) return null

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {(record.isVerified || senderReview) && (
        <VerifiedProof
          record={record}
          isHistory={isHistory}
          senderReview={senderReview}
          connectionLabel={connectionLabel}
          onBackPressed={onBackPressed}
          onGenerateNewPressed={onGenerateNewPressed}
        />
      )}
      {!(record.isVerified || senderReview) && (
        <UnverifiedProof record={record} onBackPressed={onBackPressed} onGenerateNewPressed={onGenerateNewPressed} />
      )}
    </SafeAreaView>
  )
}

export default ProofDetails
