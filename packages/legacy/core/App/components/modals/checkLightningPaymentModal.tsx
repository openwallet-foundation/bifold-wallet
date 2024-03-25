import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme as globalTheme } from '../../theme';
import * as lightningPayReq from 'bolt11';
import { initNodeAndSdk } from '../../utils/lightningHelpers';


interface CheckLightningTransactionModalProps {
    showTransactionStatusModal: boolean;
    setShowTransactionStatusModal: (show: boolean) => void;
    invoiceText?: string | undefined;
    btcZarPrice?: number;
    startingNode?: boolean;
    paymentInProgress: boolean;
    statusCheckHandler: (invoiceText?: string | undefined) => void;
    checkStatusDesc?: string;
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
    eventHandler
}) => {

    const [nodeAndSdkInitialized, setNodeAndSdkInitialized] = React.useState(false);

    useEffect(() => {

        setNodeAndSdkInitialized(false);
        initNodeAndSdk(eventHandler).then((res) => {
            setNodeAndSdkInitialized(true);
        })

    }, [])

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showLightningPayModal}
            onRequestClose={() => setShowLightningPayModal(false)}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.87)', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Check Payment Status</Text>

                {/* Show if node is busy initializing */}
                {!nodeAndSdkInitialized && (
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
                {checkStatusDesc && (
                    <Text style={{ color: '#fff', }}>{checkStatusDesc}</Text>

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

export default CheckLightningTransactionModal;