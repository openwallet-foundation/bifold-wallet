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
        const previewAttributes = credential.offerMessage.credentialPreview.attributes
        console.log('PREVIEW ATTRIBUTES', previewAttributes)
        const attributes: any = {}
        for (const index in previewAttributes) {
          attributes[previewAttributes[index].name] = previewAttributes[index].value
        }

        const credentialToDisplay = {
          attributes,
          connectionId: credential.credentialRecord.connectionId,
          id: credential.credentialRecord.id,
        }

        credentialsForDisplay.push(credentialToDisplay)
      }
    }
    setNotifications(credentialsForDisplay)
  }

  const handleCredentialStateChange = async (event: any) => {
    console.info(`Credentials State Change, new state: "${event.credentialRecord.state}"`, event)

    switch (event.credentialRecord.state) {
      case CredentialState.OfferReceived:
        const previewAttributes = event.credentialRecord.offerMessage.credentialPreview.attributes
        console.log('PREVIEW ATTRIBUTES', previewAttributes)
        const attributes: any = {}
        for (const index in previewAttributes) {
          attributes[previewAttributes[index].name] = previewAttributes[index].value
        }

        const credentialToDisplay = {
          attributes,
          connectionId: event.credentialRecord.connectionId,
          id: event.credentialRecord.id,
        }

        setNotifications([...notifications, credentialToDisplay])
        console.log('CRED_TO_DISPLAY', credentialToDisplay)
        break
      case CredentialState.CredentialReceived:
        await agentContext.agent.credentials.acceptCredential(event.credentialRecord.id)
        break
      case CredentialState.Done:
        setNotifications(notifications.filter((c: any) => c.id !== event.credentialRecord.id))
        break
      default:
        return
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

    return () =>
      agentContext.agent.credentials.events.removeListener(
        CredentialEventType.StateChanged,
        handleCredentialStateChange
      )
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
