import { DidExchangeState } from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Share, StyleSheet, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { hitSlop } from '../../constants'
import { useStore } from '../../contexts/store'
import { useTheme } from '../../contexts/theme'
import { useConnectionByOutOfBandId } from '../../hooks/connections'
import { QrCodeScanError } from '../../types/error'
import { ConnectStackParams, Screens, Stacks } from '../../types/navigators'
import { createConnectionInvitation } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import LoadingIndicator from '../animated/LoadingIndicator'
import IconButton, { ButtonLocation } from '../buttons/IconButton'
import DismissiblePopupModal from '../modals/DismissiblePopupModal'
import SafeAreaModal from '../modals/SafeAreaModal'
import InfoBox, { InfoBoxType } from './InfoBox'

import { TOKENS, useServices } from '../../container-api'
import { ThemedText } from '../texts/ThemedText'
import QRRenderer from './QRRenderer'
import QRScannerTorch from './QRScannerTorch'
import ScanCamera from './ScanCamera'
import ScanTab from './ScanTab'
import SVGOverlay, { MaskType } from './SVGOverlay'

type ConnectProps = StackScreenProps<ConnectStackParams>
interface Props extends ConnectProps {
  showTabs?: boolean
  defaultToConnect: boolean
  handleCodeScan: (value: string) => Promise<void>
  error?: QrCodeScanError | null
  enableCameraOnError?: boolean
}

const QRScanner: React.FC<Props> = ({
  showTabs = false,
  defaultToConnect,
  handleCodeScan,
  error,
  enableCameraOnError,
  navigation,
}) => {
  const { agent } = useAgent()
  const { width } = useWindowDimensions()
  const { t } = useTranslation()
  const { ColorPalette, TextTheme, TabTheme } = useTheme()
  const [store] = useStore()
  const [{ showScanHelp, showScanButton, showScanErrorButton = true }] = useServices([TOKENS.CONFIG])
  const [firstTabActive, setFirstTabActive] = useState(!defaultToConnect)
  const [invitation, setInvitation] = useState<string | undefined>(undefined)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)
  const record = useConnectionByOutOfBandId(recordId || '')
  const [torchActive, setTorchActive] = useState(false)
  const [showInfoBox, setShowInfoBox] = useState(false)
  const [showErrorDetailsModal, setShowErrorDetailsModal] = useState(false)

  const qrSize = width - 40

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    mainSafeArea: {
      flex: 1,
      backgroundColor: ColorPalette.brand.secondaryBackground,
    },
    bottomSafeArea: {
      flex: 0,
      backgroundColor: TabTheme.tabBarSecondaryBackgroundColor,
    },
    cameraViewContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    messageContainer: {
      marginHorizontal: 40,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      paddingTop: 30,
    },
    // no properties needed, this is just a helpful label
    bottomButtonsContainer: {},
    icon: {
      color: ColorPalette.grayscale.white,
      padding: 4,
    },
    textStyle: {
      color: 'white',
      marginHorizontal: 10,
      textAlign: 'center',
    },
    // all styles below are only used when tabs are enabled
    tabContainer: {
      flexDirection: 'row',
      ...TabTheme.tabBarStyle,
    },
    qrContainer: {
      marginTop: 10,
      flex: 1,
    },
    walletName: {
      textAlign: 'center',
    },
    secondaryText: {
      marginTop: 20,
      textAlign: 'center',
    },
  })

  const createInvitation = useCallback(async () => {
    setInvitation(undefined)
    const result = await createConnectionInvitation(agent)
    if (result) {
      setRecordId(result.record.id)
      setInvitation(result.invitationUrl)
    }
  }, [agent])

  const handleEdit = useCallback(() => {
    navigation.navigate(Screens.RenameWallet)
  }, [navigation])

  useEffect(() => {
    // Effect not required if tabs are not enabled
    if (!showTabs) return

    let headerRight = invitation ? (
      <IconButton
        buttonLocation={ButtonLocation.Right}
        accessibilityLabel={t('Global.Share')}
        testID={testIdWithKey('ShareButton')}
        onPress={() => {
          Share.share({ message: invitation ?? '' })
        }}
        icon="share-variant"
      />
    ) : undefined
    let title = t('Scan.MyQRCode')

    if (firstTabActive) {
      headerRight = (
        <IconButton
          buttonLocation={ButtonLocation.Right}
          accessibilityLabel={t('Global.Share')}
          testID={testIdWithKey('ShareButton')}
          onPress={() => {
            navigation.navigate(Screens.PasteUrl)
          }}
          icon="link"
        />
      )
      title = t('Scan.ScanQRCode')
    }

    if (!store.preferences.enableShareableLink) {
      headerRight = undefined
    }

    navigation.setOptions({ title, headerRight: () => headerRight })
  }, [showTabs, invitation, t, firstTabActive, navigation, store.preferences.enableShareableLink])

  useEffect(() => {
    // Effect not required if tabs are not enabled
    if (showTabs && !firstTabActive) {
      createInvitation()
    }
  }, [showTabs, firstTabActive, createInvitation, store.preferences.walletName])

  useEffect(() => {
    // Effect not required if tabs are not enabled
    if (showTabs && record?.state === DidExchangeState.Completed) {
      navigation.getParent()?.navigate(Stacks.ConnectionStack, {
        screen: Screens.Connection,
        params: { oobRecordId: recordId },
      })
    }
  }, [showTabs, record, navigation, recordId])

  const styleForState = ({ pressed }: { pressed: boolean }) => [{ opacity: pressed ? 0.2 : 1 }]

  const toggleShowInfoBox = () => setShowInfoBox(!showInfoBox)

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['left', 'right']} style={styles.mainSafeArea}>
        {/* Decide to show camera content or connection invitation content */}
        {!showTabs || firstTabActive ? (
          <>
            <ScanCamera
              handleCodeScan={handleCodeScan}
              error={error}
              enableCameraOnError={enableCameraOnError}
              torchActive={torchActive}
            />
            <SVGOverlay maskType={MaskType.QR_CODE} strokeColor={ColorPalette.grayscale.white} />
            <View style={styles.cameraViewContainer}>
              <View style={styles.messageContainer}>
                {error ? (
                  <>
                    <Icon style={styles.icon} name="cancel" size={40} />
                    <ThemedText testID={testIdWithKey('ErrorMessage')} style={styles.textStyle}>
                      {error.message}
                    </ThemedText>
                    {showScanErrorButton && (
                      <Pressable
                        onPress={() => setShowErrorDetailsModal(true)}
                        accessibilityLabel={t('Scan.ShowDetails')}
                        accessibilityRole={'button'}
                        testID={testIdWithKey('ShowDetails')}
                        hitSlop={hitSlop}
                      >
                        <Icon name="information-outline" size={40} style={styles.icon} />
                      </Pressable>
                    )}
                  </>
                ) : (
                  <>
                    <Icon name="qrcode-scan" size={40} style={styles.icon} />
                    <ThemedText variant="title" style={styles.textStyle}>
                      {t('Scan.WillScanAutomatically')}
                    </ThemedText>
                  </>
                )}
              </View>
              <View style={styles.bottomButtonsContainer}>
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
            </View>

            <SafeAreaModal visible={showInfoBox} animationType="fade" transparent>
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
            </SafeAreaModal>
            {showErrorDetailsModal && (
              <DismissiblePopupModal
                title={t('Scan.ErrorDetails')}
                description={error?.details || t('Scan.NoDetails')}
                onCallToActionLabel={t('Global.Dismiss')}
                onCallToActionPressed={() => setShowErrorDetailsModal(false)}
                onDismissPressed={() => setShowErrorDetailsModal(false)}
              />
            )}
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
                  <ThemedText
                    variant="headingTwo"
                    testID={testIdWithKey('WalletName')}
                    style={[styles.walletName, { paddingHorizontal: 20 }]}
                  >
                    {store.preferences.walletName}
                  </ThemedText>
                  <IconButton
                    buttonLocation={ButtonLocation.Right}
                    accessibilityLabel={t('NameWallet.EditWalletName')}
                    testID={testIdWithKey('EditWalletName')}
                    onPress={handleEdit}
                    icon={'pencil'}
                    iconTintColor={TextTheme.headingTwo.color}
                  />
                </View>
                <ThemedText style={styles.secondaryText}>{t('Connection.ShareQR')}</ThemedText>
              </View>
            </View>
          </ScrollView>
        )}
        {showTabs ? (
          <View accessible={true} style={styles.tabContainer} accessibilityRole="tablist">
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
        ) : null}
      </SafeAreaView>
      {showTabs ? <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} /> : null}
    </View>
  )
}

export default QRScanner
