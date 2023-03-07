import type { StackScreenProps } from '@react-navigation/stack'

import { ProofExchangeRecord } from '@aries-framework/core'
import { useProofById } from '@aries-framework/react-hooks'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import SharedProofData from '../components/misc/SharedProofData'
import { ProofRequestsStackParams, Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

const collapsedHeight = 60

const styles = StyleSheet.create({
  header: {
    display: 'flex',
  },
  content: {
    display: 'flex',
  },
  footer: {
    display: 'flex',
  },
  footerButton: {
    paddingTop: 10,
  },
})

interface VerifiedProofProps {
  record: ProofExchangeRecord
}

interface UnverifiedProofProps {
  record: ProofExchangeRecord
}

const VerifiedProof: React.FC<VerifiedProofProps> = ({ record }: VerifiedProofProps) => {
  const { t } = useTranslation()

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

  return (
    <View>
      <View style={styles.header}>
        <Text>{t('Verifier.InformationReceived')}</Text>
      </View>
      <Collapsible collapsed={isCollapsed} enablePointerEvents={true} collapsedHeight={collapsedHeight}>
        <SharedProofData recordId={record.id} />
      </Collapsible>
      <View style={styles.footerButton}>
        {isCollapsed ? (
          <Button
            title={t('Verifier.ViewDetails')}
            accessibilityLabel={t('Verifier.ViewDetails')}
            testID={testIdWithKey('ViewDetails')}
            buttonType={ButtonType.Primary}
            onPress={() => setIsCollapsed(!isCollapsed)}
          />
        ) : (
          <Button
            title={t('Verifier.HideDetails')}
            accessibilityLabel={t('Verifier.HideDetails')}
            testID={testIdWithKey('HideDetails')}
            buttonType={ButtonType.Primary}
            onPress={() => setIsCollapsed(!isCollapsed)}
          />
        )}
      </View>
    </View>
  )
}

const UnverifiedProof: React.FC<UnverifiedProofProps> = () => {
  const { t } = useTranslation()

  return (
    <View style={styles.header}>
      <Text>{t('Verifier.ProofVerificationFailed')}</Text>
    </View>
  )
}

const ProofDetails: React.FC<ProofDetailsProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { recordId } = route?.params

  const { t } = useTranslation()
  const record: ProofExchangeRecord = useProofById(recordId)

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record.isVerified && <VerifiedProof record={record} />}
      {!record.isVerified && <UnverifiedProof record={record} />}
      <View style={styles.footer}>
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
    </SafeAreaView>
  )
}

export default ProofDetails
