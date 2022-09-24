import { ConnectionInvitationMessage, ConnectionService, ConnectionState } from '@aries-framework/core'
import { useAgent, useConnectionById } from '@aries-framework/react-hooks'
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, useWindowDimensions, View } from 'react-native'

import { uiConfig } from '../../configs/uiConfig'
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

  const [connectionId, setConnectionId] = useState('')
  const [invitation, setInvitation] = useState<ConnectionInvitationMessage>()
  const [mediationEndpoint, setMediationEndpoint] = useState<string | undefined>()
  const [value, setValue] = useState('placeholder')

  const connection = useConnectionById(connectionId)

  const styles = StyleSheet.create({
    outerContainer: {
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    innerContainer: {},
  })

  const generateInvitation = async () => {
    const { invitation } = await agent?.oob.createLegacyInvitation({
      autoAcceptConnection: true,
      label: state.user.firstName + ' ' + state.user.lastName,
    })
    const mediationRecord = await agent?.mediationRecipient.findDefaultMediator()
    setInvitation(invitation)
    if (invitation?.connectionRecord) {
      setConnectionId(invitation.connectionRecord.id)
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
    if (connection?.state === ConnectionState.Complete) {
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
  }, [connection])

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
