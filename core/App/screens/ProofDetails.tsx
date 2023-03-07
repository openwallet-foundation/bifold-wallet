import type { StackScreenProps } from '@react-navigation/stack'

import { useAgent } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { getProofData, GroupedSharedProofData, groupSharedProofDataByCredential } from '../../verifier/utils/proof'
import { ProofRequestsStackParams, Screens } from '../types/navigators'

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
    getProofData(agent, recordId).then((data) => {
      if (!data) {
        throw new Error('Unsupported proof data!')
      }
      setProofData(groupSharedProofDataByCredential(data))
    })
  }, [agent, recordId])

  return (
    <SafeAreaView style={{ flexGrow: 1, flex: 1 }} edges={['left', 'right']}>
      <Text>{JSON.stringify(proofData)}</Text>
    </SafeAreaView>
  )
}

export default ProofDetails
