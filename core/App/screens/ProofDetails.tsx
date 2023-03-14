import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { SafeAreaView } from 'react-native-safe-area-context'

import { markAsViewed } from '../../verifier/utils/proof'
import CheckInCircle from '../assets/img/check-in-circle.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { useTheme } from '../contexts/theme'
import { ProofRequestsStackParams, Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

const collapsedHeight = 160

interface VerifiedProofProps {
  record: ProofExchangeRecord
  navigation: StackNavigationProp<ProofRequestsStackParams, Screens.ProofDetails>
  isHistory?: boolean
}

interface UnverifiedProofProps {
  record: ProofExchangeRecord
}

const VerifiedProof: React.FC<VerifiedProofProps> = ({ record, navigation, isHistory }: VerifiedProofProps) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
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
      marginHorizontal: 8,
      color: ColorPallet.grayscale.white,
      fontSize: 34,
      fontWeight: 'bold',
    },
    headerDetails: {
      color: ColorPallet.grayscale.white,
      fontSize: 18,
    },
    content: {
      flexGrow: 1,
      marginHorizontal: 30,
      marginTop: 10,
    },
    footer: {
      marginHorizontal: 30,
    },
    footerButton: {
      marginTop: 10,
    },
  })

  const [isCollapsed, setIsCollapsed] = useState<boolean>(!isHistory)

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <CheckInCircle {...{ height: 45, width: 45 }} />
          <Text style={styles.headerTitle}>{t('Verifier.InformationReceived')}</Text>
        </View>
        <Text style={styles.headerDetails}>{t('Verifier.InformationReceivedDetails')}</Text>
      </View>
      <Collapsible collapsed={isCollapsed} collapsedHeight={collapsedHeight} enablePointerEvents={true}>
        <View style={styles.content}>
          <SharedProofData recordId={record.id} />
        </View>
      </Collapsible>
      {!isHistory && (
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <Button
              title={isCollapsed ? t('Verifier.ViewDetails') : t('Verifier.HideDetails')}
              accessibilityLabel={isCollapsed ? t('Verifier.ViewDetails') : t('Verifier.HideDetails')}
              testID={isCollapsed ? testIdWithKey('ViewDetails') : testIdWithKey('HideDetails')}
              buttonType={ButtonType.Primary}
              onPress={() => setIsCollapsed(!isCollapsed)}
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              title={t('Verifier.GenerateNewQR')}
              accessibilityLabel={t('Verifier.GenerateNewQR')}
              testID={testIdWithKey('GenerateNewQR')}
              buttonType={ButtonType.Secondary}
              onPress={() => {
                navigation?.getParent()?.navigate(Stacks.ProofRequestsStack, {
                  screen: Screens.ProofRequests,
                  params: { navigation },
                })
              }}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = () => {
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
  })

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <CheckInCircle {...{ height: 45, width: 45 }} />
          <Text style={styles.headerTitle}>{t('Verifier.ProofVerificationFailed')}</Text>
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
    if (agent) markAsViewed(agent, record)
  }, [agent, record])

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record.isVerified && <VerifiedProof record={record} navigation={navigation} isHistory={isHistory} />}
      {!record.isVerified && <UnverifiedProof record={record} />}
    </SafeAreaView>
  )
}

export default ProofDetails
