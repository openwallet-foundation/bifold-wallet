import { useAgent } from '@credo-ts/react-hooks'
import {
  GroupedSharedProofDataItem,
  getProofData,
  groupSharedProofDataByCredential,
} from '@hyperledger/aries-bifold-verifier'
import { Field } from '@hyperledger/aries-oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import VerifierCredentialCard from '../../components/misc/VerifierCredentialCard'
import { useAnimatedComponents } from '../../contexts/animated-components'
import { useTheme } from '../../contexts/theme'
import { buildFieldsFromSharedAnonCredsProof } from '../../utils/oca'

interface SharedProofDataProps {
  recordId: string
  onSharedProofDataLoad?: (sharedProofData: GroupedSharedProofDataItem[]) => void
}

const SharedDataCard: React.FC<{ sharedData: GroupedSharedProofDataItem }> = ({ sharedData }) => {
  const { ColorPallet } = useTheme()
  const [attributes, setAttributes] = useState<Field[]>([])
  useEffect(() => {
    const attributes = buildFieldsFromSharedAnonCredsProof(sharedData.data)
    setAttributes(attributes)
  }, [sharedData])

  return (
    <View style={{ marginBottom: 15 }}>
      <VerifierCredentialCard
        displayItems={attributes}
        style={{ backgroundColor: ColorPallet.brand.secondaryBackground }}
        credDefId={sharedData.identifiers.cred_def_id}
        schemaId={sharedData.identifiers.schema_id}
        elevated
      />
    </View>
  )
}

const SharedProofData: React.FC<SharedProofDataProps> = ({ recordId, onSharedProofDataLoad }: SharedProofDataProps) => {
  const { agent } = useAgent()
  const { LoadingIndicator } = useAnimatedComponents()
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    loaderContainer: {
      height: 200,
      marginTop: 80,
    },
  })

  if (!agent) {
    throw new Error('Unable to fetch agent from Credo')
  }

  const [loading, setLoading] = useState<boolean>(true)
  const [sharedData, setSharedData] = useState<GroupedSharedProofDataItem[] | undefined>(undefined)

  useEffect(() => {
    getProofData(agent, recordId)
      .then((data) => {
        if (data) {
          const groupedSharedProofData = groupSharedProofDataByCredential(data)
          const sharedData = Array.from(groupedSharedProofData.values())
          setSharedData(sharedData)
          if (!onSharedProofDataLoad) return
          onSharedProofDataLoad(sharedData)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [recordId])

  return (
    <View style={styles.container}>
      {loading || !sharedData ? (
        <View style={styles.loaderContainer}>
          <LoadingIndicator />
        </View>
      ) : (
        <View>
          {sharedData.map((item) => (
            <SharedDataCard key={item.identifiers.cred_def_id} sharedData={item} />
          ))}
        </View>
      )}
    </View>
  )
}

export default SharedProofData
