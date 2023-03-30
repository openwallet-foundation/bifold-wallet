import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, StyleSheet, StatusBar, DeviceEventEmitter } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventTypes } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { BifoldError } from '../../types/error'
import InfoBox, { InfoBoxType } from '../misc/InfoBox'

const { height } = Dimensions.get('window')

const ErrorModal: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [error, setError] = useState<BifoldError>()
  const onDismissModalTouched = () => {
    setModalVisible(false)
  }
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      minHeight: height,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  useEffect(() => {
    const errorAddedHandle = DeviceEventEmitter.addListener(EventTypes.ERROR_ADDED, (err: BifoldError) => {
      if (err.title && err.message) {
        setError(err)
        setModalVisible(true)
      }
    })

    const errorRemovedHandle = DeviceEventEmitter.addListener(EventTypes.ERROR_REMOVED, () => {
      setError(undefined)
      setModalVisible(false)
    })

    return () => {
      errorAddedHandle.remove()
      errorRemovedHandle.remove()
    }
  }, [])

  const formattedMessageForError = (err: BifoldError | null): string | undefined => {
    if (!err) {
      return undefined
    }

    return `${t('Error.ErrorCode')} ${err.code} - ${err.message}`
  }

  return (
    <Modal visible={modalVisible} transparent={true}>
      <StatusBar hidden={true} />
      <SafeAreaView style={[styles.container]}>
        <InfoBox
          notificationType={InfoBoxType.Error}
          title={error ? error.title : t('Error.Unknown')}
          description={error ? error.description : t('Error.Problem')}
          message={formattedMessageForError(error ?? null)}
          onCallToActionPressed={onDismissModalTouched}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default ErrorModal
