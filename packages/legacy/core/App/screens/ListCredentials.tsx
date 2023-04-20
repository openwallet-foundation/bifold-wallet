import { CredentialState } from '@aries-framework/core'
import { useCredentialByState, useAgent } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View, DeviceEventEmitter } from 'react-native'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { CredentialStackParams, Screens } from '../types/navigators'

const ListCredentials: React.FC = () => {
  const { t } = useTranslation()
  const { credentialListOptions: CredentialListOptions, credentialEmptyList: CredentialEmptyList } = useConfiguration()
  const credentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ]
  const { agent } = useAgent()
  const navigation = useNavigation<StackNavigationProp<CredentialStackParams>>()
  const { ColorPallet } = useTheme()
  const [credentialToRemove, setCredentialToRemove] = useState<string | undefined>(undefined)

  useEffect(() => {
    const handle = DeviceEventEmitter.addListener('FooDelete', (value?: string) => {
      setCredentialToRemove(value)
    })

    return () => {
      handle.remove()
    }
  }, [])

  useFocusEffect(() => {
    if (credentialToRemove && agent) {
      agent.credentials
        .deleteById(credentialToRemove)
        .then(() => {
          Toast.show({
            type: ToastType.Success,
            text1: t('CredentialDetails.CredentialRemoved'),
          })
        })
        .catch((err: unknown) => {
          const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error).message, 1025)
          DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        })
    }
  })

  return (
    <View>
      <FlatList
        style={{ backgroundColor: ColorPallet.brand.primaryBackground }}
        data={credentials.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())}
        keyExtractor={(credential) => credential.id}
        renderItem={({ item: credential, index }) => {
          return (
            <View
              style={{
                marginHorizontal: 15,
                marginTop: 15,
                marginBottom: index === credentials.length - 1 ? 45 : 0,
              }}
            >
              <CredentialCard
                credential={credential}
                onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: credential.id })}
              />
            </View>
          )
        }}
        ListEmptyComponent={() => <CredentialEmptyList message={t('Credentials.EmptyList')} />}
      />
      <CredentialListOptions />
    </View>
  )
}

export default ListCredentials
