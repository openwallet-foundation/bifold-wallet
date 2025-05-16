import { StackScreenProps } from '@react-navigation/stack'
import { DeliveryStackParams, Screens } from '../../../types/navigators'
import ScreenLayout from '../../../layout/ScreenLayout'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../contexts/theme'
import { useEffect, useState } from 'react'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { isSdJwtProofRequest, isW3CProofRequest } from '../utils/utils'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import RecordLoading from '../../../components/animated/RecordLoading'
import { ThemedText } from '../../../components/texts/ThemedText'
import { testIdWithKey } from '../../../utils/testable'
import { CredentialCard } from '../../../components/misc'

type Props = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofCredentialSelect>
type TypedCred = {
  credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord
  claimFormat: string
}

const OpenIDProofCredentialSelect: React.FC<Props> = ({ route, navigation }: Props) => {
  if (!route?.params) {
    throw new Error('Change credential route params were not set properly')
  }
  const selectedCredentialID = route.params.selectedCredID
  const altCredentials = route.params.altCredIDs
  const onCredChange = route.params.onCredChange
  const { ColorPallet, SelectedCredTheme } = useTheme()
  const { getW3CCredentialById, getSdJwtCredentialById } = useOpenIDCredentials()

  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const [credentialsRequested, setCredentialsRequested] = useState<Array<TypedCred>>([])

  useEffect(() => {
    async function fetchCreds() {
      if (!altCredentials) return
      setLoading(true)

      const creds: TypedCred[] = []

      for (const { id, claimFormat } of Object.values(altCredentials)) {
        let credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined
        if (isW3CProofRequest(claimFormat)) {
          credential = await getW3CCredentialById(id)
        } else if (isSdJwtProofRequest(claimFormat)) {
          credential = await getSdJwtCredentialById(id)
        }

        if (credential) {
          creds.push({
            credential,
            claimFormat,
          })
        }
      }
      setCredentialsRequested(creds)
      setLoading(false)
    }
    fetchCreds()
  }, [altCredentials, getW3CCredentialById, getSdJwtCredentialById])

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
  })

  const changeCred = (selection: TypedCred) => {
    onCredChange({
      inputDescriptorID: route.params.inputDescriptorID,
      id: selection.credential.id,
      claimFormat: selection.claimFormat,
    })
    navigation.goBack()
  }

  const listHeader = () => {
    return (
      <View style={{ ...styles.pageMargin, marginVertical: 20 }}>
        {loading ? (
          <View style={styles.cardLoading}>
            <RecordLoading />
          </View>
        ) : (
          <ThemedText>{t('ProofRequest.MultipleCredentials')}</ThemedText>
        )}
      </View>
    )
  }

  return (
    <ScreenLayout screen={Screens.OpenIDProofCredentialSelect}>
      <FlatList
        data={credentialsRequested}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => {
          return (
            <View style={styles.pageMargin}>
              <TouchableOpacity
                accessibilityRole="button"
                testID={testIdWithKey(`select:${item.credential.id}`)}
                onPress={() => changeCred(item)}
                style={[
                  item.credential.id === selectedCredentialID ? SelectedCredTheme : undefined,
                  { marginBottom: 10 },
                ]}
              >
                <CredentialCard credential={item.credential}></CredentialCard>
              </TouchableOpacity>
            </View>
          )
        }}
      ></FlatList>
    </ScreenLayout>
  )
}

export default OpenIDProofCredentialSelect
