import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme as globalTheme } from '../../theme';
import * as lightningPayReq from 'bolt11';


interface CheckLightningTransactionModalProps {
    showTransactionStatusModal: boolean;
    setShowTransactionStatusModal: (show: boolean) => void;
    invoiceText?: string | undefined;
    btcZarPrice?: number;
    startingNode?: boolean;
    paymentInProgress: boolean;
    statusCheckHandler: (invoiceText?: string | undefined) => void;
    checkStatusDesc?: string;
    breezInitializing: boolean;
    eventHandler: any
}

const CheckLightningTransactionModal: React.FC<CheckLightningTransactionModalProps> = ({
    showTransactionStatusModal: showLightningPayModal,
    setShowTransactionStatusModal: setShowLightningPayModal,
    invoiceText,
    btcZarPrice,
    startingNode,
    paymentInProgress,
    statusCheckHandler,
    checkStatusDesc,
    breezInitializing,
    eventHandler
}) => {

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showLightningPayModal}
            onRequestClose={() => setShowLightningPayModal(false)}
        >
            <View style={globalTheme.ChatTheme.paymentModals.modalView}>
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Check Payment Status</Text>

                {/* Show if node is busy initializing */}
                {breezInitializing ? (
                    <View style={globalTheme.ChatTheme.paymentModals.breezInitView}>
                        <Text style={{ color: '#fff', marginTop: 20 }}>Initializing node...</Text>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                ) : <View style={globalTheme.ChatTheme.paymentModals.breezInitView}></View>}

                <Text style={{ ...globalTheme.TextTheme.modalNormal, marginTop: 20, padding: 10, color: 'white' }}>
                    {invoiceText &&
                        'Amount: \n\n    ' + (Number(lightningPayReq.decode(invoiceText).millisatoshis) / 1000) + " Satoshi"}
                    {btcZarPrice && invoiceText ? ('\n\n    (R' + (Number(lightningPayReq.decode(invoiceText).millisatoshis) / 100000000000 * btcZarPrice).toFixed(2) + ')') : "\n\n Fetching price..."}
                    {!invoiceText && 'No invoice found'}
                </Text>

                {!startingNode && (
                    <TouchableOpacity
                        style={globalTheme.ChatTheme.paymentModals.mainButton}
                        onPress={() => {
                            // Add your payment logic here
                            console.log('Status Check button pressed');
                            statusCheckHandler(invoiceText)
                        }}>
                        {paymentInProgress ? (
                            <ActivityIndicator size="small" color="#FFF" /> // Customize color as needed
                        ) : (
                            <Text style={globalTheme.TextTheme.label}>Check Status</Text>
                        )}

                    </TouchableOpacity>
                )}
                {checkStatusDesc ? (
                    <Text style={{ color: '#fff', minHeight: 50 }}>{checkStatusDesc}</Text>

                ) : <Text style={{ minHeight: 50 }}></Text>}


                <View style={{ width: '100%', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-end' }}>
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

export default CheckLightningTransactionModal;