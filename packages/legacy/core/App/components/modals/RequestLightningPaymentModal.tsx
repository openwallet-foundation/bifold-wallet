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
    invoiceGenLoading: boolean;
    handleGetInvoiceButtonPress: () => void;
    paymentStatusDesc?: string;
    startingNode?: boolean; // Assuming startingNode might be a prop as well
    eventHandler: any;
}

const RequestPaymentModal: React.FC<RequestPaymentModalProps> = ({
    showRequestLightningPaymentModal,
    setShowRequestLightningPaymentModal,
    satsAmount,
    setSatsAmount,
    invoiceGenLoading,
    handleGetInvoiceButtonPress,
    paymentStatusDesc,
    startingNode,
    eventHandler,
}) => {
    const [nodeAndSdkInitialized, setNodeAndSdkInitialized] = React.useState(false);

    React.useEffect(() => {

        setNodeAndSdkInitialized(false);
        initNodeAndSdk(eventHandler).then((res) => {
            setNodeAndSdkInitialized(true);
        })

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
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.87)', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...globalTheme.TextTheme.headerTitle, marginTop: 20 }}>Request Payment</Text>

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
                        </View>
                        <TouchableOpacity
                            style={{ ...globalTheme.Buttons.primary, padding: 10, borderRadius: 20, width: 230, alignItems: 'center', justifyContent: 'center' }}
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
                {paymentStatusDesc && <Text style={{ color: '#fff' }}>{paymentStatusDesc}</Text>}

                {/* Close Button at the bottom */}
                <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
                    <TouchableOpacity
                        style={{ ...globalTheme.Buttons.primary, padding: 10, borderRadius: 20, width: 100, alignItems: 'center' }}
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
