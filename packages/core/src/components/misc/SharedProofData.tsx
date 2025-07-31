import { useAgent } from '@credo-ts/react-hooks'
import { GroupedSharedProofDataItem, getProofData, groupSharedProofDataByCredential } from '@bifold/verifier'
import { BrandingOverlayType, Field } from '@bifold/oca/build/legacy'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import VerifierCredentialCard from './VerifierCredentialCard'
import { useAnimatedComponents } from '../../contexts/animated-components'
import { useTheme } from '../../contexts/theme'
import { buildFieldsFromSharedAnonCredsProof } from '../../utils/oca'
import { TOKENS, useServices } from '../../container-api'

interface SharedProofDataProps {
  recordId: string
  onSharedProofDataLoad?: (sharedProofData: GroupedSharedProofDataItem[]) => void
}

const SharedDataCard: React.FC<{ sharedData: GroupedSharedProofDataItem }> = ({ sharedData }) => {
  const { ColorPalette } = useTheme()
  const [attributes, setAttributes] = useState<Field[]>([])
  useEffect(() => {
    const attributes = buildFieldsFromSharedAnonCredsProof(sharedData.data)
    setAttributes(attributes)
  }, [sharedData])
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])

  return (
    <View style={{ marginBottom: 15 }}>
      <VerifierCredentialCard
        displayItems={attributes}
        style={
          bundleResolver.getBrandingOverlayType() === BrandingOverlayType.Branding10
            ? { backgroundColor: ColorPalette.brand.secondaryBackground }
            : undefined
        }
        credDefId={sharedData.identifiers.cred_def_id}
        schemaId={sharedData.identifiers.schema_id}
        elevated
        brandingOverlayType={bundleResolver.getBrandingOverlayType()}
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
  }, [agent, recordId, onSharedProofDataLoad])

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
