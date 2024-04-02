// RequestPaymentModal.tsx
import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
// Import your theme or any other necessary elements here
import { theme as globalTheme } from '../../theme';
import { initNodeAndSdk } from '../../utils/lightningHelpers';

interface RequestPaymentModalProps {
    showRequestLightningPaymentModal: boolean;
    setShowRequestLightningPaymentModal: (show: boolean) => void;
    satsAmount: string;
    setSatsAmount: (amount: string) => void;
    btcZarPrice?: number;
    invoiceGenLoading: boolean;
    handleGetInvoiceButtonPress: () => void;
    paymentStatusDesc?: string;
    startingNode?: boolean; // Assuming startingNode might be a prop as well
    breezInitializing: boolean;
    eventHandler: any;
}

const RequestPaymentModal: React.FC<RequestPaymentModalProps> = ({
    showRequestLightningPaymentModal,
    setShowRequestLightningPaymentModal,
    satsAmount,
    btcZarPrice,
    setSatsAmount,
    invoiceGenLoading,
    handleGetInvoiceButtonPress,
    paymentStatusDesc,
    startingNode,
    breezInitializing,
    eventHandler,
}) => {

    React.useEffect(() => {

        // setNodeAndSdkInitialized(false);
        // initNodeAndSdk(eventHandler).then((res) => {
        //     setNodeAndSdkInitialized(true);
        // })

    }, [])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showRequestLightningPaymentModal}
            onRequestClose={() => {
                setShowRequestLightningPaymentModal(false);
            }}
        >
            <View style={globalTheme.ChatTheme.paymentModals.modalView}>
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Request Payment</Text>

                {/* Show if node is busy initializing */}
                {breezInitializing ? (
                    <View style={globalTheme.ChatTheme.paymentModals.breezInitView}>
                        <Text style={{ color: '#fff', marginTop: 20 }}>Initializing node...</Text>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                ) : <View style={globalTheme.ChatTheme.paymentModals.breezInitView}></View>}

                {!startingNode && (
                    <View>
                        <View>
                            <Text style={globalTheme.TextTheme.label}>Enter amount in sats:</Text>
                            <TextInput
                                style={{ ...globalTheme.Inputs.textInput, margin: 10 }}
                                onChangeText={setSatsAmount}
                                value={satsAmount}
                                placeholder="Amount in sats"
                                keyboardType="numeric"
                            />
                            <Text style={globalTheme.TextTheme.label}>{btcZarPrice ? ('    (R' + (Number(satsAmount) / 100000000 * btcZarPrice).toFixed(2) + ')\n') : ('Fetching price')}</Text>
                        </View>
                        <TouchableOpacity
                            style={globalTheme.ChatTheme.paymentModals.mainButton}
                            onPress={() => {
                                console.log('Generate invoice button pressed');
                                handleGetInvoiceButtonPress();
                            }}
                        >
                            {invoiceGenLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={globalTheme.TextTheme.label}>Generate and Send Invoice</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
                {paymentStatusDesc ? <Text style={{ color: 'white', minHeight: 50 }}>{paymentStatusDesc}</Text> : <Text style={{ minHeight: 50 }}></Text>}

                {/* Close Button at the bottom */}
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                        style={globalTheme.ChatTheme.paymentModals.closeButton}
                        onPress={() => setShowRequestLightningPaymentModal(false)}
                    >
                        <Text style={{ color: '#fff' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default RequestPaymentModal;
