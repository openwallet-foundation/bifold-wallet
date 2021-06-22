import React, { useState, useEffect, useContext } from 'react'
import { FlatList } from 'react-native'
import { CredentialEventType } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'

import { CredentialListItem, Text } from 'components'
import { backgroundColor } from '../globalStyles'

interface Props {
  navigation: any
}

const ListCredentials: React.FC<Props> = ({ navigation }) => {
  //Reference to the agent context
  const agentContext = useContext<any>(AgentContext)

  //Credential List State
  const [credentials, setCredentials] = useState<any>()

  //Function to get all credentials and set the state
  const getCredentials = async () => {
    const credentials = await agentContext.agent.credentials.getAll()
    console.log(credentials)

    const credentialsForDisplay = []

    for (const credential of credentials) {
      if (credential.state === 'done') {
        const credentialToDisplay = {
          ...(await agentContext.agent.credentials.getIndyCredential(credential.credentialId)),
          connectionId: credential.connectionId,
          id: credential.id,
        }
        credentialsForDisplay.push(credentialToDisplay)
      }
    }
    console.log('credentialsForDisplay', credentialsForDisplay)
    //TODO: Filter credentials for display
    setCredentials(credentialsForDisplay)
  }

  //On Component Load Fetch all Connections
  useEffect(() => {
    if (!agentContext.loading) {
      getCredentials()
    }
  }, [agentContext.loading])

  //Credential Event Callback
  const handleCredentialStateChange = async (event: any) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)

    getCredentials()
  }

  //Register Event Listener
  useEffect(() => {
    if (!agentContext.loading) {
      agentContext.agent.credentials.events.removeAllListeners(CredentialEventType.StateChanged)
      agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    }
  }, [agentContext.loading])

  return (
    <FlatList
      data={credentials}
      renderItem={({ item }) => <CredentialListItem credential={item} />}
      style={{ backgroundColor }}
      keyExtractor={(item: any) => item.credential_id}
      ListEmptyComponent={() => <Text style={{ textAlign: 'center', margin: 100 }}>No Credentials yet!</Text>}
    />
  )
}

export default ListCredentials
