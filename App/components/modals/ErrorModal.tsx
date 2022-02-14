import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Context } from '../../store/Store'
import { ColorPallet, Colors, TextTheme } from '../../theme'
import Button, { ButtonType } from '../buttons/Button'

const { height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    minHeight: height,
    flexDirection: 'column',
    paddingHorizontal: 25,
    backgroundColor: 'red',
  },
  image: {
    marginTop: 40,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 54,
  },
  messageText: {
    fontWeight: 'normal',
    textAlign: 'center',
  },
  delayMessageContainer: {
    marginTop: 30,
  },
  delayMessageText: {
    textAlign: 'center',
    marginBottom: 30,
  },
})

const ErrorModal: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [state] = useContext(Context)

  // const onDismissModalTouched = () => {
  //   setModalVisible(false)
  // }

  useEffect(() => {
    if (state.error) {
      // console.log(state.error.title)
      // console.log(state.error.message)
      // console.log(state.error.code)

      setModalVisible(true)
      return
    }

    setModalVisible(false)
  }, [state])

  return (
    <Modal visible={modalVisible} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <View style={[styles.messageContainer]}>
          <Text style={[TextTheme.headingThree, styles.messageText]}>{t('Connection.JustAMoment')}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ErrorModal
