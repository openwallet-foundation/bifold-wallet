import { useAgent } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  CredentialSharedProofData,
  getProofData,
  GroupedSharedProofData,
  groupSharedProofDataByCredential,
} from '../../../verifier/utils/proof'
import { useTheme } from '../../contexts/theme'

interface SharedProofDataProps {
  recordId: string
}

const SharedProofData: React.FC<SharedProofDataProps> = ({ recordId }: SharedProofDataProps) => {
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    sharedDataCard: {
      flexGrow: 1,
      flexDirection: 'row',
      borderRadius: 10,
      marginTop: 20,
      backgroundColor: ColorPallet.grayscale.white,
    },
    cardColor: {
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      width: 50,
      backgroundColor: ColorPallet.brand.primary,
    },
    cardAttributes: {
      paddingTop: 20,
      paddingBottom: 10,
    },
    attributeContainer: {
      marginBottom: 10,
      paddingHorizontal: 20,
    },
    attributeName: {
      fontSize: 16,
      fontWeight: 'normal',
      color: ColorPallet.grayscale.black,
    },
    attributeValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: ColorPallet.grayscale.black,
    },
  })

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
        <View style={styles.attributeContainer}>
          <Text style={styles.attributeName}>{attribute.name}</Text>
          <Text style={styles.attributeValue}>{attribute.value}</Text>
        </View>
      )
    })
  }

  const renderSharedAttributeGroups = (record: CredentialSharedProofData) => {
    return record.sharedAttributeGroups.flatMap((attribute) => {
      return attribute.attributes.map((attribute) => {
        return (
          <View style={styles.attributeContainer}>
            <Text style={styles.attributeName}>{attribute.name}</Text>
            <Text style={styles.attributeValue}>{attribute.value}</Text>
          </View>
        )
      })
    })
  }

  const renderResolvedPredicates = (record: CredentialSharedProofData) => {
    return record.resolvedPredicates.map((attribute) => {
      return (
        <View style={styles.attributeContainer}>
          <Text style={styles.attributeName}>{attribute.name}</Text>
          <Text style={styles.attributeValue}>{`${attribute.predicateType} ${attribute?.predicateValue}`}</Text>
        </View>
      )
    })
  }

  return (
    <View style={{ flexGrow: 1 }}>
      {proofData &&
        Object.entries(proofData).map(([schema, data]) => (
          <View key={schema} style={styles.sharedDataCard}>
            <View style={styles.cardColor} />
            <View style={styles.cardAttributes}>
              {renderSharedAttributes(data)}
              {renderSharedAttributeGroups(data)}
              {renderResolvedPredicates(data)}
            </View>
          </View>
        ))}
    </View>
  )
}

export default SharedProofData
