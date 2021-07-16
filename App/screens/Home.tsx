import React, { useState, useEffect, useContext } from 'react'
import { FlatList } from 'react-native'
import { CredentialEventType, CredentialState } from 'aries-framework'

import AgentContext from '../contexts/AgentProvider'

import { Button, SafeAreaScrollView, AppHeaderLarge, ModularView, NotificationListItem } from 'components'

interface Props {
  navigation: any
}

const Home: React.FC<Props> = ({ navigation }) => {
  const agentContext = useContext<any>(AgentContext)

  const [notifications, setNotifications] = useState<any>([])

  const getNotifications = async () => {
    const credentials = await agentContext.agent.credentials.getAll()

    const credentialsForDisplay = []

    for (const credential of credentials) {
      if (credential.state === CredentialState.OfferReceived) {
        const credentialToDisplay = {
          ...(await agentContext.agent.credentials.getIndyCredential(credential.credentialId)),
          connectionId: credential.connectionId,
          id: credential.id,
        }
        credentialsForDisplay.push(credentialToDisplay)
      }
    }
    setNotifications(credentialsForDisplay)
  }

  const handleCredentialStateChange = async (event: any) => {
    switch (event.credentialRecord.state) {
      case CredentialState.OfferReceived:
        setNotifications([...notifications, event.credentialRecord])
      case CredentialState.Done:
        setNotifications(notifications.filter((c: any) => c.id !== event.credentialRecord.id))
    }
  }

  useEffect(() => {
    if (!agentContext.loading) {
      getNotifications()
    }
  }, [agentContext.loading])

  useEffect(() => {
    if (!agentContext.loading) {
      agentContext.agent.credentials.events.on(CredentialEventType.StateChanged, handleCredentialStateChange)
    }

    return () => agentContext.agent.credentials.events.removeAllListeners(CredentialEventType.StateChanged)
  })

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <Button title="Scanner" onPress={() => navigation.jumpTo('Scan')} />
      <ModularView
        title="Notifications"
        content={
          notifications.length ? (
            <FlatList data={notifications} renderItem={({ item }) => <NotificationListItem notification={item} />} />
          ) : (
            "Here you'll get notified about stuff"
          )
        }
      />
    </SafeAreaScrollView>
  )
}

export default Home
