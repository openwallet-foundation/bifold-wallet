import { useAgent } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  CredentialSharedProofData,
  getProofData,
  GroupedSharedProofData,
  groupSharedProofDataByCredential,
} from '../../../verifier/utils/proof'

interface SharedProofDataProps {
  recordId: string
}

const styles = StyleSheet.create({
  content: {
    display: 'flex',
  },
})

const SharedProofData: React.FC<SharedProofDataProps> = ({ recordId }: SharedProofDataProps) => {
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

  const renderSharedAttributes = (record: CredentialSharedProofData) => {
    return record.sharedAttributes.map((attribute) => {
      return (
        <View>
          <Text>{attribute.name}</Text>
          <Text>{attribute.value}</Text>
        </View>
      )
    })
  }

  const renderSharedAttributeGroups = (record: CredentialSharedProofData) => {
    return record.sharedAttributeGroups.map((attribute) => {
      attribute.attributes.map((attribute) => {
        return (
          <View>
            <Text>{attribute.name}</Text>
            <Text>{attribute.value}</Text>
          </View>
        )
      })
    })
  }

  const renderResolvedPredicates = (record: CredentialSharedProofData) => {
    return record.resolvedPredicates.map((attribute) => {
      return (
        <View>
          <Text>{attribute.name}</Text>
          <Text>{`${attribute.predicateType} ${attribute?.predicateValue}`}</Text>
        </View>
      )
    })
  }

  return (
    <View style={styles.content}>
      {proofData &&
        Object.entries(proofData).map(([_, data]) => (
          <View style={{ margin: 10 }}>
            {renderSharedAttributes(data)}
            {renderSharedAttributeGroups(data)}
            {renderResolvedPredicates(data)}
          </View>
        ))}
    </View>
  )
}

export default SharedProofData
