import { DidExchangeState } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useConfiguration } from '../../contexts/configuration'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { useConnectionByOutOfBandId } from '../../hooks/connections'
import { QrCodeScanError } from '../../types/error'
import { ConnectStackParams, Screens, Stacks } from '../../types/navigators'
import { createConnectionInvitation } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import LoadingIndicator from '../animated/LoadingIndicator'
import HeaderButton, { ButtonLocation } from '../buttons/HeaderButton'
import InfoBox, { InfoBoxType } from '../misc/InfoBox'
import DismissiblePopupModal from '../modals/DismissiblePopupModal'

import QRRenderer from './QRRenderer'
import QRScannerTorch from './QRScannerTorch'
import ScanCamera from './ScanCamera'
import ScanTab from './ScanTab'

type ConnectProps = StackScreenProps<ConnectStackParams>

interface Props extends ConnectProps {
  defaultToConnect: boolean
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
}

const NewQRView: React.FC<Props> = ({ defaultToConnect, handleCodeScan, error, enableCameraOnError, navigation }) => {
  const { width } = useWindowDimensions()
  const qrSize = width - 40
  const [store] = useStore()
  const { showScanHelp, showScanButton } = useConfiguration()
  const [showInfoBox, setShowInfoBox] = useState(false)
  const [torchActive, setTorchActive] = useState(false)
  const [showErrorDetailsModal, setShowErrorDetailsModal] = useState(false)
  const [firstTabActive, setFirstTabActive] = useState(!defaultToConnect)
  const [invitation, setInvitation] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, TabTheme } = useTheme()
  const { agent } = useAgent()

  const styles = StyleSheet.create({
    mainSafeArea: {
      flex: 1,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    bottomSafeArea: {
      flex: 0,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    camera: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraViewContainer: {
      alignItems: 'center',
      flex: 1,
      width: '100%',
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
    tabContainer: {
      flexDirection: 'row',
      ...TabTheme.tabBarStyle,
    },
    qrContainer: {
      marginTop: 10,
      flex: 1,
    },
    walletName: {
      ...TextTheme.headingTwo,
      textAlign: 'center',
    },
    secondaryText: {
      ...TextTheme.normal,
      marginTop: 20,
      textAlign: 'center',
    },
    textStyle: {
      ...TextTheme.title,
      color: 'white',
      marginHorizontal: 10,
      textAlign: 'center',
    },
    editButton: {
      ...TextTheme.headingTwo,
      marginBottom: 20,
      marginLeft: 10,
      color: ColorPallet.brand.primary,
    },
  })

  const createInvitation = useCallback(async () => {
    setInvitation(undefined)
    const result = await createConnectionInvitation(agent)
    if (result) {
      setRecordId(result.record.id)
      setInvitation(result.invitationUrl)
    }
  }, [])

  const handleEdit = () => {
    navigation.navigate(Screens.NameWallet)
  }
  const scanPasteUrl = () => (
    <HeaderButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Global.Share')}
      testID={testIdWithKey('ShareButton')}
      onPress={() => {
        navigation.navigate(Screens.PasteUrl)
      }}
      icon="link"
    />
  )

  const scanShareUrl = () => (
    <HeaderButton
      buttonLocation={ButtonLocation.Right}
      accessibilityLabel={t('Global.Share')}
      testID={testIdWithKey('ShareButton')}
      onPress={() => {
        Share.share({ message: invitation ?? '' })
      }}
      icon="share-variant"
    />
  )

  useEffect(() => {
    let headerRight = invitation ? scanShareUrl : undefined
    let title = t('Scan.MyQRCode')
    if (firstTabActive) {
      headerRight = scanPasteUrl
      title = t('Scan.ScanQRCode')
    }
    if (!store.preferences.enableShareableLink) {
      headerRight = undefined
    }
    navigation.setOptions({ title, headerRight })
  }, [firstTabActive, invitation, store.preferences.enableShareableLink])

  useEffect(() => {
    if (!firstTabActive) {
      createInvitation()
    }
  }, [firstTabActive, store.preferences.walletName])

  const record = useConnectionByOutOfBandId(recordId || '')

  useEffect(() => {
    if (record?.state === DidExchangeState.Completed) {
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { connectionId: record.id },
      })
    }
  }, [record])

  const styleForState = ({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.2 : 1 }]

  const toggleShowInfoBox = () => setShowInfoBox(!showInfoBox)

  return (
    <>
      <SafeAreaView edges={['left', 'right']} style={styles.mainSafeArea}>
        {firstTabActive ? (
          <>
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
            {showErrorDetailsModal && (
              <DismissiblePopupModal
                title={t('Scan.ErrorDetails')}
                description={error?.details || t('Scan.NoDetails')}
                onCallToActionLabel={t('Global.Dismiss')}
                onCallToActionPressed={() => setShowErrorDetailsModal(false)}
                onDismissPressed={() => setShowErrorDetailsModal(false)}
              />
            )}
            <ScanCamera
              handleCodeScan={handleCodeScan}
              enableCameraOnError={enableCameraOnError}
              error={error}
              torchActive={torchActive}
            />
            <View style={styles.cameraViewContainer}>
              <View style={styles.messageContainer}>
                {error ? (
                  <>
                    <Icon style={styles.icon} name="cancel" size={40} />
                    <Text testID={testIdWithKey('ErrorMessage')} style={styles.textStyle}>
                      {error.message}
                    </Text>
                    <Pressable
                      onPress={() => setShowErrorDetailsModal(true)}
                      accessibilityLabel={t('Scan.ShowDetails')}
                      accessibilityRole={'button'}
                      testID={testIdWithKey('ShowDetails')}
                      hitSlop={hitSlop}
                    >
                      <Icon name="information-outline" size={40} style={styles.icon} />
                    </Pressable>
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

              <View style={{ width: '90%', marginHorizontal: 24, height: 24, marginBottom: 60, flexDirection: 'row' }}>
                {showScanHelp && (
                  <Pressable
                    accessibilityLabel={t('Scan.ScanHelp')}
                    accessibilityRole={'button'}
                    testID={testIdWithKey('ScanHelp')}
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
          </>
        ) : (
          <ScrollView>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.qrContainer}>
                {!invitation && <LoadingIndicator />}
                {invitation && <QRRenderer value={invitation} size={qrSize} />}
              </View>
              <View style={{ paddingHorizontal: 20, flex: 1 }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text testID={testIdWithKey('WalletName')} style={[styles.walletName, { paddingHorizontal: 20 }]}>
                    {store.preferences.walletName}
                  </Text>
                  <HeaderButton
                    buttonLocation={ButtonLocation.Right}
                    accessibilityLabel={t('NameWallet.EditWalletName')}
                    testID={testIdWithKey('EditWalletName')}
                    onPress={handleEdit}
                    icon={'pencil'}
                    iconTintColor={styles.walletName.color}
                  />
                </View>
                <Text style={styles.secondaryText}>{t('Connection.ShareQR')}</Text>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.tabContainer}>
          <ScanTab
            title={t('Scan.ScanQRCode')}
            iconName={'crop-free'}
            onPress={() => setFirstTabActive(true)}
            active={firstTabActive}
          />
          <ScanTab
            title={t('Scan.MyQRCode')}
            iconName={'qr-code'}
            onPress={() => setFirstTabActive(false)}
            active={!firstTabActive}
          />
        </View>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
    </>
  )
}

export default NewQRView
