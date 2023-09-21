import { AnonCredsCredentialsForProofRequest } from '@aries-framework/anoncreds'
import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useCredentialById, useCredentials, useProofById } from '@aries-framework/react-hooks'
import { ProofCredentialItems } from '@hyperledger/aries-oca/build/legacy'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecordLoading from '../components/animated/RecordLoading'
import { CredentialCard } from '../components/misc'
import { EventTypes } from '../constants'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ProofRequestsStackParams, Screens, Stacks } from '../types/navigators'
import { Fields, evaluatePredicates, retrieveCredentialsForProof } from '../utils/helpers'
import { getAllCredentialsForProof } from '../hooks/proofs'

type ProofChangeProps = StackScreenProps<ProofRequestsStackParams, Screens.ProofChangeCredential>

const ProofChangeCredential: React.FC<ProofChangeProps> = ({ route, navigation }) => {
  if (!route?.params) {
    throw new Error('Change credential route params were not set properly')
  }
  const proofId = route.params.proofId
  const fullCredentials = useCredentials().records
  const altCredentials = route.params.altCredentials
  const selectedCredentials = route.params.selectedCredentials
  const proof = useProofById(proofId)
  const { ColorPallet, TextTheme } = useTheme()
  const { t } = useTranslation()
  const { agent } = useAgent()
  const [loading, setLoading] = useState(false)
  const [proofItems, setProofItems] = useState<ProofCredentialItems[]>([])
  const [retrievedCredentials, setRetrievedCredentials] = useState<AnonCredsCredentialsForProofRequest>()
  const [selectedCred, setSelectedCred] = useState('')
  const credProofPromise = getAllCredentialsForProof(proofId)
  const styles = StyleSheet.create({
    pageContainer: {
      flex: 1,
    },
    pageMargin: {
      marginHorizontal: 20,
    },
    cardLoading: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      flex: 1,
      flexGrow: 1,
      marginVertical: 35,
      borderRadius: 15,
      paddingHorizontal: 10,
    },
    selectedCred: {
      borderWidth: 5,
      borderRadius: 15,
      borderColor: ColorPallet.semantic.focus,
    },
  })

  useEffect(() => {
    if (proofItems) {
      const displayedCredIds: string[] = proofItems.map((item) => item.credId)
      setSelectedCred(displayedCredIds.find((id) => selectedCredentials.includes(id)) ?? '')
    }
  }, [proofItems])

  const getCredentialsFields = (): Fields => ({
    ...retrievedCredentials?.attributes,
    ...retrievedCredentials?.predicates,
  })

  useEffect(() => {

    setLoading(true)

    credProofPromise?.then((value) => {
      if (value) {
        const { groupedProof, retrievedCredentials } = value
        setLoading(false)
        setRetrievedCredentials(retrievedCredentials)
        setProofItems(groupedProof.filter((proof) => altCredentials.includes(proof.credId)))
      }
    })
      .catch((err: unknown) => {
        const error = new BifoldError(
          t('Error.Title1026'),
          t('Error.Message1026'),
          (err as Error)?.message ?? err,
          1026
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      })
  }, [])

  const listHeader = () => {
    return (
      <View style={{ ...styles.pageMargin, marginVertical: 20 }}>
        {loading ? (
          <View style={styles.cardLoading}>
            <RecordLoading />
          </View>
        ) : (
          <Text style={TextTheme.normal}>You have multiple credentials to choose from:</Text>
        )}
      </View>
    )
  }

  const changeCred = (credId: string, altCreds: string[]) => {
    const newSelectedCreds = selectedCredentials.filter(id => !altCreds.includes(id))
    navigation.getParent()?.navigate(Stacks.NotificationStack, {
      screen: Screens.ProofRequest,
      params: {
        proofId,
        selectedCredentials: [credId, ...newSelectedCreds],
      },
    })
  }

  return (
    <SafeAreaView style={styles.pageContainer} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={proofItems}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => {
          return (
            <View style={styles.pageMargin}>
              <TouchableOpacity
                onPress={() => changeCred(item.credId ?? '', item.altCredentials)}
                style={[item.credId === selectedCred ? styles.selectedCred : undefined, { marginBottom: 10 }]}
              >
                <CredentialCard
                  credential={item.credExchangeRecord}
                  credDefId={item.credDefId}
                  schemaId={item.schemaId}
                  displayItems={[
                    ...(item.attributes ?? []),
                    ...evaluatePredicates(getCredentialsFields(), item.credDefId)(item),
                  ]}
                  credName={item.credName}
                  existsInWallet={true}
                  satisfiedPredicates={true}
                  proof={true}
                ></CredentialCard>
              </TouchableOpacity>
            </View>
          )
        }}
      ></FlatList>
    </SafeAreaView>
  )
}

export default ProofChangeCredential
