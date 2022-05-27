import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BifoldError } from '../../../lib/commonjs/types/error'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import InfoBox, { InfoBoxType } from '../misc/InfoBox'

const { height } = Dimensions.get('window')

const ErrorModal: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [state] = useStore()
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
    if (state.error && state.error.title && state.error.message) {
      setModalVisible(true)

      return
    }

    setModalVisible(false)
  }, [state])

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
          title={state.error ? state.error.title : t('Error.Unknown')}
          description={state.error ? state.error.description : t('Error.Problem')}
          message={formattedMessageForError(state.error)}
          onCallToActionPressed={onDismissModalTouched}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default ErrorModal
