import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAgent, useProofByState } from '@aries-framework/react-hooks'
import { registerOnSmartProxy, createSmartProxyEntry, getProxies, deRegisterOnSmartProxy, deleteSmartProxyEntry, querySmartProxyEntry, getOwner } from '../utils/smartProxyHelpers';
import { getItem, removeItem } from '../utils/storage';
import BottomPopup from '../components/toast/popup';
import { getBTCToZarAmount, getNodeId, initNodeAndSdk, payInvoice, payInvoiceWithAmount, sendSpontaneousPaymentToNode } from '../utils/lightningHelpers';
import { set } from 'mockdate';

const SmartProxy = () => {
    //make a state varialbe to store the balance

    const [logs, setLogs] = useState<string[]>([]);
    const [did, setDid] = useState<string | undefined>(undefined)
    const [isRegistered, setIsRegistered] = useState<boolean>(false)
    const [showRegisterScreen, setShowRegisterScreen] = useState(false)
    const [showProxyCreateScreen, setShowProxyCreateScreen] = useState(false)
    const [showListProxiesScreen, setShowListProxiesScreen] = useState(false)
    const [showMakePaymentScreen, setShowMakePaymentScreen] = useState(false)
    const [proxyIdentifier, setProxyIdentifier] = useState<string | undefined>(undefined)
    const [proxyIdToQuery, setProxyIdToQuery] = useState<string | undefined>(undefined)
    const [proxyInvoiceSearchResult, setProxyInvoiceSearchResult] = useState<string | undefined>(undefined)
    const [proxyValue, setProxyValue] = useState<string | undefined>(undefined)
    const [proxyList, setProxyList] = useState<any[]>([])
    const [selectedProxyEntry, setSelectedProxyEntry] = useState<string | undefined>(undefined)
    const [showDeleteOption, setShowDeleteOption] = useState<boolean>(false)
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [paymentStep, setPaymentStep] = useState(1);
    const [paymentAmount, setPaymentAmount] = useState<string | undefined>(undefined)
    const [paymentAmountInZAR, setPaymentAmountInZAR] = useState<string | undefined>(undefined)
    const [checkedIfRegistered, setCheckedIfRegistered] = useState<boolean>(false)
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [paymentLoading, setPaymentLoading] = useState<boolean>(false)
    const [nodeId, setNodeId] = useState<string | undefined>(undefined)

    const { agent } = useAgent()

    const eventHandler = (breezEvent: any) => {
        console.log("event", JSON.stringify(breezEvent))
        // Add the event to the logs
        addLog(JSON.stringify(breezEvent));
    }

    useEffect(() => {
        try {
            console.log("Smart proxy screen launched")
            agent?.dids.getCreatedDids().then((dids: any) => {
                try {
                    console.log(dids.at(0)?.did)
                    if (dids.at(0)?.did) {
                        setDid(dids.at(0)?.did)
                        handleCheckIfRegistered(dids.at(0)?.did)
                    }
                } catch (err: any) {
                    console.error(err);
                }

            })


            const eventSubscription = initNodeAndSdk(eventHandler).then((res) => {
                // const nodeId = getNodeId().then((nodeId) => {
                //     setNodeId(nodeId)
                //     setProxyValue(nodeId)
                // })
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

    const handleCheckIfRegistered = async (did: string) => {
        try {
            const response = await getOwner(did)
            if (Array.isArray(response) && response.length > 0) {
                setIsRegistered(true)
                setCheckedIfRegistered(true)
            } else if (Array.isArray(response) && response.length === 0) {
                setIsRegistered(false)
                setCheckedIfRegistered(true)
            }
        }
        catch (err: any) {
            console.error(err)
            setPopupMessage("Error checking registration")
            setPopupVisible(true);
        }
    }

    const handleRegistration = async () => {

        if (did) {
            const response = await registerOnSmartProxy(did, "externalIdentifier", "details")

            if (typeof response === 'object' && response.status === 200) {
                setPopupMessage("DID registered successfully")
                setPopupVisible(true);
                handleCheckIfRegistered(did)
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
                handleCheckIfRegistered(did)
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

    const handleQueryProxyEntry = async () => {
        if (proxyIdToQuery) {
            const response = await querySmartProxyEntry(proxyIdToQuery)
            // TODO Elmer: Handle multiple return results for the same identifier
            if (Array.isArray(response) && response.length > 0) {
                if (response[0].hasOwnProperty('details')) {
                    setProxyInvoiceSearchResult(response[0].details)
                    setPopupMessage("Proxy found successfully")
                    setPopupVisible(true);
                    setPaymentStep(2)
                } else {
                    setPopupMessage("Address not found in response")
                    setPopupVisible(true);
                }

            } else if (typeof response === 'string') {
                setPopupMessage(response)
                setPopupVisible(true);
            } else {
                setPopupMessage("No proxy found")
                setPopupVisible(true);
            }
        }
        else {
            console.error("No proxy identifier specified")
            setPopupMessage("No proxy identifier specified")
            setPopupVisible(true);
        }
    }

    const handlePayButtonPress = async () => {
        try {
            setPaymentLoading(true)
            Number(paymentAmount)
            if (proxyInvoiceSearchResult && paymentAmount) {
                const response = await payInvoiceWithAmount(proxyInvoiceSearchResult, Number(paymentAmount))
                if (typeof response === 'object' && response.payment.status === 'complete') {
                    setPopupMessage("Payment successful")
                    setPopupVisible(true);
                    setPaymentStep(3)
                    setPaymentLoading(false)
                } else if (typeof response === 'string') {
                    setPopupMessage(response)
                    setPopupVisible(true);
                    setPaymentStep(-1)
                    setPaymentLoading(false)
                }
            } else {
                setPopupMessage("Error During Payment")
                setPopupVisible(true);
                setPaymentStep(-1)
                setPaymentLoading(false)
            }
        }
        catch (err: any) {
            console.error(err)
            setPopupMessage("Error During Payment")
            setPopupVisible(true);
            setPaymentStep(-1)
            setPaymentLoading(false)
        }
        setPaymentLoading(false)
    }

    useEffect(() => {
        // Clear the previous timer if it exists
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        // Set a new timer
        const timer = setTimeout(() => {
            try {
                if (paymentAmount) {
                    getBTCToZarAmount(Number(paymentAmount)).then((amount) => {
                        setPaymentAmountInZAR(amount);
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }, 2000); // Delay of 2 seconds

        // Save the new timer
        setDebounceTimer(timer);

        // Cleanup function to clear timer when the component unmounts or before the effect runs again
        return () => clearTimeout(timer);
    }, [paymentAmount]); // Effect depends on paymentAmount

    return (
        <View>
            {isRegistered && (
                <View style={styles.textPadding}>
                    <Text style={theme.TextTheme.labelTitle}>Your DID: </Text>
                    <Text style={theme.TextTheme.labelTitle} numberOfLines={1} ellipsizeMode="tail" >{did}</Text>
                    <Text style={theme.TextTheme.labelTitle}>is registered on the Proxy</Text>
                </View>
            )}
            {!isRegistered && !checkedIfRegistered && (
                <View style={styles.textPadding}>
                    <Text style={theme.TextTheme.labelTitle}>Searching for DID on proxy...</Text>
                </View>
            )}
            {!isRegistered && checkedIfRegistered && (
                <View style={styles.textPadding}>
                    <Text style={theme.TextTheme.labelTitle}>Your DID is not registered on the proxy</Text>
                </View>
            )}

            <ScrollView>

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
                                    placeholderTextColor={'white'}
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
                                    placeholderTextColor={'white'}
                                    onChangeText={setProxyValue}
                                    value={proxyValue}
                                    placeholder={"eg. Lightning Invoice"}
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
                                                    <TouchableOpacity onPress={() => setShowDeleteOption(!showDeleteOption)} style={styles.deleteButton}>
                                                        <Text style={{ color: 'white' }}>
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

                                                <Text style={{ color: 'white' }}>{proxy?.proxyKey}</Text>
                                                <Text style={{ fontSize: 20, color: 'white' }}>⇓</Text>
                                                <Text style={{ color: 'white' }}>{proxy?.details}</Text>

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

                <View style={styles.buttonPadding}>
                    <TouchableOpacity style={theme.Buttons.primary} onPress={() => setShowMakePaymentScreen(true)}>
                        <Text style={theme.TextTheme.label}>Make Payment</Text>
                    </TouchableOpacity>
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showMakePaymentScreen}
                    onRequestClose={() => {
                        setShowMakePaymentScreen(false); // Corrected typo from setShowRegisterScreem to setShowRegisterScreen
                        setPopupVisible(false);
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', paddingTop: 80, alignItems: 'center' }}>
                        {/* Back Button Container */}
                        <View style={styles.backButtonContainer}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => { setPopupVisible(false); setShowMakePaymentScreen(false); }} // Assuming you want the back button to close the modal
                            >
                                {/* Replace "Back" with an icon or custom design as needed */}
                                <Text style={{ color: 'white', fontSize: 15.0 }}>Back</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Modal Content */}
                        <Text style={{ ...theme.TextTheme.headingFour, textAlign: 'center' }}>Make lightning payment {'\n'} {paymentStep > 0 && ('Step ' + paymentStep)}</Text>
                        <View style={{ padding: 20, borderRadius: 10, alignItems: 'center' }}>

                            {paymentStep === 1 && <View>
                                <View style={styles.buttonPadding}>
                                    <Text style={{ ...theme.TextTheme.label, minWidth: 250 }}>Link (Identifier)</Text>
                                    <TextInput
                                        style={theme.Inputs.textInput}
                                        onChangeText={setProxyIdToQuery}
                                        placeholderTextColor={'white'}
                                        value={proxyIdToQuery}
                                        placeholder="eg. phone number"
                                        keyboardType="default"
                                    />

                                </View>
                                <View style={styles.buttonPadding}>
                                    <TouchableOpacity style={theme.Buttons.primary} onPress={() => handleQueryProxyEntry()}>
                                        <Text style={theme.TextTheme.label}>Get Address</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>}
                            {paymentStep === 2 && <View>
                                <View style={styles.buttonPadding}>

                                    <Text>Amount (Sats)</Text>
                                    <TextInput
                                        style={theme.Inputs.textInput}
                                        placeholderTextColor={'white'}
                                        onChangeText={(value) => {
                                            setPaymentAmount(value);
                                        }}
                                        value={paymentAmount}
                                        placeholder="Amount in Satoshi's"
                                        keyboardType="default"
                                    />
                                    {paymentAmountInZAR && <View>
                                        <Text style={theme.TextTheme.label}>(R{paymentAmountInZAR})</Text>
                                    </View>}
                                    <View style={styles.buttonPadding}>

                                        <TouchableOpacity style={theme.Buttons.primary} onPress={() => handlePayButtonPress()}>
                                            {paymentLoading ? (
                                                <ActivityIndicator size="small" color="#FFF" /> // Customize color as needed
                                            ) : (
                                                <Text style={theme.TextTheme.label}>Pay</Text>
                                            )}

                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.buttonPadding}>
                                        <TouchableOpacity style={theme.Buttons.primary} onPress={() => setPaymentStep(1)}>
                                            <Text style={theme.TextTheme.label}>Back</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.buttonPadding}>
                                        {proxyIdToQuery && <Text style={theme.TextTheme.label}>Identifier: {proxyIdToQuery}</Text>}
                                    </View>
                                    <View style={styles.buttonPadding}>
                                        {proxyInvoiceSearchResult && <Text style={theme.TextTheme.label}>Payment Address: {proxyInvoiceSearchResult}</Text>}
                                    </View>

                                </View>
                            </View>
                            }
                            {paymentStep === 3 && <View>
                                <Text style={theme.TextTheme.label}>Payment successful</Text>
                                <View style={styles.buttonPadding}>
                                    <TouchableOpacity style={theme.Buttons.primary} onPress={() => setPaymentStep(1)}>
                                        <Text style={theme.TextTheme.label}>Make Another Payment</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>}
                            {paymentStep === -1 && <View>
                                <Text style={theme.TextTheme.label}>Payment failed</Text>
                                <View style={styles.buttonPadding}>
                                    <TouchableOpacity style={theme.Buttons.primary} onPress={() => setPaymentStep(1)}>
                                        <Text style={theme.TextTheme.label}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>}
                        </View>
                    </View>
                    {showMakePaymentScreen && <BottomPopup
                        message={popupMessage}
                        isVisible={popupVisible}
                        onClose={() => setPopupVisible(false)}
                    />}
                </Modal>

            </ScrollView >
        </View>
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
        zIndex: 1,
        justifyContent: 'center',
        height: "100%",
    }
});

export default SmartProxy;
