import type { StackScreenProps } from '@react-navigation/stack'

import { ProofState } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { createConnectionlessProofRequestInvitation } from '../../verifier/utils/proof-request'
import QRRenderer from '../components/misc/QRRenderer'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

type ProofRequestingProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofRequesting>

const ProofRequesting: React.FC<ProofRequestingProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { templateId } = route?.params

  const { agent } = useAgent()

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const [message, setMessage] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  const record = recordId ? useProofById(recordId) : undefined

  useEffect(() => {
    createConnectionlessProofRequestInvitation(agent, templateId).then((result) => {
      if (!result) {
        throw new Error('Unable to create Proof Request')
      }
      setRecordId(result.proofRecord.id)
      setMessage(JSON.stringify(result.invitation.toJSON()))
    })
  }, [agent, templateId])

  useEffect(() => {
    if (record && (record.state === ProofState.PresentationReceived || record.state === ProofState.Done)) {
      navigation.navigate(Screens.ProofDetails, { recordId: record.id })
    }
  }, [record])

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {message && <QRRenderer value={message} />}
    </SafeAreaView>
  )
}

export default ProofRequesting
