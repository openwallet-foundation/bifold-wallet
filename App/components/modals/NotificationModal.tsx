import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { Colors } from '../../theme'

import { Button, Title } from 'components'
import { HomeStackParams } from 'types/navigators'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  childContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: 20,
    paddingVertical: 28,
  },
})

interface Props {
  title: string
  doneTitle?: string
  onDone?: () => void
  onHome?: () => void
  visible?: boolean
}

const NotificationModal: React.FC<Props> = ({ title, doneTitle, onDone, onHome, visible, children }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [modalVisible, setModalVisible] = useState<boolean>(true)

  useEffect(() => {
    if (visible !== undefined) {
      setModalVisible(visible)
    }
  }, [visible])

  const close = () => {
    setModalVisible(false)
  }

  const closeHome = () => {
    close()
    navigation.navigate('Home')
  }

  return (
    <Modal visible={modalVisible} transparent={true}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={onHome || closeHome}>
            <Icon name="home" size={24} color={Colors.text}></Icon>
          </TouchableOpacity>
        </View>
        <View style={styles.childContainer}>
          <Title>{title}</Title>
          {children}
        </View>
        <View style={styles.buttonContainer}>
          <Button title={doneTitle || t('Global.Done')} onPress={onDone || close}></Button>
        </View>
      </View>
    </Modal>
  )
}

export default NotificationModal
