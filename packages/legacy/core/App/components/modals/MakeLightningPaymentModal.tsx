import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme as globalTheme } from '../../theme';
import * as lightningPayReq from 'bolt11';
import { set } from 'mockdate';

interface PayWithBitcoinModalProps {
    showLightningPayModal: boolean;
    setShowLightningPayModal: (show: boolean) => void;
    invoiceText?: string | undefined;
    btcZarPrice?: number;
    startingNode?: boolean;
    paymentInProgress: boolean;
    payInvoiceHandler: (invoiceText?: string | undefined) => void;
    paymentStatusDesc?: string;
    breezInitializing: boolean;
    eventHandler: any
}

const PayWithBitcoinLightningModal: React.FC<PayWithBitcoinModalProps> = ({
    showLightningPayModal,
    setShowLightningPayModal,
    invoiceText,
    btcZarPrice,
    startingNode,
    paymentInProgress,
    payInvoiceHandler,
    paymentStatusDesc,
    breezInitializing,
    eventHandler
}) => {

    useEffect(() => {

        // setNodeAndSdkInitialized(false);
        // initNodeAndSdk(eventHandler).then((res) => {
        //     setNodeAndSdkInitialized(true);
        // })

    }, [])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showLightningPayModal}
            onRequestClose={() => setShowLightningPayModal(false)}
        >
            <View style={globalTheme.ChatTheme.paymentModals.modalView}>
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Pay with Bitcoin</Text>

                {/* Show if node is busy initializing */}
                {breezInitializing ? (
                    <View style={globalTheme.ChatTheme.paymentModals.breezInitView}>
                        <Text style={{ color: '#fff', marginTop: 20 }}>Initializing node...</Text>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                ) : <View style={globalTheme.ChatTheme.paymentModals.breezInitView}></View>}

                <Text style={{ ...globalTheme.TextTheme.modalNormal, marginTop: 20, padding: 10 }}>
                    {invoiceText &&
                        'Amount: \n\n    ' + (Number(lightningPayReq.decode(invoiceText).millisatoshis) / 1000) + " Satoshi"}
                    {btcZarPrice && invoiceText && ('\n\n    (R' + (Number(lightningPayReq.decode(invoiceText).millisatoshis) / 100000000000 * btcZarPrice).toFixed(2) + ')')}
                </Text>
                {!startingNode && (
                    <TouchableOpacity
                        style={globalTheme.ChatTheme.paymentModals.mainButton}
                        onPress={() => {
                            // Add your payment logic here
                            console.log('Pay button pressed');
                            payInvoiceHandler(invoiceText)
                        }}>
                        {paymentInProgress ? (
                            <ActivityIndicator size="small" color="#FFF" /> // Customize color as needed
                        ) : (
                            <Text style={globalTheme.TextTheme.label}>Pay Invoice</Text>
                        )}

                    </TouchableOpacity>
                )}
                {paymentStatusDesc ? (
                    <Text style={{ color: '#fff', minHeight: 50 }}>{paymentStatusDesc}</Text>

                ) : <Text style={{ minHeight: 50 }}></Text>}

                <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                        style={globalTheme.ChatTheme.paymentModals.closeButton}
                        onPress={() => setShowLightningPayModal(false)}>
                        <Text style={{ color: '#fff' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PayWithBitcoinLightningModal;