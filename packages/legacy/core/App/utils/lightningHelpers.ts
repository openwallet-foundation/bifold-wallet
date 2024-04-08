import { EnvironmentType, NodeConfigVariant, PaymentStatus, connect, defaultConfig, mnemonicToSeed, nodeInfo, receiveOnchain, receivePayment, sendPayment, paymentByHash, sendSpontaneousPayment } from "@breeztech/react-native-breez-sdk";
import { getItem, setItem } from "./storage";
import { generateMnemonic } from "@dreson4/react-native-quick-bip39";
import { t } from "i18next";
import * as lightningPayReq from 'bolt11';

const MNEMONIC_STORE = "MNEMONIC_SECURE_STORE"

export const initNodeAndSdk = async (eventHandler: any) => {
    try {
        const useInviteCode = true;

        let seed = <any>[];
        let nodeConfig
        const apiKey = '5481cee312d7c8fe3891bdff8953a1ce57f57790b73e0884a8bfc119f4399bba';

        // const apiKey = 'Yk2YFZixwFZai/af49/A/1W1jtPx28MV6IXH8DIzvG0=';
        if (useInviteCode) {

            // Physical phone invite code
            // const inviteCode = '6FUD-Z8A9';

            // Emulator invite code
            const inviteCode = 'XLT3-8WFJ';

            // Physical phone seed
            // seed = await mnemonicToSeed('spring business health luggage word spin start column pipe giant pink spoon');

            // Emulator seed
            seed = await mnemonicToSeed('large artefact physical panel shed movie inhale sausage sense bundle depart ribbon');

            nodeConfig = {
                type: NodeConfigVariant.GREENLIGHT,
                config: { inviteCode }
            };
            console.log("Using invite code")
        } else {
            let mnemonic = undefined //await getItem(MNEMONIC_STORE)
            if (!mnemonic) {
                console.log("No mnemonic found, generating new one");
                mnemonic = generateMnemonic();
                console.log("Generated mnemonic: ", mnemonic);
                await setItem(MNEMONIC_STORE, mnemonic);
            }
            else {
                console.log("Mnemonic found: ", mnemonic);
            }

            seed = await mnemonicToSeed(mnemonic);
            const keys = convertCerts();

            // TODO Elmer: Figure out partner credentials
            if (keys !== undefined && keys.deviceCert !== undefined && keys.deviceKey !== undefined) {
                const partnerCreds = { deviceCert: keys.deviceCert, deviceKey: keys.deviceKey };
                nodeConfig = {
                    type: NodeConfigVariant.GREENLIGHT,
                    config: { partnerCredentials: partnerCreds }
                };
                console.log("Going with partner credentials")
            }
        }

        console.log("Seed: ", seed);

        if (nodeConfig) {
            const config = await defaultConfig(
                EnvironmentType.PRODUCTION,
                apiKey,
                nodeConfig
            );
            const eventSubscription = await connect(config, seed, eventHandler);
            console.log('Breez Initialized');
            return eventSubscription
        }
        else {
            console.error("No node config found")
        }
    }
    catch (err: any) {
        const errorString = JSON.stringify(err)

        if (errorString.includes("already initialized")) {
            console.log("Breez already initialized.")
            return undefined
        }

        console.error(err);
        return JSON.stringify(err)
    }
}

function convertStringToByteArray(str: string) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes
}

const convertCerts = () => {
    try {
        const deviceCert =
            convertStringToByteArray('-----BEGIN CERTIFICATE-----MIICrzCCAlSgAwIBAgIUNFMoSTHXXkJ3ZoYXFjpJ5GG7VIswCgYIKoZIzj0EAwIwgYMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRQwEgYDVQQKEwtCbG9ja3N0cmVhbTEdMBsGA1UECxMUQ2VydGlmaWNhdGVBdXRob3JpdHkxEjAQBgNVBAMTCUdMIC91c2VyczAeFw0yNDAyMjkxMTU5MDBaFw0zNDAyMjYxMTU5MDBaMIGoMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEUMBIGA1UEChMLQmxvY2tzdHJlYW0xHTAbBgNVBAsTFENlcnRpZmljYXRlQXV0aG9yaXR5MTcwNQYDVQQDEy5HTCAvdXNlcnMvYWM3ZDRjMjUtNTNiNS00ZWE0LTlhMGEtOGU5NGRjNGNmZTZjMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEr5jR+En/xCOlcfTSc6IBb2Z0FP5AgTLifJpgI3RRw7OMdxaFMiiFIM3ZfaQ7uDMQYoTeajhRSDxIgiU3AA4T/6N/MH0wDgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBQeMTv7ZLflWVgBRtsNcJxc+6nqazAfBgNVHSMEGDAWgBRNDvcXUwxuk6LEG10+ig8mBsMllDAKBggqhkjOPQQDAgNJADBGAiEA3+LLTj7FsoD68ULDFcwForQyrhndNt0MqBOdAluxpjACIQDmw4VTuHDe9V2gbZtEYutbBEk0Z0/HTf71V/gDZU2j+g==-----END CERTIFICATE----------BEGIN CERTIFICATE-----MIICijCCAjGgAwIBAgIUJ06syYB1TPRbSmTD4UCpT0PmA+UwCgYIKoZIzj0EAwIwfjELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBGcmFuY2lzY28xFDASBgNVBAoTC0Jsb2Nrc3RyZWFtMR0wGwYDVQQLExRDZXJ0aWZpY2F0ZUF1dGhvcml0eTENMAsGA1UEAxMER0wgLzAeFw0yMTA0MjYxNzE0MDBaFw0zMTA0MjQxNzE0MDBaMIGDMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEUMBIGA1UEChMLQmxvY2tzdHJlYW0xHTAbBgNVBAsTFENlcnRpZmljYXRlQXV0aG9yaXR5MRIwEAYDVQQDEwlHTCAvdXNlcnMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATWlNi+9P8ZdRfaP1VOOMb9e+VSugDxwvN41ZTdq5aQ1yTXHx2fcMyowoDaSCBg44rzPJ/TDOrIH2WWWCaHmHgTo4GGMIGDMA4GA1UdDwEB/wQEAwIBpjAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwEgYDVR0TAQH/BAgwBgEB/wIBAzAdBgNVHQ4EFgQUTQ73F1MMbpOixBtdPooPJgbDJZQwHwYDVR0jBBgwFoAUzqFr6jvlx3blZtYapcZHVYpOKSMwCgYIKoZIzj0EAwIDRwAwRAIgJvgJ8ehKx0VenMyUT/MRXlmClARc1Np39/Fbp4GIbd8CIGhkMKVcDA5iuQZ7xhZU1S8POh1L9uT35UkE7+xmGNjr-----END CERTIFICATE-----');
        const deviceKey =
            convertStringToByteArray('-----BEGIN PRIVATE KEY-----MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgla0zarg8zKsqXC5hbr3B5imA2JJziD7zj6iYVQwsPLehRANCAASvmNH4Sf/EI6Vx9NJzogFvZnQU/kCBMuJ8mmAjdFHDs4x3FoUyKIUgzdl9pDu4MxBihN5qOFFIPEiCJTcADhP/-----END PRIVATE KEY-----');

        return { deviceCert, deviceKey };

    } catch (error: any) {
        console.error('Error converting certificates:', error);
    }
};

export const getBalances = async () => {
    try {
        const nodeStateRes = await nodeInfo();
        console.log("Node state response: ", nodeStateRes);
        const channelBalance = nodeStateRes?.channelsBalanceMsat;
        console.log("Channel balance: ", channelBalance);
        const chainBalance = nodeStateRes?.onchainBalanceMsat;
        console.log("Chain balance: ", chainBalance);
        // addLog({ channelBalance, chainBalance });

        return { channelBalance, chainBalance }
    } catch (err: any) {
        console.error(err);
        return err.message
        // addLog(err.message);
    }
}

export const getNodeId = async () => {
    try {
        const nodeStateRes = await nodeInfo();
        console.log("Node state response: ", nodeStateRes);
        const nodeId = nodeStateRes?.id;
        console.log("Node ID: ", nodeId);

        return nodeId
    } catch (err: any) {
        console.error(err);
        return undefined
    }
}

export const getBTCDepositInfo = async () => {
    try {
        const swapInfo = await receiveOnchain({});
        console.log("Deposit info: ", swapInfo);
        // addLog(swapInfo.bitcoinAddress);
        return { swapInfo }
    } catch (err: any) {
        console.error(err);
        return err.message
        // addLog(err.message);
    }
}

export const getInvoice = async (satsAmount: string) => {
    try {
        const receivePaymentResponse = await receivePayment({
            amountMsat: Number(satsAmount) * 1000,
            description: `Invoice for ${satsAmount} sats`,
        })

        //addLog(receivePaymentResponse.lnInvoice);
        console.log('Invoice:', receivePaymentResponse.lnInvoice)
        return receivePaymentResponse.lnInvoice
    } catch (err: any) {
        console.error(err)
        return "An error occurred while generating the invoice"
        // addLog(err.message);
    }
}

export const payInvoice = async (scannedData: any) => {
    try {
        const bolt11 = scannedData
        // The `amountMsat` param is optional and should only passed if the bolt11 doesn't specify an amount.
        // The amountMsat is required in case an amount is not specified in the bolt11 invoice'.
        // const amountMsat = 3000000
        if (bolt11 !== undefined) {

            const response = await sendPayment({ bolt11 })

            console.log('Payment response:', response)

            return response
        } else {
            console.log('No invoice to pay')
            return 'No invoice to pay'
        }
    } catch (err: any) {
        console.error(err)
        return err.message
    }
}

export const checkStatus = async (hash: string) => {
    try {
        console.log('Checking payment status for hash:', hash)
        const paymentInfo = await paymentByHash(hash)

        console.log('Status:', paymentInfo)

        if (paymentInfo?.status === PaymentStatus.COMPLETE) {
            console.log('Payment Completed');
            return 'Payment Completed';
        }
        else if (paymentInfo?.status === PaymentStatus.FAILED) {
            console.log('Payment failed');
            return ('Payment Failed');
        }
        else if (paymentInfo?.status === PaymentStatus.PENDING) {
            console.log('Payment pending');
            return ('Payment Pending');
        }
        else if (paymentInfo === null) {
            console.log(paymentInfo);

            return ('Payment not Completed');
        }
        else {
            console.log(paymentInfo);
            return ('Payment status unknown');
        }
    }
    catch (err: any) {
        console.error("Error checking payment status:", err)
        console.error(err)
        return String(err.message)
    }
}

export const payInvoiceWithAmount = async (scannedData: any, amount: number) => {

    try {
        const bolt11 = scannedData
        // The `amountMsat` param is optional and should only passed if the bolt11 doesn't specify an amount.
        // The amountMsat is required in case an amount is not specified in the bolt11 invoice'.
        const amountMsat = amount * 1000
        if (bolt11 !== undefined && amountMsat !== undefined) {

            const response = await sendPayment({ bolt11, amountMsat })

            console.log('Payment response:', response)

            return response
        } else {
            console.log('No invoice to pay')
            return 'No invoice to pay'
        }
    } catch (err: any) {
        console.error(err)
        return "Error paying invoice"
    }
}

export const sendSpontaneousPaymentToNode = async (nodeId: string, amount: number) => {
    try {
        const response = await sendSpontaneousPayment({ nodeId, amountMsat: amount * 1000 })

        console.log('Spontaneous payment response:', response)

        return response
    } catch (err: any) {
        console.error(err)
        return err.message
    }
}

export const getBTCPrice = async () => {
    try {
        let btcZarPrice = 0;
        await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=zar')
            .then(response => response.json())
            .then(data => { console.log(data.bitcoin.zar); btcZarPrice = data.bitcoin.zar })
            .catch(error => console.error('Error:', error));

        return btcZarPrice
    } catch (error) {
        console.error('Error fetching btc price:', error);
    }
}

export const getLInvoiceZarAmount = async (lightningInvoice: string) => {
    const btcZarPrice = await getBTCPrice();

    try {
        if (btcZarPrice !== undefined) {
            return (Number(lightningPayReq.decode(lightningInvoice).millisatoshis) / 100000000000 * btcZarPrice).toFixed(2)
        }
        else {
            return undefined
        }
    } catch (error) {
        console.error('Error getting invoice amount:', error);
    }

}

export const getBTCToZarAmount = async (satoshis: number) => {
    const btcZarPrice = await getBTCPrice();

    try {
        if (btcZarPrice !== undefined) {
            return (satoshis / 100000000 * btcZarPrice).toFixed(2)
        }
        else {
            return undefined
        }
    } catch (error) {
        console.error('Error getting zar amount:', error);
    }

}
