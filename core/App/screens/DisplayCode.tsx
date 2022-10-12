import { ConnectionInvitationMessage, ConnectionRecord, ConnectionStateChangedEvent, ConnectionEventTypes, DidExchangeState, OutOfBandRecord } from '@aries-framework/core'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { EventSubscriptionVendor, StyleSheet, useWindowDimensions, View } from 'react-native'

import { uiConfig } from '../../configs/uiConfig'
import { STORAGE_FIRSTLOGIN } from '../../lib/typescript/lib/module/constants'
import Button, { ButtonType } from '../components/buttons/Button'
import QRContainer from '../components/misc/QRContainer'
import { useStore } from '../contexts/store'
import { Screens, Stacks } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const DisplayCode = ({ navigation }: any) => {
  const { agent } = useAgent()
  const [state, dispatch] = useStore()
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const [oobRecord, setOobRecord] = useState<OutOfBandRecord | undefined>()
  const [connectionId, setConnectionId] = useState<string | undefined>()
  const [invitation, setInvitation] = useState<ConnectionInvitationMessage>()
  const [mediationEndpoint, setMediationEndpoint] = useState<string | undefined>()
  const [value, setValue] = useState('placeholder')

  // const connection = useConnectionById(connectionId)
  let connection : ConnectionRecord | undefined
  if (connectionId) {connection = useConnectionById(connectionId)}

  const styles = StyleSheet.create({
    outerContainer: {
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    innerContainer: {},
  })

  const handleEvent = (event: ConnectionStateChangedEvent) => {
    if (event.payload.connectionRecord.outOfBandId === oobRecord?.id) {
      console.log(`Connection state changed for connection with out of band id ${oobRecord?.id}`)
      console.log(`Connection Record ID: ${event.payload.connectionRecord.id}`)
      setConnectionId(event.payload.connectionRecord.id)
    }
  }

  useEffect(() => {
    agent?.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, (event) => handleEvent(event))

    return () => {
      agent?.events.off(ConnectionEventTypes.ConnectionStateChanged, () => {})
    }
  }, [])

  // agent?.events.on<ConnectionStateChangedEvent>(ConnectionEventTypes.ConnectionStateChanged, (event) => {
  //   if (event.payload.connectionRecord.outOfBandId === oobRecord?.id) {
  //     console.log(`Connection state changed for connection with out of band id ${oobRecord?.id}`)
  //     console.log(`Connection Record ID: ${event.payload.connectionRecord.id}`)
  //     setConnectionId(event.payload.connectionRecord.id)
  //   }
  // })

  const generateInvitation = async () => {
    const { outOfBandRecord, invitation } = await agent!.oob.createLegacyInvitation({
      autoAcceptConnection: true,
      label: state.user.firstName + ' ' + state.user.lastName,
    })
    const mediationRecord = await agent?.mediationRecipient.findDefaultMediator()
    setInvitation(invitation)
    if (invitation) {
      console.log('oob record : ',JSON.stringify(outOfBandRecord))
      console.log('invitation : ', JSON.stringify(invitation))
      setOobRecord(outOfBandRecord)
    }
    if (mediationRecord?.endpoint) {
      setMediationEndpoint(mediationRecord.endpoint)
    }
  }

  useEffect(() => {
    if (invitation && mediationEndpoint) {
      // TODO: use mediator id in connection record instead of default mediator
      const url = invitation.toUrl({
        domain: mediationEndpoint,
      })
      setValue(url)
    }
  }, [invitation, mediationEndpoint])

  useEffect(() => {
    generateInvitation()
  }, [])

  useEffect(() => {
    console.log('connection id : ', connectionId)
    console.log('connection state : ', connection)
    if (connection?.state === DidExchangeState.Completed) {
      console.log('SUCCESS!!!')
      if (uiConfig.navigateOnConnection) {
        navigation.goBack()
        navigation.navigate(Stacks.ContactStack, {
          screen: Screens.Chat,
          params: { connectionId: connection.id },
        })
      } else {
        navigation.goBack()
        navigation.navigate(Stacks.ConnectionStack, { screen: Screens.Connection, params: { connectionId } })
      }
    }
  }, [connection, connectionId])

  return (
    <View style={styles.outerContainer}>
      <QRContainer value={value} containerStyle={styles.innerContainer} size={width - 100} />
      <Button
        title={t('Global.Done')}
        accessibilityLabel={t('Global.Done')}
        testID={testIdWithKey('Done')}
        onPress={() => {
          navigation.goBack()
        }}
        buttonType={ButtonType.Primary}
      />
    </View>
  )
}

export default DisplayCode
