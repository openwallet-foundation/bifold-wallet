import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, Text, View, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../../contexts/theme'
import { Screens, HomeStackParams } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

import DismissiblePopupModal from './DismissiblePopupModal'

interface CameraDisclosureModalProps {
  requestCameraUse: () => Promise<boolean>
}

const CameraDisclosureModal: React.FC<CameraDisclosureModalProps> = ({ requestCameraUse }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<HomeStackParams>>()
  const [modalVisible, setModalVisible] = useState(true)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [requestInProgress, setRequestInProgress] = useState(false)
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    messageText: {
      marginTop: 30,
    },
    controlsContainer: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      marginTop: 'auto',
      margin: 20,
    },
    buttonContainer: {
      paddingTop: 10,
    },
  })

  const onAllowTouched = async () => {
    setRequestInProgress(true)
    const granted = await requestCameraUse()
    if (!granted) {
      setShowSettingsPopup(true)
    }
    setRequestInProgress(false)
  }

  const onOpenSettingsTouched = async () => {
    setModalVisible(false)
    await Linking.openSettings()
    navigation.navigate(Screens.Home)
  }

  const onNotNowTouched = () => {
    setModalVisible(false)
    navigation.navigate(Screens.Home)
  }

  const onOpenSettingsDismissed = () => {
    setShowSettingsPopup(false)
  }

  return (
    <Modal visible={modalVisible} animationType={'slide'} transparent>
      {showSettingsPopup && (
        <DismissiblePopupModal
          title={t('CameraDisclosure.AllowCameraUse')}
          description={t('CameraDisclosure.ToContinueUsing')}
          onCallToActionLabel={t('CameraDisclosure.OpenSettings')}
          onCallToActionPressed={onOpenSettingsTouched}
          onDismissPressed={onOpenSettingsDismissed}
        />
      )}
      <SafeAreaView>
        <ScrollView style={[styles.container]}>
          <Text style={[TextTheme.headingOne]} testID={testIdWithKey('AllowCameraUse')}>
            {t('CameraDisclosure.AllowCameraUse')}
          </Text>
          <Text style={[TextTheme.normal, styles.messageText]}>{t('CameraDisclosure.CameraDisclosure')}</Text>
          <Text style={[TextTheme.normal, styles.messageText]}>{t('CameraDisclosure.ToContinueUsing')}</Text>
        </ScrollView>
        <View style={[styles.controlsContainer]}>
          <View style={styles.buttonContainer}>
            <Button
              title={t('CameraDisclosure.Allow')}
              accessibilityLabel={t('CameraDisclosure.Allow')}
              testID={testIdWithKey('Allow')}
              onPress={onAllowTouched}
              buttonType={ButtonType.Primary}
              disabled={requestInProgress}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={t('Global.NotNow')}
              accessibilityLabel={t('Global.NotNow')}
              testID={testIdWithKey('NotNow')}
              onPress={onNotNowTouched}
              buttonType={ButtonType.Secondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default CameraDisclosureModal
