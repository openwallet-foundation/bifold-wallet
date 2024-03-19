import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ImageBackground } from 'react-native';
import { theme } from '../theme';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAgent, useProofByState } from '@aries-framework/react-hooks'
import { registerOnSmartProxy, createSmartProxyEntry, getProxies, deRegisterOnSmartProxy, deleteSmartProxyEntry } from '../utils/smartProxyHelpers';
import { getItem, removeItem } from '../utils/storage';
import BottomPopup from '../components/toast/popup';

const SmartProxy = () => {
    //make a state varialbe to store the balance

    const [logs, setLogs] = useState<string[]>([]);
    const [did, setDid] = useState<string | undefined>(undefined)
    const [showRegisterScreen, setShowRegisterScreen] = useState(false)
    const [showProxyCreateScreen, setShowProxyCreateScreen] = useState(false)
    const [showListProxiesScreen, setShowListProxiesScreen] = useState(false)
    const [proxyIdentifier, setProxyIdentifier] = useState<string | undefined>(undefined)
    const [proxyValue, setProxyValue] = useState<string | undefined>(undefined)
    const [proxyList, setProxyList] = useState<any[]>([])
    const [selectedProxyEntry, setSelectedProxyEntry] = useState<string | undefined>(undefined)
    const [showDeleteOption, setShowDeleteOption] = useState<boolean>(false)
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const { agent } = useAgent()

    useEffect(() => {
        try {
            console.log("Smart proxy screen launched")
            const hi = agent?.context.wallet.isProvisioned
            agent?.dids.getCreatedDids().then((dids: any) => {
                try {
                    console.log(dids.at(0)?.did)
                    if (dids.at(0)?.did) {
                        setDid(dids.at(0)?.did)
                    }
                } catch (err: any) {
                    console.error(err);
                }

            })
        } catch (err: any) {
            console.error(err)
        }
    }, []);

    const addLog = (message: any) => {
        const time = `${new Date().toISOString()}: `;
        // Prepend new error messages to keep the newest at the top
        setLogs([time + JSON.stringify(message), ...logs]);
    };

    const handleRegistration = async () => {

        if (did) {
            const response = await registerOnSmartProxy(did, "externalIdentifier", "details")

            if (typeof response === 'object' && response.status === 200) {
                setPopupMessage("DID registered successfully")
                setPopupVisible(true);
            } else if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            }
        }
        else {
            console.error("DID not found")
        }
    }

    const handleDeregistration = async () => {
        const storedData = await getItem('proxyOwner');
        if (did) {
            const response = await deRegisterOnSmartProxy(did)
            if (storedData) {
                await removeItem('proxyOwner')
            }

            if (typeof response === 'object' && response.status === 204) {
                setPopupMessage("DID deregistered successfully")
                setPopupVisible(true);
            } else if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            }
        }
        else {
            console.error("DID not found")
        }
    }

    const handleProxyCreation = async () => {
        const storedData = await getItem('proxyOwner');
        console.log(storedData?.id);

        if (storedData?.id && proxyIdentifier && proxyValue) {
            const response = await createSmartProxyEntry(proxyIdentifier, proxyValue, storedData.id)

            if (typeof response === 'object' && response.status === 200) {
                setPopupMessage("Proxy created successfully")
                setPopupVisible(true);
            } else if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            }
        }
        else {
            console.error("Owner, proxyIdentifier or proxyValue not found")
            setPopupMessage("Owner, proxyIdentifier or proxyValue not found")
            setPopupVisible(true);
        }
    }

    const handleProxyList = async () => {
        if (did) {

            // Store proxies in an array using getProxies(did)
            const response = await getProxies(did)

            if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            } else if (Array.isArray(response) && response.length === 0) {
                setPopupMessage("No proxies found")
                setPopupVisible(true);
            } else if (Array.isArray(response) && response?.length > 0) {
                setPopupMessage("Proxies fetched successfully")
                setPopupVisible(true);
                setProxyList(response)
            }
        }
        else {
            console.error("DID not found")
            setPopupMessage("DID not found")
            setPopupVisible(true);
        }
    }

    const handleProxyEntryDeletion = async () => {
        if (selectedProxyEntry) {
            const response = await deleteSmartProxyEntry(selectedProxyEntry)
            // Update the list of proxies after deletion

            if (typeof response === 'object' && response.status === 204) {
                setPopupMessage("Proxy deleted successfully")
                setPopupVisible(true);
                if (did) {
                    const proxies = await getProxies(did)
                    setProxyList(proxies)
                }
            } else if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            }


        }
        else {
            console.error("No proxy entry selected")
        }
    }


    return (
        <ScrollView>

            <View style={styles.textPadding}>
                <Text style={theme.TextTheme.labelTitle}>Your DID: {'\n'}{did}</Text>

            </View>

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={() => setShowRegisterScreen(true)}>
                    <Text style={theme.TextTheme.label}>Register DID on Proxy</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showRegisterScreen}
                onRequestClose={() => {
                    setShowRegisterScreen(false); // Corrected typo from setShowRegisterScreem to setShowRegisterScreen
                    setPopupVisible(false);
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Back Button Container */}
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => { setPopupVisible(false); setShowRegisterScreen(false); }} // Assuming you want the back button to close the modal
                        >
                            {/* Replace "Back" with an icon or custom design as needed */}
                            <Text style={{ color: 'white', fontSize: 15.0 }}>Back</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <View style={{ padding: 20, borderRadius: 10, alignItems: 'center' }}>
                        <Text>Register my DID on the proxy server</Text>
                        <View style={styles.buttonPadding}>
                            <TouchableOpacity style={theme.Buttons.primary} onPress={() => handleRegistration()}>
                                <Text style={theme.TextTheme.label}>Register</Text>
                            </TouchableOpacity>
                        </View>
                        <Text>Deregister from proxy server</Text>
                        <View style={styles.buttonPadding}>
                            <TouchableOpacity style={theme.Buttons.primary} onPress={() => handleDeregistration()}>
                                <Text style={theme.TextTheme.label}>Deregister</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {showRegisterScreen && <BottomPopup
                    message={popupMessage}
                    isVisible={popupVisible}
                    onClose={() => setPopupVisible(false)}
                />}
            </Modal>

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={() => setShowProxyCreateScreen(true)}>
                    <Text style={theme.TextTheme.label}>Create New Proxy Link </Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showProxyCreateScreen}
                onRequestClose={() => {
                    setShowProxyCreateScreen(false); // Corrected typo from setShowRegisterScreem to setShowRegisterScreen
                    setPopupVisible(false);
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    {/* Back Button Container */}
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => { setShowProxyCreateScreen(false); setPopupVisible(false); }} // Assuming you want the back button to close the modal
                        >
                            {/* Replace "Back" with an icon or custom design as needed */}
                            <Text style={{ color: 'white', fontSize: 15.0 }}>Back</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <View style={{ padding: 20, borderRadius: 10, alignItems: 'center', maxWidth: 320 }}>
                        <View style={styles.textPadding}>
                            <Text style={{ ...theme.TextTheme.headingFour }}>Create proxy link</Text>
                        </View>
                        <View style={styles.buttonPadding}>
                            <Text style={{ ...theme.TextTheme.label, minWidth: 250 }}>Link (Identifier)</Text>
                            <TextInput
                                style={theme.Inputs.textInput}
                                onChangeText={setProxyIdentifier}
                                value={proxyIdentifier}
                                placeholder="eg. phone number"
                                keyboardType="default"
                            />

                        </View>
                        <View style={styles.buttonPadding}>
                            <Text style={{ ...theme.TextTheme.label, minWidth: 250 }}>To (Destination)</Text>
                            <TextInput
                                style={theme.Inputs.textInput}
                                onChangeText={setProxyValue}
                                value={proxyValue}
                                placeholder="eg. Wallet Address"
                                keyboardType="default"
                            />

                        </View>
                        <View style={styles.buttonPadding}>
                            <TouchableOpacity style={theme.Buttons.primary} onPress={() => handleProxyCreation()}>
                                <Text style={theme.TextTheme.label}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {showProxyCreateScreen && <BottomPopup
                    message={popupMessage}
                    isVisible={popupVisible}
                    onClose={() => setPopupVisible(false)}
                />}
            </Modal>


            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={() => { setShowListProxiesScreen(true); handleProxyList() }}>
                    <Text style={theme.TextTheme.label}>Manage My Proxies</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={showListProxiesScreen}
                onRequestClose={() => {
                    setShowListProxiesScreen(false); // Corrected typo from setShowRegisterScreem to setShowRegisterScreen
                    setPopupVisible(false);
                }}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>
                    {/* Back Button Container */}
                    <View style={styles.backButtonContainer}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => { setShowListProxiesScreen(false); setPopupVisible(false); }} // Assuming you want the back button to close the modal
                        >
                            {/* Replace "Back" with an icon or custom design as needed */}
                            <Text style={{ color: 'white', fontSize: 15.0 }}>Back</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <View style={{ padding: 20, borderRadius: 10, alignItems: 'center', width: '100%' }}>
                        <View style={styles.textPadding}>
                            <Text style={{ ...theme.TextTheme.headingFour, padding: 20 }}>Manage Proxies</Text>
                        </View>

                        <View style={{ ...styles.buttonPadding, width: '100%' }}>
                            {/* <TouchableOpacity style={{ ...theme.Buttons.primary, marginBottom: 20 }} onPress={() => handleProxyList()}>
                                <Text style={theme.TextTheme.label}>Fetch Proxies</Text>

                            </TouchableOpacity> */}
                            {/* Display the list of fetched proxies */}
                            {proxyList?.length > 0 && (<ScrollView style={styles.proxyList}>
                                {proxyList.map((proxy, index) => (
                                    <View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity key={index} style={proxy?.id === selectedProxyEntry ? styles.selectedForDeletionProxyItem : styles.proxyItem}
                                            onPress={() => {
                                                setSelectedProxyEntry(proxy?.id);
                                                setShowDeleteOption(false)
                                            }}>

                                            {proxy?.id === selectedProxyEntry &&
                                                <TouchableOpacity onPress={() => setShowDeleteOption(true)} style={styles.deleteButton}>
                                                    <Text>
                                                        ⓧ
                                                    </Text>
                                                </TouchableOpacity>}
                                            {proxy?.id === selectedProxyEntry && showDeleteOption && (
                                                <View style={styles.overlayContainer}>
                                                    <TouchableOpacity onPress={handleProxyEntryDeletion}>
                                                        <Text style={styles.deleteButtonOverlay}>Delete</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setShowDeleteOption(false)}>
                                                        <Text style={styles.cancelButtonOverlay}>Cancel</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}

                                            <Text >{proxy?.proxyKey}</Text>
                                            <Text style={{ fontSize: 20 }}>⇓</Text>
                                            <Text >{proxy?.details}</Text>

                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>)}
                        </View>
                    </View>
                </View>
                {showListProxiesScreen && <BottomPopup
                    message={popupMessage}
                    isVisible={popupVisible}
                    onClose={() => setPopupVisible(false)}
                />}
            </Modal>

        </ScrollView >
    );
};

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
    proxyItem: {
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: 240,
        backgroundColor: theme.ColorPallet.grayscale.darkGrey,
        padding: 10,
        paddingTop: 20,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 2
    },
    selectedProxyItem: {
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: 240,
        backgroundColor: theme.ColorPallet.grayscale.darkGrey,
        padding: 10,
        paddingTop: 20,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: theme.ColorPallet.brand.primary,
        borderWidth: 2
    },
    selectedForDeletionProxyItem: {
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: 240,
        backgroundColor: theme.ColorPallet.grayscale.darkGrey,
        padding: 10,
        paddingTop: 20,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: theme.ColorPallet.brand.primary,
        borderWidth: 2,
    },
    deleteButton: {
        top: -1,
        alignSelf: 'flex-end',
        paddingRight: 4,
        margin: 0,
        position: 'absolute',
    },
    deleteButtonOverlay: {
        top: 10,
        backgroundColor: 'red',
        color: 'white',
        padding: 8,
        borderRadius: 10,
        zIndex: 1,
    },
    cancelButtonOverlay: {
        top: 15,
        backgroundColor: 'orange',
        color: 'white',
        padding: 8,
        borderRadius: 10,
        marginTop: 5,
        zIndex: 1,
    },
    overlayContainer: {
        padding: 0,
        margin: 0,
        borderWidth: 0,
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        zIndex: 1
    }
});

export default SmartProxy;
