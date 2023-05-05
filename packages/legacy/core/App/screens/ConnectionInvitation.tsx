import type { StackScreenProps } from '@react-navigation/stack'

import { DidExchangeState } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import CheckInCircle from '../assets/img/check-in-circle.svg'
import ConnectionLoading from '../components/animated/ConnectionLoading'
import LoadingIndicator from '../components/animated/LoadingIndicator'
import Button, { ButtonType } from '../components/buttons/Button'
import QRRenderer from '../components/misc/QRRenderer'
import { useTheme } from '../contexts/theme'
import { useConnectionByOutOfBandId } from '../hooks/connections'
import { ContactStackParams, Screens } from '../types/navigators'
import { createConnectionInvitation } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ConnectionInvitationProps = StackScreenProps<ContactStackParams, Screens.ConnectionInvitation>

const windowDimensions = Dimensions.get('window')

const qrContainerSize = windowDimensions.width - 20
const qrSize = qrContainerSize - 60

const ConnectionInvitation: React.FC<ConnectionInvitationProps> = ({ navigation }) => {
  const { agent } = useAgent()
  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.grayscale.white,
    },
    headerContainer: {
      alignItems: 'center',
      padding: 16,
      marginVertical: 20,
      marginHorizontal: 30,
      textAlign: 'center',
    },
    primaryHeaderText: {
      fontWeight: 'bold',
      fontSize: 28,
      textAlign: 'center',
      color: ColorPallet.grayscale.black,
    },
    secondaryHeaderText: {
      fontWeight: 'normal',
      fontSize: 20,
      textAlign: 'center',
      marginTop: 8,
      color: ColorPallet.grayscale.black,
    },
    qrContainer: {
      width: qrContainerSize,
      height: qrContainerSize,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
      borderColor: ColorPallet.brand.primary,
      borderWidth: 10,
      borderRadius: 40,
    },
    statusText: {
      fontSize: 20,
      textAlign: 'center',
      color: ColorPallet.grayscale.black,
    },
    footerButton: {
      marginTop: 'auto',
      marginHorizontal: 20,
      marginBottom: 10,
    },
  })

  const [invitation, setInvitation] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  const createInvitation = useCallback(async () => {
    setInvitation(undefined)
    const result = await createConnectionInvitation(agent)
    if (result) {
      setRecordId(result.record.id)
      setInvitation(result.invitationUrl)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      createInvitation()
    }, [])
  )

  const record = useConnectionByOutOfBandId(recordId || '')

  const goHome = useCallback(() => navigation.getParent()?.navigate(Screens.Home), [navigation])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.primaryHeaderText}>{t('Connection.ScanQR')}</Text>
        <Text style={styles.secondaryHeaderText}>{t('Connection.ScanQRComment')}</Text>
      </View>
      {(!record || record?.state === DidExchangeState.InvitationSent) && (
        <View style={{ flexGrow: 1 }}>
          <View style={styles.qrContainer}>
            {!invitation && <LoadingIndicator />}
            {invitation && <QRRenderer value={invitation} size={qrSize} />}
          </View>
        </View>
      )}
      {(record?.state === DidExchangeState.RequestReceived || record?.state === DidExchangeState.ResponseSent) && (
        <View style={{ flexGrow: 1 }}>
          <ConnectionLoading />
          <Text style={styles.statusText}>{t('Connection.JustAMoment')}</Text>
          <View style={styles.footerButton}>
            <Button
              title={t('Loading.BackToHome')}
              accessibilityLabel={t('Loading.BackToHome')}
              testID={testIdWithKey('BackToHome')}
              buttonType={ButtonType.Secondary}
              onPress={() => goHome()}
            />
          </View>
        </View>
      )}
      {record?.state === DidExchangeState.Completed && (
        <View style={{ flexGrow: 1 }}>
          <View style={{ marginVertical: 40 }}>
            <CheckInCircle {...{ height: 80 }} />
          </View>
          <Text style={styles.statusText}>{t('Connection.ConnectionCompleted')}</Text>
          <View style={styles.footerButton}>
            <Button
              title={t('Global.Done')}
              accessibilityLabel={t('Global.Done')}
              testID={testIdWithKey('Done')}
              buttonType={ButtonType.Primary}
              onPress={() => goHome()}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default ConnectionInvitation
