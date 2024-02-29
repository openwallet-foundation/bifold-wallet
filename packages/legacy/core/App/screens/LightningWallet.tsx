import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import {
    BreezEvent,
    defaultConfig,
    EnvironmentType,
    NodeConfigVariant,
    sendPayment,
    connect,
    mnemonicToSeed,
    nodeInfo,
    receiveOnchain,
    SwapInfo,
    receivePayment,
    LnInvoice,
} from "@breeztech/react-native-breez-sdk";
import { theme } from '../theme';
import QRCode from 'react-native-qrcode-svg';

const LightningWallet = () => {
    //make a state varialbe to store the balance
    const [channelBalance, setChannelBalance] = useState(-1);
    const [chainBalance, setChainBalance] = useState(-1);
    const [depositInfo, setDepositInfo] = useState<SwapInfo | undefined>(undefined);
    const [invoice, setInvoice] = useState<LnInvoice | undefined>(undefined);


    useEffect(() => {
        const initializeSDK = async () => {
            // SDK events listener
            const onBreezEvent = (e: any) => {
                console.log(`Received event ${e.type}`);
            };

            try {
                // Assuming mnemonicToSeed, defaultConfig, connect and other necessary methods are imported
                // Create the default config
                const seed = await mnemonicToSeed('embark category force toward husband snake rose result sugar select enrich trap');
                const inviteCode = 'EXG4-SJP8';
                const apiKey = 'Yk2YFZixwFZai/af49/A/1W1jtPx28MV6IXH8DIzvG0=';

                const nodeConfig = {
                    type: NodeConfigVariant.GREENLIGHT,
                    config: {
                        inviteCode,
                    },
                };

                const config = await defaultConfig(
                    EnvironmentType.PRODUCTION,
                    apiKey,
                    nodeConfig
                );

                // Connect to the Breez SDK make it ready for use
                await connect(config, seed, onBreezEvent);
                console.log('Connected to Breez');
                let balances = await getBalances();

            } catch (err) {
                console.error(err);
            }
        };

        initializeSDK();
    }, []);

    // make async function here
    const getBalances = async () => {
        try {
            const nodeStateRes = await nodeInfo();
            console.log("Node state response: ", nodeStateRes);
            const channelBalance = nodeStateRes?.channelsBalanceMsat;
            console.log("Channel balance: ", channelBalance);
            const chainBalance = nodeStateRes?.onchainBalanceMsat;
            console.log("Chain balance: ", chainBalance);
            return { channelBalance, chainBalance }
        } catch (err) {
            console.error(err);
        }
    }

    const getBTCDepositInfo = async () => {
        try {
            const swapInfo = await receiveOnchain({});
            console.log("Deposit info: ", swapInfo);
            return { swapInfo }
        } catch (err) {
            console.error(err);
        }
    }

    const getInvoice = async () => {
        try {
            const receivePaymentResponse = await receivePayment({
                amountMsat: 1_000_000,
                description: 'Invoice for 1000 sats'
            })

            return receivePaymentResponse.lnInvoice
        } catch (err) {
            console.error(err)
        }
    }

    const handleGetInvoiceButtonPress = async () => {
        const invoice = await getInvoice();

        setInvoice(invoice);
    }

    const handleGetBalancesButtonPress = async () => {
        const balances = await getBalances();

        setChannelBalance(balances?.channelBalance ?? 0);
        setChainBalance(balances?.chainBalance ?? 0);
    }

    const handleGetDepositButtonPress = async () => {
        const depositInfo = await getBTCDepositInfo();

        setDepositInfo(depositInfo?.swapInfo ?? undefined);
    }

    return (
        <View>
            <View style={styles.textPadding}>
                <Text style={theme.TextTheme.headerTitle}>Lightning tests</Text>
            </View>

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={handleGetBalancesButtonPress}>
                    <Text style={theme.TextTheme.label}>Get Balances</Text>
                </TouchableOpacity>
            </View>

            {channelBalance !== -1 && chainBalance !== -1 && (
                <View style={styles.textPadding}>
                    <Text style={theme.TextTheme.label}>Channel balance: {channelBalance} MSats</Text>
                    <Text style={theme.TextTheme.label}>Chain balance: {chainBalance} MSats</Text>
                </View>
            )}

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={handleGetInvoiceButtonPress}>
                    <Text style={theme.TextTheme.label}>Invoice for 1000 sats</Text>
                </TouchableOpacity>
            </View>

            {invoice !== undefined && (
                <View style={styles.center}>
                    <QRCode
                        value={invoice.bolt11}
                        size={200}
                    />
                </View>
            )}

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={handleGetDepositButtonPress}>
                    <Text style={theme.TextTheme.label}>Show BTC Deposit Address</Text>
                </TouchableOpacity>
            </View>

            {depositInfo !== undefined && (
                <View style={styles.textPadding}>
                    <Text style={theme.TextTheme.label}>Deposit Address: {depositInfo.bitcoinAddress}</Text>
                    <Text style={theme.TextTheme.label}>Minimum Deposit: {depositInfo.minAllowedDeposit} MSats</Text>
                    <Text style={theme.TextTheme.label}>Maximum Deposit: {depositInfo.maxAllowedDeposit} MSats</Text>
                </View>
            )}

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
        paddingLeft: 15,
    },
    center: {

        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default LightningWallet;
