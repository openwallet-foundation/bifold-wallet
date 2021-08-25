import React, { useState, useEffect, useContext } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { CredentialEventType, CredentialState } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'

import { CredentialListItem, Text } from 'components'

import { backgroundColor, textColor } from '../globalStyles'

interface Props {
  navigation: any
}

const ListCredentials: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [credentials, setCredentials] = useState<any>()
  const [refreshing, setRefreshing] = useState(false)

  const getCredentials = async () => {
    const credentials = await agentContext.agent.credentials.getAll()

    const credentialsForDisplay = []

    for (const credential of credentials) {
      if (credential.state === CredentialState.Done) {
        const credentialToDisplay = {
          ...credential,
          ...(await agentContext.agent.credentials.getIndyCredential(credential.credentialId)),
        }
        credentialsForDisplay.push(credentialToDisplay)
      }
    }
    setCredentials(credentialsForDisplay)
  }

  useEffect(() => {
    if (!agentContext.loading) {
      getCredentials()
    }
  }, [agentContext.loading])

  const handleCredentialStateChange = async (event: any) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)
    getCredentials()
  }

  useEffect(() => {
    if (!agentContext.loading) {
      agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    }
    return () =>
      agentContext.agent.credentials.events.removeListener(
        CredentialEventType.StateChanged,
        handleCredentialStateChange
      )
  })

  return (
    <FlatList
      data={credentials}
      renderItem={({ item }) => <CredentialListItem credential={item} />}
      style={{ backgroundColor }}
      keyExtractor={(item: any) => item.credentialId}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>None yet!</Text>}
      refreshControl={<RefreshControl tintColor={textColor} onRefresh={getCredentials} refreshing={refreshing} />}
    />
  )
}

export default ListCredentials
