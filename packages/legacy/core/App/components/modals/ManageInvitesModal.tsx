import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { theme } from '../../theme';
import BottomPopup from '../toast/popup';
import { getItem } from '../../utils/storage';
import { acceptConnectionRequest, getConnectionRequests, rejectConnectionRequest } from '../../utils/connectionRequestHelpers';
import { useAgent } from '@aries-framework/react-hooks';
import { connectFromInvitation, getJson, getUrl, receiveMessageFromUrlRedirect } from '../../utils/helpers';
import { Screens, Stacks } from '../../types/navigators';
import { BifoldError } from '../../types/error';
import { useTranslation } from 'react-i18next';
import { set } from 'mockdate';


interface ManageInvitesModalProps {
    showManageInvitesScreen: boolean;
    setShowManageInvitesScreen: (show: boolean) => void;
    navigation: any;
}

const ManageInvitesModal: React.FC<ManageInvitesModalProps> = ({
    showManageInvitesScreen,
    setShowManageInvitesScreen,
    navigation,
}) => {

    const { agent } = useAgent()
    const { t } = useTranslation()
    const [popupVisible, setPopupVisible] = React.useState<boolean>(false);
    const [inviteList, setInviteList] = React.useState<any[]>([]);
    const [selectedInviteEntry, setSelectedInviteEntry] = React.useState<string | null>(null);
    const [showDeclineOption, setShowDeclineOption] = React.useState<boolean>(false);
    const [popupMessage, setPopupMessage] = React.useState<string>('');
    const [showNonPendingInvites, setShowNonPendingInvites] = React.useState(false);


    let implicitInvitations = false
    let reuseConnections = false
    let useMultUseInvitation = false

    useEffect(() => {
        if (showManageInvitesScreen) {
            console.log('Showing Manage Invites Screen');
            handleGetInvites();
        }
    }, [showManageInvitesScreen])

    const handleGetInvites = async () => {
        const storedData = await getItem('proxyOwner');

        if (storedData) {
            console.log('Found owner ID: ' + storedData?.id);
            const connectionData = await getConnectionRequests(storedData?.id);
            if (typeof connectionData === 'string') {
                setPopupMessage(connectionData)
                setPopupVisible(true);
            } else if (Array.isArray(connectionData) && connectionData.length === 0) {
                setPopupMessage("No invites found")
                setPopupVisible(true);
            } else if (Array.isArray(connectionData) && connectionData?.length > 0) {
                setPopupMessage("Invites fetched successfully")
                setPopupVisible(true);
                setInviteList(connectionData)
            }
            console.log("Connection Requests: ");
            console.log(connectionData);
        }
    }

    const handleInvitation = async (value: string): Promise<void> => {
        try {
            const receivedInvitation = await connectFromInvitation(
                value,
                agent,
                implicitInvitations,
                reuseConnections,
                useMultUseInvitation
            )
            if (receivedInvitation?.connectionRecord?.id) {
                // not connectionless
                navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                    screen: Screens.Connection,
                    params: { connectionId: receivedInvitation.connectionRecord.id },
                })
            } else {
                //connectionless
                navigation.navigate(Stacks.ConnectionStack as any, {
                    screen: Screens.Connection,
                    params: { threadId: receivedInvitation?.outOfBandRecord.outOfBandInvitation.threadId },
                })
            }
        } catch (err: unknown) {
            // [Error: Connection does not have an ID]
            // [AriesFrameworkError: An out of band record with invitation 05fe3693-2c12-4165-a3b6-370280ccd43b has already been received. Invitations should have a unique id.]
            try {
                // if scanned value is json -> pass into AFJ as is
                const json = getJson(value)
                if (json) {
                    await agent?.receiveMessage(json)
                    navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                        screen: Screens.Connection,
                        params: { threadId: json['@id'] },
                    })
                    return
                }

                // if scanned value is url -> receive message from it
                const url = getUrl(value)
                if (url) {
                    const message = await receiveMessageFromUrlRedirect(value, agent)
                    navigation.getParent()?.navigate(Stacks.ConnectionStack, {
                        screen: Screens.Connection,
                        params: { threadId: message['@id'] },
                    })
                    return
                }
            } catch (err: unknown) {
                const error = new BifoldError(
                    t('Error.Title1031'),
                    t('Error.Message1031'),
                    (err as Error)?.message ?? err,
                    1031
                )
                // throwing for QrCodeScanError
                throw error
            }
        }
    }

    const handleDeclineInvite = async (invitation: any) => {
        console.log('Declining invite entry: ' + selectedInviteEntry);

        try {
            const response = await rejectConnectionRequest(invitation?.id);
            if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            } else {
                setPopupMessage('Invite declined successfully')
                setPopupVisible(true);
                handleGetInvites();
            }
        }
        catch (error) {
            console.log('Error declining invite: ' + error);
            setPopupMessage('Error declining invite');
            setPopupVisible(true);
        }
    }

    const handleAcceptInvite = async (invitation: any) => {
        console.log('Accepting invite id: ' + invitation?.id);
        console.log('Invitation: ' + invitation?.connectionDetails?.link);
        try {
            await handleInvitation(invitation?.connectionDetails?.link)

            const response = await acceptConnectionRequest(invitation?.id);
            if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            } else {
                setPopupMessage('Invite accepted successfully')
                setPopupVisible(true);
                handleGetInvites();
            }
        }
        catch (error) {
            console.log('Error accepting invite: ' + error);
            setPopupMessage('Error accepting invite');
            setPopupVisible(true);
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showManageInvitesScreen}
            onRequestClose={() => {
                setShowManageInvitesScreen(false);
                setPopupVisible(false);
            }}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                {/* Back Button Container */}
                <View style={styles.backButtonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => { setShowManageInvitesScreen(false); setPopupVisible(false); }} // Assuming you want the back button to close the modal
                    >
                        {/* Replace "Back" with an icon or custom design as needed */}
                        <Text style={{ color: 'white', fontSize: 15.0 }}>Back</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={{ padding: 20, borderRadius: 10, alignItems: 'center', width: '100%' }}>
                    <View style={styles.textPadding}>
                        <Text style={{ ...theme.TextTheme.headingFour, padding: 20 }}>Manage Invites</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
                        <Switch
                            trackColor={{ false: 'white', true: theme.ColorPallet.brand.highlight }}
                            thumbColor={showNonPendingInvites ? "#f5dd4b" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => setShowNonPendingInvites(!showNonPendingInvites)}
                            value={showNonPendingInvites}
                        />
                        <Text style={{ color: 'white', marginLeft: 8 }}>
                            Show Past Invites
                        </Text>

                    </View>

                    <View style={{ ...styles.buttonPadding, width: '100%' }}>
                        {inviteList?.length > 0 ? (<ScrollView style={styles.proxyList}>
                            {inviteList.map((invite, index) => (

                                ((showNonPendingInvites && invite?.status !== "PENDING" || invite?.status === "PENDING") && <View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                                    <TouchableOpacity key={index} style={invite?.id === selectedInviteEntry ? styles.selectedForDeletionInviteItem : styles.inviteItem}
                                        onPress={() => {
                                            setSelectedInviteEntry(invite?.id);
                                            setShowDeclineOption(false)
                                        }}>

                                        <View>
                                            <Text style={{ color: 'white', margin: 5 }}>{invite?.requesterInfo.name}</Text>
                                            <Text style={{ color: 'white', margin: 5 }}>{invite?.proxyKey}</Text>
                                        </View>

                                        {invite?.id === selectedInviteEntry && invite?.status === "PENDING" && (
                                            <View style={styles.overlayContainer}>
                                                <TouchableOpacity onPress={() => handleAcceptInvite(invite)}>
                                                    <Text style={styles.acceptButtonOverlay}>Accept</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDeclineInvite(invite)}>
                                                    <Text style={styles.declineButtonOverlay}>Decline</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {invite?.status === "ACCEPTED" && (
                                            <View style={styles.overlayContainer}>
                                                <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 10 }}>Accepted</Text>
                                            </View>
                                        )}

                                        {invite?.status === "REJECTED" && (
                                            <View style={styles.overlayContainer}>
                                                <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 10 }}>Declined</Text>
                                            </View>
                                        )}

                                        {invite?.status === "EXPIRED" && (
                                            <View style={styles.overlayContainer}>
                                                <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 10 }}>Expired</Text>
                                            </View>
                                        )}

                                    </TouchableOpacity>
                                </View>)
                            ))}
                        </ScrollView>) : <Text style={{ color: 'white', fontSize: 15.0, textAlign: 'center' }}>No invites found</Text>}
                    </View>
                </View>
            </View>
            {showManageInvitesScreen && <BottomPopup
                message={popupMessage}
                isVisible={popupVisible}
                onClose={() => setPopupVisible(false)}
            />}
        </Modal>
    );
};

export default ManageInvitesModal;


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