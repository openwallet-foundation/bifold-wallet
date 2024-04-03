import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import BottomPopup from '../toast/popup';
import { getItem } from '../../utils/storage';
import { sendConnectionInvite } from '../../utils/connectionRequestHelpers';
import { useAgent } from '@aries-framework/react-hooks';
import { connectFromInvitation, createConnectionInvitation, getJson, getUrl, receiveMessageFromUrlRedirect } from '../../utils/helpers';
import { Screens, Stacks } from '../../types/navigators';
import { BifoldError } from '../../types/error';
import { useTranslation } from 'react-i18next';
import { set } from 'mockdate';
import { getOwner, getProxies } from '../../utils/smartProxyHelpers';
import { useStore } from '../../contexts/store';
import { TextInput } from 'react-native';
// import { Picker } from '@react-native-picker/picker';


interface SendInvitesModalProps {
    showSendInviteScreen: boolean;
    setShowSendInviteScreen: (show: boolean) => void;
}

const SendInviteModal: React.FC<SendInvitesModalProps> = ({
    showSendInviteScreen,
    setShowSendInviteScreen,
}) => {

    const { agent } = useAgent()
    const [store] = useStore()
    const [popupVisible, setPopupVisible] = React.useState<boolean>(false);
    const [popupMessage, setPopupMessage] = React.useState<string>('');
    const [proxyIdentifier, setProxyIdentifier] = React.useState('');
    const [sendingInvite, setSendingInvite] = React.useState<boolean>(false);
    const [proxyList, setProxyList] = React.useState<any[]>([]);
    const [proxyKey, setProxyKey] = React.useState<string>('');


    useEffect(() => {
        try {
            if (showSendInviteScreen) {
                console.log("Create invite screen launched")
                handleGetProxies()
            }

        } catch (err: any) {
            console.error(err)
        }
    }, [showSendInviteScreen])

    const handleGetProxies = async () => {
        const dids = await agent?.dids.getCreatedDids()
        if (dids?.at(0)?.did !== undefined) {
            const did = dids.at(0)?.did ?? '';
            try {
                const proxies = await getProxies(did);
                setProxyList(proxies);
                console.log("Fetchecd PROXIES:")
                console.log(proxies)
                if (proxies.length > 0) {
                    setProxyKey(proxies[0].proxyKey)
                }
            } catch (err: any) {
                console.error(err)
                setPopupMessage("Error fetching proxies")
                setPopupVisible(true);
            }
        } else {
            setPopupMessage("DID not found")
            setPopupVisible(true);
        }
    }

    const handleSendConnectionInvite = async () => {
        try {
            setSendingInvite(true)
            const result = await createConnectionInvitation(agent)
            if (result) {

                const response = await sendConnectionInvite(store.preferences.walletName, proxyIdentifier, result.invitationUrl)

                if (typeof response === 'string') {
                    setPopupMessage("Error sending invite")
                    setPopupVisible(true);
                    setSendingInvite(false)
                    return
                }
                console.log(response)
                setPopupMessage("Invite Sent")
                setPopupVisible(true);
            }
            setSendingInvite(false)
        } catch (err: any) {
            console.error(err)
            setPopupMessage("Error sending invite")
            setPopupVisible(true);
            setSendingInvite(false)
        }
    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showSendInviteScreen}
            onRequestClose={() => {
                setShowSendInviteScreen(false);
                setPopupVisible(false);
            }}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                {/* Back Button Container */}
                <View style={styles.backButtonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => { setShowSendInviteScreen(false); setPopupVisible(false); }} // Assuming you want the back button to close the modal
                    >
                        {/* Replace "Back" with an icon or custom design as needed */}
                        <Text style={{ color: 'white', fontSize: 15.0 }}>Back</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={{ padding: 20, borderRadius: 10, alignItems: 'center', width: '100%' }}>
                    <View style={styles.textPadding}>
                        <Text style={{ ...theme.TextTheme.headingFour, padding: 20 }}>Send Invite</Text>
                    </View>

                    <Text style={{ ...theme.TextTheme.label, minWidth: 250, margin: 15 }}>My Device Name:  {store.preferences.walletName}</Text>

                    <Text style={{ ...theme.TextTheme.label, minWidth: 250 }}>Link (Identifier)</Text>
                    <TextInput
                        style={{ ...theme.Inputs.textInput, minWidth: 250 }}
                        placeholderTextColor={'white'}
                        onChangeText={setProxyIdentifier}
                        value={proxyIdentifier}
                        placeholder="eg. phone number"
                        keyboardType="default"
                    />


                    <View style={styles.buttonPadding}>
                        <TouchableOpacity style={{ ...theme.Buttons.primary, minWidth: 200 }} onPress={handleSendConnectionInvite}>
                            {sendingInvite ? (
                                <ActivityIndicator size="small" color="#FFF" /> // Customize color as needed
                            ) : (
                                <Text style={theme.TextTheme.label}>Send Invite</Text>
                            )}
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
            {showSendInviteScreen && <BottomPopup
                message={popupMessage}
                isVisible={popupVisible}
                onClose={() => setPopupVisible(false)}
            />}
        </Modal>
    );
};

export default SendInviteModal;


const styles = StyleSheet.create({
    buttonPadding: {
        // Adjust the padding as needed
        padding: 10,
    },
    textPadding: {
        // Adjust the padding as needed
        paddingLeft: 20,
    },
    center: {

        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonContainer: {
        position: 'absolute', // Positioning the button container absolutely to place it at the top-left corner
        top: 10, // Adjust as needed for your design
        left: 10, // Adjust as needed for your design
        zIndex: 10, // Ensure it's above other elements
    },
    backButton: {
        // Styling for the back button, adjust according to your app's theme
        padding: 10,
        // Add more styles as needed, like background color, border, etc.
    },
    proxyList: {
        // backgroundColor: theme.ColorPallet.grayscale.black,
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        maxHeight: 500
    },
    inviteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 240,
        backgroundColor: theme.ColorPallet.grayscale.darkGrey,
        padding: 10,
        paddingTop: 0,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: theme.ColorPallet.brand.secondary,
        borderWidth: 2,
        minHeight: 110
    },
    selectedInviteItem: {
        alignContent: 'flex-start',
        alignItems: 'flex-end',
        alignSelf: 'center',
        width: 240,
        backgroundColor: theme.ColorPallet.grayscale.darkGrey,
        padding: 10,
        paddingTop: 20,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: theme.ColorPallet.brand.secondary,
        borderWidth: 2,
        minHeight: 100
    },
    selectedForDeletionInviteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 240,
        backgroundColor: theme.ColorPallet.grayscale.darkGrey,
        padding: 10,
        paddingTop: 0,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: theme.ColorPallet.brand.primary,
        borderWidth: 2,
        minHeight: 110
    },
    deleteButton: {
        top: -1,
        alignSelf: 'flex-end',
        paddingRight: 4,
        margin: 0,
        position: 'absolute',
    },
    declineButtonOverlay: {
        top: 5,
        backgroundColor: 'red',
        color: 'white',
        padding: 8,
        borderRadius: 10,
        zIndex: 1,
        fontWeight: 'bold'
    },
    acceptButtonOverlay: {
        backgroundColor: 'orange',
        color: 'white',
        padding: 8,
        borderRadius: 10,
        marginTop: 5,
        zIndex: 1,
        fontWeight: 'bold'
    },
    overlayContainer: {
        borderWidth: 0,
        backgroundColor: 'transparent',

    }
});