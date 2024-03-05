import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert, Modal } from 'react-native';
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
    GreenlightNodeConfig,
    NodeConfig,
    Config,

} from "@breeztech/react-native-breez-sdk";
import { theme } from '../theme';
import QRCode from 'react-native-qrcode-svg';
import { generateMnemonic } from '@dreson4/react-native-quick-bip39'
import { getItem, removeItem, setItem } from '../utils/storage';
import { readFile } from 'react-native-fs';
import { Buffer } from 'buffer';
import { ScrollView } from 'react-native-gesture-handler';
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { set } from 'mockdate';

const LightningWallet = () => {
    //make a state varialbe to store the balance
    const [channelBalance, setChannelBalance] = useState(-1);
    const [chainBalance, setChainBalance] = useState(-1);
    const [depositInfo, setDepositInfo] = useState<SwapInfo | undefined>(undefined);
    const [invoice, setInvoice] = useState<LnInvoice | undefined>(undefined);
    const [scannedData, setScannedData] = useState<string | undefined>(undefined);
    const [scannerActive, setScannerActive] = useState(false);

    const MNEMONIC_STORE = "MNEMONIC_SECURE_STORE"

    const eventHandler = (breezEvent: any) => {
        console.log("event", JSON.stringify(breezEvent))
    }

    useEffect(() => {
        let eventSubscription
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

        const initNodeAndSdk = async () => {
            try {
                const apiKey = 'Yk2YFZixwFZai/af49/A/1W1jtPx28MV6IXH8DIzvG0=';
                let mnemonic = await getItem(MNEMONIC_STORE)
                const inviteCode = 'EXG4-SJP8';

                if (!mnemonic) {
                    console.log("No mnemonic found, generating new one");
                    mnemonic = generateMnemonic();
                    console.log("Generated mnemonic: ", mnemonic);
                    await setItem(MNEMONIC_STORE, mnemonic);
                }
                else {
                    console.log("Mnemonic found: ", mnemonic);
                }


                //const seed = await mnemonicToSeed(mnemonic);
                const seed = await mnemonicToSeed('embark category force toward husband snake rose result sugar select enrich trap');
                console.log("Seed: ", seed);

                const keys = loadAndConvert();

                let nodeConfig
                if (keys !== undefined && keys.deviceCert !== undefined && keys.deviceKey !== undefined) {
                    const partneCreds = { deviceCert: keys.deviceCert, deviceKey: keys.deviceKey };
                    nodeConfig = {
                        type: NodeConfigVariant.GREENLIGHT,
                        config: { partnerCredentials: partneCreds }
                    };
                    console.log("Going with partner credentials")
                } else {
                    nodeConfig = {
                        type: NodeConfigVariant.GREENLIGHT,
                        config: { inviteCode }
                    };
                    console.log("Going with invite code")
                }

                const config = await defaultConfig(
                    EnvironmentType.PRODUCTION,
                    apiKey,
                    nodeConfig
                );

                eventSubscription = await connect(config, seed, eventHandler);
            }
            catch (err) {
                console.error(err);
            }
        }

        // initializeSDK();
        initNodeAndSdk();
    }, []);

    const pemToByteArray = (pem: any) => {
        // Remove the PEM headers and footers
        const base64String = pem
            // .replace('-----BEGIN CERTIFICATE-----', '')
            // .replace('-----END CERTIFICATE-----', '')
            // .replace('-----BEGIN PRIVATE KEY-----', '')
            // .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s+/g, ''); // Remove whitespace

        // Decode base64 to binary string
        const binaryString = Buffer.from(base64String, 'base64').toString('binary');

        // Convert binary string to byte array
        const byteArray = Array.from(binaryString, (char) => char.charCodeAt(0));
        return byteArray;
    };

    const loadAndConvert = () => {
        try {
            // Read the certificate and key from files
            // const certContent = await readFile('../assets/res/client.crt', 'utf8');
            // const keyContent = await readFile('../assets/res/client-key.pem', 'utf8');

            // Convert PEM to byte array
            const deviceCert = undefined
            // pemToByteArray('-----BEGIN CERTIFICATE-----\
            // MIICrzCCAlSgAwIBAgIUNFMoSTHXXkJ3ZoYXFjpJ5GG7VIswCgYIKoZIzj0EAwIw\
            // gYMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\
            // YW4gRnJhbmNpc2NvMRQwEgYDVQQKEwtCbG9ja3N0cmVhbTEdMBsGA1UECxMUQ2Vy\
            // dGlmaWNhdGVBdXRob3JpdHkxEjAQBgNVBAMTCUdMIC91c2VyczAeFw0yNDAyMjkx\
            // MTU5MDBaFw0zNDAyMjYxMTU5MDBaMIGoMQswCQYDVQQGEwJVUzETMBEGA1UECBMK\
            // Q2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEUMBIGA1UEChMLQmxv\
            // Y2tzdHJlYW0xHTAbBgNVBAsTFENlcnRpZmljYXRlQXV0aG9yaXR5MTcwNQYDVQQD\
            // Ey5HTCAvdXNlcnMvYWM3ZDRjMjUtNTNiNS00ZWE0LTlhMGEtOGU5NGRjNGNmZTZj\
            // MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEr5jR+En/xCOlcfTSc6IBb2Z0FP5A\
            // gTLifJpgI3RRw7OMdxaFMiiFIM3ZfaQ7uDMQYoTeajhRSDxIgiU3AA4T/6N/MH0w\
            // DgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAM\
            // BgNVHRMBAf8EAjAAMB0GA1UdDgQWBBQeMTv7ZLflWVgBRtsNcJxc+6nqazAfBgNV\
            // HSMEGDAWgBRNDvcXUwxuk6LEG10+ig8mBsMllDAKBggqhkjOPQQDAgNJADBGAiEA\
            // 3+LLTj7FsoD68ULDFcwForQyrhndNt0MqBOdAluxpjACIQDmw4VTuHDe9V2gbZtE\
            // YutbBEk0Z0/HTf71V/gDZU2j+g==\
            // -----END CERTIFICATE-----\
            // -----BEGIN CERTIFICATE-----\
            // MIICijCCAjGgAwIBAgIUJ06syYB1TPRbSmTD4UCpT0PmA+UwCgYIKoZIzj0EAwIw\
            // fjELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\
            // biBGcmFuY2lzY28xFDASBgNVBAoTC0Jsb2Nrc3RyZWFtMR0wGwYDVQQLExRDZXJ0\
            // aWZpY2F0ZUF1dGhvcml0eTENMAsGA1UEAxMER0wgLzAeFw0yMTA0MjYxNzE0MDBa\
            // Fw0zMTA0MjQxNzE0MDBaMIGDMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZv\
            // cm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEUMBIGA1UEChMLQmxvY2tzdHJl\
            // YW0xHTAbBgNVBAsTFENlcnRpZmljYXRlQXV0aG9yaXR5MRIwEAYDVQQDEwlHTCAv\
            // dXNlcnMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATWlNi+9P8ZdRfaP1VOOMb9\
            // e+VSugDxwvN41ZTdq5aQ1yTXHx2fcMyowoDaSCBg44rzPJ/TDOrIH2WWWCaHmHgT\
            // o4GGMIGDMA4GA1UdDwEB/wQEAwIBpjAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYB\
            // BQUHAwIwEgYDVR0TAQH/BAgwBgEB/wIBAzAdBgNVHQ4EFgQUTQ73F1MMbpOixBtd\
            // PooPJgbDJZQwHwYDVR0jBBgwFoAUzqFr6jvlx3blZtYapcZHVYpOKSMwCgYIKoZI\
            // zj0EAwIDRwAwRAIgJvgJ8ehKx0VenMyUT/MRXlmClARc1Np39/Fbp4GIbd8CIGhk\
            // MKVcDA5iuQZ7xhZU1S8POh1L9uT35UkE7+xmGNjr \
            // -----END CERTIFICATE-----\
            // ');
            const deviceKey = undefined
            // pemToByteArray(
            //     '-----BEGIN PRIVATE KEY-----\
            //     MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgla0zarg8zKsqXC5h\
            //     br3B5imA2JJziD7zj6iYVQwsPLehRANCAASvmNH4Sf/EI6Vx9NJzogFvZnQU/kCB\
            //     MuJ8mmAjdFHDs4x3FoUyKIUgzdl9pDu4MxBihN5qOFFIPEiCJTcADhP/\
            //     -----END PRIVATE KEY-----'
            // );

            console.log(deviceCert);
            console.log(deviceKey);

            return { deviceCert, deviceKey };

            // Now deviceCert and deviceKey are arrays of numbers
        } catch (error) {
            console.error('Error reading or converting files:', error);
        }
    };

    const removeMnemonic = async () => {
        try {
            await removeItem(MNEMONIC_STORE);
        } catch (err) {
            console.error(err);
        }
    }

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

    const payInvoice = async () => {
        try {
            const bolt11 = scannedData
            // The `amountMsat` param is optional and should only passed if the bolt11 doesn't specify an amount.
            // The amountMsat is required in case an amount is not specified in the bolt11 invoice'.
            // const amountMsat = 3000000
            if (bolt11 !== undefined) {
                const response = await sendPayment({ bolt11 })
                console.log('Payment response:', response)
            } else {
                console.log('No invoice to pay')
            }
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
        <ScrollView>
            <View style={styles.textPadding}>
                <Text style={theme.TextTheme.headerTitle}>Lightning tests</Text>
            </View>

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={() => { setScannerActive(true) }}>
                    <Text style={theme.TextTheme.label}>Scan Invoice</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true} // Set to true to allow custom styling to be visible
                visible={scannerActive}
                onRequestClose={() => {
                    setScannerActive(!scannerActive);
                }}
            >
                {/* Wrap the content in a View with a style that sets the background color */}
                <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                    <QRCodeScanner
                        onRead={({ data }) => { setScannedData(data); setScannerActive(false); }}
                        reactivate={true}
                        reactivateTimeout={3000}
                        showMarker={true}
                        topContent={
                            <Text style={{ ...theme.TextTheme.label, color: 'white' }}>Scan an Invoice</Text> // Adjust text color as needed
                        }
                        bottomContent={
                            <TouchableOpacity style={{ ...theme.Buttons.primary, marginTop: 20 }} onPress={() => setScannerActive(false)}>
                                <Text style={theme.TextTheme.label}>Close Scanner</Text>
                            </TouchableOpacity>
                        }
                        cameraStyle={{ height: 370, width: 290, alignSelf: 'center', marginTop: 20, borderRadius: 10, overflow: 'hidden', position: 'relative' }}
                    />
                </View>
            </Modal>


            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={payInvoice}>
                    <Text style={theme.TextTheme.label}>Pay Invoice ({scannedData})</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={loadAndConvert}>
                    <Text style={theme.TextTheme.label}>Process Keys</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonPadding}>
                <TouchableOpacity style={theme.Buttons.primary} onPress={removeMnemonic}>
                    <Text style={theme.TextTheme.label}>Remove Mnemonic</Text>
                </TouchableOpacity>
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

        </ScrollView>
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
