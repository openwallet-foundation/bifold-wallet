import { useNavigation } from '@react-navigation/core'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Modal, Vibration, Pressable, StyleSheet, Text } from 'react-native'
import { BarCodeReadEvent, RNCamera } from 'react-native-camera'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useConfiguration } from '../../contexts/configuration'
import { useTheme } from '../../contexts/theme'
import { QrCodeScanError } from '../../types/error'
import { Screens } from '../../types/navigators'
import { testIdWithKey } from '../../utils/testable'
import InfoBox, { InfoBoxType } from '../misc/InfoBox'

import QRScannerTorch from './QRScannerTorch'

interface Props {
  handleCodeScan: (event: BarCodeReadEvent) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
}

const QRScanner: React.FC<Props> = ({ handleCodeScan, error, enableCameraOnError }) => {
  const navigation = useNavigation()
  const { showScanHelp, showScanButton } = useConfiguration()
  const [cameraActive, setCameraActive] = useState(true)
  const [torchActive, setTorchActive] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(false)
  const { t } = useTranslation()
  const invalidQrCodes = new Set<string>()
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    viewFinder: {
      width: 250,
      height: 250,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: ColorPallet.grayscale.white,
    },
    viewFinderContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageContainer: {
      marginHorizontal: 40,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      paddingTop: 30,
    },
    icon: {
      color: ColorPallet.grayscale.white,
      padding: 4,
    },
    textStyle: {
      ...TextTheme.title,
      color: 'white',
      marginHorizontal: 10,
      textAlign: 'center',
    },
  })

  const styleForState = ({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.2 : 1 }]

  const toggleShowInfoBox = () => setShowInfoBox(!showInfoBox)

  return (
    <View style={styles.container}>
      <Modal visible={showInfoBox} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
        >
          <InfoBox
            notificationType={InfoBoxType.Info}
            title={t('Scan.BadQRCode')}
            description={t('Scan.BadQRCodeDescription')}
            onCallToActionPressed={toggleShowInfoBox}
          />
        </View>
      </Modal>
      <RNCamera
        style={styles.container}
        type={RNCamera.Constants.Type.back}
        flashMode={torchActive ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: t('QRScanner.PermissionToUseCamera'),
          message: t('QRScanner.WeNeedYourPermissionToUseYourCamera'),
          buttonPositive: t('QRScanner.Ok'),
          buttonNegative: t('Global.Cancel'),
        }}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        onBarCodeRead={(event: BarCodeReadEvent) => {
          if (invalidQrCodes.has(event.data)) {
            return
          }

          if (error?.data === event?.data) {
            invalidQrCodes.add(error.data)
            if (enableCameraOnError) {
              return setCameraActive(true)
            }
          }

          if (cameraActive) {
            Vibration.vibrate()
            handleCodeScan(event)

            return setCameraActive(false)
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.messageContainer}>
            {error ? (
              <>
                <Icon style={styles.icon} name="cancel" size={40} />
                <Text testID={testIdWithKey('ErrorMessage')} style={styles.textStyle}>
                  {error.message}
                </Text>
              </>
            ) : (
              <>
                <Icon name="qrcode-scan" size={40} style={styles.icon} />
                <Text style={styles.textStyle}>{t('Scan.WillScanAutomatically')}</Text>
              </>
            )}
          </View>
          <View style={styles.viewFinderContainer}>
            <View style={styles.viewFinder} />
          </View>
          {showScanButton && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Pressable
                accessibilityLabel={t('Scan.ScanNow')}
                accessibilityRole={'button'}
                testID={testIdWithKey('ScanNow')}
                onPress={toggleShowInfoBox}
                style={styleForState}
                hitSlop={hitSlop}
              >
                <Icon name="circle-outline" size={60} style={{ color: 'white', marginBottom: -15 }} />
              </Pressable>
            </View>
          )}

          <View style={{ marginHorizontal: 24, height: 24, marginBottom: 60, flexDirection: 'row' }}>
            {showScanHelp && (
              <Pressable
                accessibilityLabel={t('Scan.ScanHelp')}
                accessibilityRole={'button'}
                testID={testIdWithKey('ScanHelp')}
                // @ts-ignore
                onPress={() => navigation.navigate(Screens.ScanHelp)}
                style={styleForState}
                hitSlop={hitSlop}
              >
                <Icon name="help-circle" size={24} style={{ color: 'white' }} />
              </Pressable>
            )}

            <View style={{ width: 10, marginLeft: 'auto' }} />
            <QRScannerTorch active={torchActive} onPress={() => setTorchActive(!torchActive)} />
          </View>
        </View>
      </RNCamera>
    </View>
  )
}

export default QRScanner
