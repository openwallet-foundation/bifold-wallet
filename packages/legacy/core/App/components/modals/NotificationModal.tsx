import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { HomeStackParams, Screens } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

interface NotificationModalProps {
  title: string
  doneTitle?: string
  doneType?: ButtonType
  doneAccessibilityLabel?: string
  onDone?: () => void
  onHome?: () => void
  doneVisible?: boolean
  homeVisible?: boolean
  testID?: string
  visible?: boolean
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  title,
  doneTitle,
  doneType = ButtonType.Primary,
  doneAccessibilityLabel,
  onDone,
  onHome,
  doneVisible = true,
  homeVisible = true,
  testID,
  visible,
  children,
}) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [modalVisible, setModalVisible] = useState<boolean>(true)
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    childContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
    },
    buttonContainer: {
      marginBottom: 35,
      marginHorizontal: 20,
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
    navigation.navigate(Screens.Home)
  }

  return (
    <Modal testID={testID} visible={modalVisible} transparent={true}>
      <SafeAreaView style={styles.container}>
        {homeVisible ? (
          <View style={styles.iconContainer}>
            <TouchableOpacity
              accessible={true}
              accessibilityLabel={t('Global.Home')}
              testID={testIdWithKey('Home')}
              style={styles.iconButton}
              onPress={onHome || closeHome}
            >
              <Icon name="home" size={24} color={ColorPallet.notification.infoText}></Icon>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.childContainer}>
          <Text style={[TextTheme.headingThree, { fontWeight: 'normal', textAlign: 'center' }]}>{title}</Text>
          {children}
        </View>
        {doneVisible ? (
          <View style={styles.buttonContainer}>
            <Button
              title={doneTitle || t('Global.Done')}
              accessibilityLabel={doneAccessibilityLabel || t('Global.Done')}
              testID={testIdWithKey('Done')}
              buttonType={doneType}
              onPress={onDone || close}
            ></Button>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  )
}

export default NotificationModal
