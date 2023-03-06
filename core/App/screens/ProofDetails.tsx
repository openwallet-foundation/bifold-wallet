import type { StackScreenProps } from '@react-navigation/stack'

import { useAgent } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProofRequestsStackParams, Screens } from '../types/navigators'
import { GroupedSharedProofData, groupSharedProofDataByCredential, parseIndyProof } from '../utils/proof'

type ProofDetailsProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofDetails>

const ProofDetails: React.FC<ProofDetailsProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('ProofRequesting route prams were not set properly')
  }

  const { recordId } = route?.params

  const { agent } = useAgent()

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const [proofData, setProofData] = useState<GroupedSharedProofData | undefined>(undefined)

  useEffect(() => {
    agent.proofs.getFormatData(recordId).then((data) => {
      if (data.request?.indy && data.presentation?.indy) {
        const proofData = parseIndyProof(data.request.indy, data.presentation.indy)
        setProofData(groupSharedProofDataByCredential(proofData))
      } else {
        throw new Error('Unsupported proof data!')
      }
    })
  }, [agent, recordId])

  return (
    <SafeAreaView style={{ flexGrow: 1, flex: 1 }} edges={['left', 'right']}>
      <Text>{JSON.stringify(proofData)}</Text>
    </SafeAreaView>
  )
}

export default ProofDetails
