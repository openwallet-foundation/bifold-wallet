import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PushNotificationImg from '../assets/img/push-notifications.svg'
// import { setup } from '../utils/PushNotificationsHelper'
import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { CommonActions, ParamListBase, useNavigation } from '@react-navigation/core'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { useAgent } from '@aries-framework/react-hooks'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { useTheme } from '../contexts/theme'
import Button, { ButtonType } from '../components/buttons/Button'
import { testIdWithKey } from '../utils/testable'

const PushNotification: React.FC<StackScreenProps<ParamListBase, Screens.UsePushNotifications>> = ({ route }) => {
    const { t } = useTranslation()
    const [store, dispatch] = useStore()
    const { agent } = useAgent()
    const { TextTheme, ColorPallet } = useTheme()
    const { pushNotification } = useConfiguration()
    const [notificationState, setNotificationState] = useState<boolean>(store.preferences.usePushNotifications)
    const [notificationStatus, setNotificationStatus] = useState<'denied' | 'granted' | 'unknown'>('unknown')
    const [showInfoBox, setShowInfoBox] = useState<boolean>(false)
    const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
    if (!pushNotification) {
        throw new Error('Push notification configuration not found')
    }
    const isMenu = (route.params as any)?.isMenu
    pushNotification.status().then((status) => {
        console.warn('status', status)
        setNotificationStatus(status)
    })

    const style = StyleSheet.create({
        screenContainer: {
            flex: 1,
            padding: 30,
        },

        image: {
            height: 200,
            marginBottom: 20
        },
        heading: {
            marginBottom: 20
        },
        listItem: {
            ...TextTheme.normal,
            flex: 1,
            paddingLeft: 5
        }
    })
    const list = [
        t("PushNotifications.BulletOne"),
        t("PushNotifications.BulletTwo"),
        t("PushNotifications.BulletThree"),
        t("PushNotifications.BulletFour")
    ]
    const activatePushNotifications = async () => {
        const state = await pushNotification.setup()
        dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [state === 'granted'] })
        if (store.preferences.enableWalletNaming) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: Screens.NameWallet }],
                })
            )
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: Screens.UseBiometry }],
                })
            )
        }
    }

    const toggleSwitch = async () => {
        if (agent) {
            if (!notificationState) {
                const res = await pushNotification.setup()
                dispatch({ type: DispatchAction.PUSH_NOTIFICATION_STATUS, payload: [res] })
                if (res === 'denied') {
                    setShowInfoBox(true)
                    return
                }
            }
            dispatch({ type: DispatchAction.USE_PUSH_NOTIFICATIONS, payload: [!notificationState] })
            pushNotification.toggle(!notificationState, agent)
            setNotificationState(!notificationState)
        }
    }

    const toggleShowInfoBox = () => setShowInfoBox(!showInfoBox)

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                            title={t("PushNotifications.BlockedTitle")}
                            description={t("PushNotifications.BlockedMessage")}
                            onCallToActionPressed={toggleShowInfoBox}
                        />
                    </View>
                </Modal>
                <View style={style.screenContainer}>
                    {notificationStatus !== 'denied' && (
                        <View style={style.image}><PushNotificationImg /></View>
                    )}
                    <Text style={[TextTheme.headingThree, style.heading]}>{t("PushNotifications.EnableNotifiactions")}</Text>
                    {notificationStatus === 'denied' ? (
                        <View>
                            <Text style={TextTheme.normal}>Be notified when you receive new credential offers, proof requests, updates to your credentials, new messages and more.</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[TextTheme.normal]}>{t("PushNotifications.BeNotified")}</Text>
                            {list.map((item, index) => (
                                <View style={{ flexDirection: 'row', marginTop: 20 }} key={index}>
                                    <Text style={TextTheme.normal}>{'\u2022'}</Text>
                                    <Text style={style.listItem}>{item}</Text>
                                </View>
                            ))}
                        </>
                    )}
                    {isMenu ? (
                        <>
                            <View style={{ marginTop: 25 }}>
                                {notificationStatus === 'denied' ? (
                                    <View>
                                        <Text style={TextTheme.bold}>Notifications for BC Wallet are turned off.</Text>
                                        <Text style={TextTheme.normal}>To enable notifications:</Text>
                                    </View>
                                ) : (
                                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={TextTheme.normal}>{t("PushNotifications.ReceiveNotifications")}</Text>
                                        <Switch
                                            trackColor={{ false: ColorPallet.grayscale.lightGrey, true: ColorPallet.brand.primaryDisabled }}
                                            thumbColor={notificationState ? ColorPallet.brand.primary : ColorPallet.grayscale.mediumGrey}
                                            ios_backgroundColor={ColorPallet.grayscale.lightGrey}
                                            onValueChange={toggleSwitch}
                                            testID={testIdWithKey('PushNotificationSwitch')}
                                            value={notificationState}
                                        />
                                    </View>
                                )}
                            </View>
                            {notificationStatus === 'denied' && (
                                <View style={{ marginTop: 'auto' }}>
                                    <Button buttonType={ButtonType.Primary} title={"Open Settings"} testID={testIdWithKey("PushNotificationSettings")} onPress={() => Linking.openSettings()} ></Button>
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={{ marginTop: 'auto' }}>
                            <Button buttonType={ButtonType.Primary} title={t("Global.Continue")} testID={testIdWithKey("PushNotificationContinue")} onPress={activatePushNotifications} ></Button>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView >
    )
}

export default PushNotification
