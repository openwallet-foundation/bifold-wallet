import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import MakeConnection from '../../assets/img/make-connection.svg'
import { Context } from '../../store/Store'
import { ColorPallet, Colors, TextTheme } from '../../theme'
import Button, { ButtonType } from '../buttons/Button'

const { height } = Dimensions.get('window')
const connectionTimerDelay = 3000 // in ms
const imageDisplayOptions = {
  fill: Colors.text,
  height: 250,
  width: 250,
}

const styles = StyleSheet.create({
  container: {
    minHeight: height,
    flexDirection: 'column',
    paddingHorizontal: 25,
    backgroundColor: ColorPallet.brand.primaryBackground,
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

const ConnectionModal: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(true)
  const [shouldShowDelayMessage, setShouldShowDelayMessage] = useState<boolean>(false)
  const [state] = useContext(Context)
  let timer: NodeJS.Timeout

  const onDismissModalTouched = () => {
    setShouldShowDelayMessage(false)
    setModalVisible(false)
  }

  useEffect(() => {
    if (state.notifications.ConnectionPending) {
      setModalVisible(true)

      timer = setTimeout(() => {
        setShouldShowDelayMessage(true)
      }, connectionTimerDelay)

      return
    }

    clearTimeout(timer)
    setModalVisible(false)
  }, [state])

  return (
    <Modal visible={modalVisible} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <View style={[styles.messageContainer]}>
          <Text style={[TextTheme.headingThree, styles.messageText]}>{t('Connection.JustAMoment')}</Text>
          <MakeConnection style={[styles.image]} {...imageDisplayOptions} />
          {shouldShowDelayMessage && (
            <View style={[styles.delayMessageContainer]}>
              <Text style={[TextTheme.normal, styles.delayMessageText]}>{t('Connection.TakingTooLong')}</Text>
              <Button
                title={t('Connection.BackToHome')}
                accessibilityLabel={t('Global.Home')}
                onPress={onDismissModalTouched}
                buttonType={ButtonType.Secondary}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ConnectionModal
