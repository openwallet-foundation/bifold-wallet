import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Context } from '../../store/Store'
import { ColorPallet } from '../../theme'

import BifoldErrorX from './BifoldErrorX'

const { height } = Dimensions.get('window')
const genericErrorCode = 1024
const styles = StyleSheet.create({
  container: {
    minHeight: height,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ColorPallet.brand.primary,
  },
})

const ErrorModal: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [state] = useContext(Context)
  const onDismissModalTouched = () => {
    setModalVisible(false)
  }

  useEffect(() => {
    if (state.error && state.error.title && state.error.message && state.error.code) {
      setModalVisible(true)

      return
    }

    setModalVisible(true)
  }, [state])

  return (
    <Modal visible={modalVisible} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <BifoldErrorX
          title={state.error ? state.error.title : t('Error.Unknown')}
          message={state.error ? state.error.message : t('Error.Problem')}
          code={state.error ? state.error.code : genericErrorCode}
          onPress={onDismissModalTouched}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default ErrorModal
