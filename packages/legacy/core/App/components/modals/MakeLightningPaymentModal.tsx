import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme as globalTheme } from '../../theme';
import * as lightningPayReq from 'bolt11';
import { initNodeAndSdk } from '../../utils/lightningHelpers';
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
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.87)', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Pay with Bitcoin</Text>

                {/* Show if node is busy initializing */}
                {breezInitializing && (
                    <View>
                        <Text style={{ color: '#fff', marginTop: 20 }}>Initializing node...</Text>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                )}

                <Text style={{ ...globalTheme.TextTheme.modalNormal, marginTop: 20, padding: 10 }}>
                    {invoiceText &&
                        'Amount: \n\n    ' + (Number(lightningPayReq.decode(invoiceText).millisatoshis) / 1000) + " Satoshi"}
                    {btcZarPrice && invoiceText && ('\n\n    (R' + (Number(lightningPayReq.decode(invoiceText).millisatoshis) / 100000000000 * btcZarPrice).toFixed(2) + ')')}
                </Text>
                {!startingNode && (
                    <TouchableOpacity
                        style={{ ...globalTheme.Buttons.primary, padding: 10, borderRadius: 20, width: 200, alignItems: 'center', justifyContent: 'center' }}
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
                {paymentStatusDesc && (
                    <Text style={{ color: '#fff', }}>{paymentStatusDesc}</Text>

                )}


                <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                        style={{ ...globalTheme.Buttons.primary, padding: 10, borderRadius: 20, width: 100, alignItems: 'center' }}
                        onPress={() => setShowLightningPayModal(false)}>
                        <Text style={{ color: '#fff' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PayWithBitcoinLightningModal;