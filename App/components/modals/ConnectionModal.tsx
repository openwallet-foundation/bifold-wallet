import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import MakeConnection from '../../assets/img/make-connection.svg'
import { Context } from '../../store/Store'
import { ColorPallet, Colors, TextTheme } from '../../theme'

const { height } = Dimensions.get('window')
const iconSize = 36

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
  iconContainer: {
    alignItems: 'flex-end',
    minHeight: iconSize,
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 54,
  },
  image: {
    marginTop: 40,
  },
  messageText: {
    fontWeight: 'normal',
    textAlign: 'center',
  },
  delayMessageText: {
    textAlign: 'center',
    marginTop: 30,
  },
})

const ConnectionModal: React.FC = () => {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState<boolean>(true)
  const [shouldUpdateMessage, setShouldUpdateMessage] = useState<boolean>(false)
  const [state] = useContext(Context)
  let timer: NodeJS.Timeout

  const onDismissModalTouched = () => {
    setShouldUpdateMessage(false)
    setModalVisible(false)
  }

  useEffect(() => {
    if (state.notifications.ConnectionPending) {
      setModalVisible(true)

      timer = setTimeout(() => {
        setShouldUpdateMessage(true)
      }, 3000)

      return
    }

    clearTimeout(timer)
    setModalVisible(false)
  }, [state])

  return (
    <Modal visible={modalVisible} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <TouchableOpacity
          accessibilityLabel={'Home'}
          accessible={true}
          style={[styles.iconContainer]}
          onPress={onDismissModalTouched}
        >
          {shouldUpdateMessage && <Icon name={'home'} size={iconSize} color={Colors.text} />}
        </TouchableOpacity>
        <View style={[styles.messageContainer]}>
          <Text style={[TextTheme.headingThree, styles.messageText]}>{t('Connection.JustAMoment')}</Text>
          <MakeConnection style={[styles.image]} {...imageDisplayOptions} />
          {shouldUpdateMessage && (
            <Text style={[TextTheme.normal, styles.delayMessageText]}>{t('Connection.TakingTooLong')}</Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ConnectionModal
