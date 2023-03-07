import type { StackScreenProps } from '@react-navigation/stack'

import { ProofState } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { createConnectionlessProofRequestInvitation } from '../../verifier/utils/proof-request'
import LoadingIndicator from '../components/animated/LoadingIndicator'
import Button, { ButtonType } from '../components/buttons/Button'
import QRRenderer from '../components/misc/QRRenderer'
import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type ProofRequestingProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequesting>

const styles = StyleSheet.create({
  headerTextContainer: {
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  footerButton: {
    paddingTop: 10,
  },
})

const ProofRequesting: React.FC<ProofRequestingProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { templateId } = route?.params

  const { agent } = useAgent()

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const { t } = useTranslation()

  const [generatingRequest, setGeneratingRequest] = useState(true)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  const record = recordId ? useProofById(recordId) : undefined

  const createProofRequest = useCallback(async () => {
    try {
      setMessage(undefined)
      setGeneratingRequest(true)
      const result = await createConnectionlessProofRequestInvitation(agent, templateId)
      if (result) {
        setRecordId(result.proofRecord.id)
        setMessage(JSON.stringify(result.invitation.toJSON()))
      }
    } finally {
      setGeneratingRequest(false)
    }
  }, [agent, templateId])

  useEffect(() => {
    createProofRequest()
  }, [createProofRequest])

  useEffect(() => {
    if (record && (record.state === ProofState.PresentationReceived || record.state === ProofState.Done)) {
      navigation.navigate(Screens.ProofDetails, { recordId: record.id })
    }
  }, [record])

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {generatingRequest && <LoadingIndicator />}
      {message && <QRRenderer value={message} />}
      <View style={styles.footerButton}>
        <Button
          title={t('Verifier.GenerateNewQR')}
          accessibilityLabel={t('Verifier.GenerateNewQR')}
          testID={testIdWithKey('GenerateNewQR')}
          buttonType={ButtonType.Primary}
          onPress={() => createProofRequest()}
        />
      </View>
    </SafeAreaView>
  )

  return null
}

export default ProofRequesting
