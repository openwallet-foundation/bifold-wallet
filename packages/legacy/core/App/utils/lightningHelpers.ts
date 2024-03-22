import { EnvironmentType, NodeConfigVariant, PaymentStatus, connect, defaultConfig, mnemonicToSeed, nodeInfo, receiveOnchain, receivePayment, sendPayment } from "@breeztech/react-native-breez-sdk";
import { getItem, setItem } from "./storage";
import { generateMnemonic } from "@dreson4/react-native-quick-bip39";
import { t } from "i18next";
import * as lightningPayReq from 'bolt11';

const MNEMONIC_STORE = "MNEMONIC_SECURE_STORE"

export const initNodeAndSdk = async (eventHandler: any) => {
    try {
        // const apiKey = 'Yk2YFZixwFZai/af49/A/1W1jtPx28MV6IXH8DIzvG0=';
        const apiKey = '5481cee312d7c8fe3891bdff8953a1ce57f57790b73e0884a8bfc119f4399bba';
        // let mnemonic = await getItem(MNEMONIC_STORE)
        const inviteCode = '6FUD-Z8A9';

        // if (!mnemonic) {
        //     console.log("No mnemonic found, generating new one");
        //     mnemonic = generateMnemonic();
        //     console.log("Generated mnemonic: ", mnemonic);
        //     await setItem(MNEMONIC_STORE, mnemonic);
        // }
        // else {
        //     console.log("Mnemonic found: ", mnemonic);
        // }

        // const seed = await mnemonicToSeed(mnemonic);
        // TODO Elmer: Remove hardcoded seed
        const seed = await mnemonicToSeed('spring business health luggage word spin start column pipe giant pink spoon');
        console.log("Seed: ", seed);

        const keys = loadAndConvert();

        let nodeConfig
        // TODO Elmer: Figure out partner credentials
        // if (keys !== undefined && keys.deviceCert !== undefined && keys.deviceKey !== undefined) {
        //     const partneCreds = { deviceCert: keys.deviceCert, deviceKey: keys.deviceKey };
        //     nodeConfig = {
        //         type: NodeConfigVariant.GREENLIGHT,
        //         config: { partnerCredentials: partneCreds }
        //     };
        //     console.log("Going with partner credentials")
        // } else {
        nodeConfig = {
            type: NodeConfigVariant.GREENLIGHT,
            config: { inviteCode }
        };
        console.log("Going with invite code")
        // }

        const config = await defaultConfig(
            EnvironmentType.PRODUCTION,
            apiKey,
            nodeConfig
        );

        const eventSubscription = await connect(config, seed, eventHandler);
        console.log('Breez Initialized');
        return eventSubscription
    }
    catch (err: any) {
        console.error(err);
    }
}

function convertStringToByteArray(str: string) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes
}

const loadAndConvert = () => {
    try {
        // Read the certificate and key from files
        // const certContent = await readFile('../assets/res/client.crt', 'utf8');
        // const keyContent = await readFile('../assets/res/client-key.pem', 'utf8');

        // Convert PEM to byte array

        const deviceCert =
            convertStringToByteArray('-----BEGIN CERTIFICATE-----\
        MIICrzCCAlSgAwIBAgIUNFMoSTHXXkJ3ZoYXFjpJ5GG7VIswCgYIKoZIzj0EAwIw\
        gYMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1T\
        YW4gRnJhbmNpc2NvMRQwEgYDVQQKEwtCbG9ja3N0cmVhbTEdMBsGA1UECxMUQ2Vy\
        dGlmaWNhdGVBdXRob3JpdHkxEjAQBgNVBAMTCUdMIC91c2VyczAeFw0yNDAyMjkx\
        MTU5MDBaFw0zNDAyMjYxMTU5MDBaMIGoMQswCQYDVQQGEwJVUzETMBEGA1UECBMK\
        Q2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEUMBIGA1UEChMLQmxv\
        Y2tzdHJlYW0xHTAbBgNVBAsTFENlcnRpZmljYXRlQXV0aG9yaXR5MTcwNQYDVQQD\
        Ey5HTCAvdXNlcnMvYWM3ZDRjMjUtNTNiNS00ZWE0LTlhMGEtOGU5NGRjNGNmZTZj\
        MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEr5jR+En/xCOlcfTSc6IBb2Z0FP5A\
        gTLifJpgI3RRw7OMdxaFMiiFIM3ZfaQ7uDMQYoTeajhRSDxIgiU3AA4T/6N/MH0w\
        DgYDVR0PAQH/BAQDAgGmMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAM\
        BgNVHRMBAf8EAjAAMB0GA1UdDgQWBBQeMTv7ZLflWVgBRtsNcJxc+6nqazAfBgNV\
        HSMEGDAWgBRNDvcXUwxuk6LEG10+ig8mBsMllDAKBggqhkjOPQQDAgNJADBGAiEA\
        3+LLTj7FsoD68ULDFcwForQyrhndNt0MqBOdAluxpjACIQDmw4VTuHDe9V2gbZtE\
        YutbBEk0Z0/HTf71V/gDZU2j+g==\
        -----END CERTIFICATE-----\
        -----BEGIN CERTIFICATE-----\
        MIICijCCAjGgAwIBAgIUJ06syYB1TPRbSmTD4UCpT0PmA+UwCgYIKoZIzj0EAwIw\
        fjELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\
        biBGcmFuY2lzY28xFDASBgNVBAoTC0Jsb2Nrc3RyZWFtMR0wGwYDVQQLExRDZXJ0\
        aWZpY2F0ZUF1dGhvcml0eTENMAsGA1UEAxMER0wgLzAeFw0yMTA0MjYxNzE0MDBa\
        Fw0zMTA0MjQxNzE0MDBaMIGDMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZv\
        cm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEUMBIGA1UEChMLQmxvY2tzdHJl\
        YW0xHTAbBgNVBAsTFENlcnRpZmljYXRlQXV0aG9yaXR5MRIwEAYDVQQDEwlHTCAv\
        dXNlcnMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATWlNi+9P8ZdRfaP1VOOMb9\
        e+VSugDxwvN41ZTdq5aQ1yTXHx2fcMyowoDaSCBg44rzPJ/TDOrIH2WWWCaHmHgT\
        o4GGMIGDMA4GA1UdDwEB/wQEAwIBpjAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYB\
        BQUHAwIwEgYDVR0TAQH/BAgwBgEB/wIBAzAdBgNVHQ4EFgQUTQ73F1MMbpOixBtd\
        PooPJgbDJZQwHwYDVR0jBBgwFoAUzqFr6jvlx3blZtYapcZHVYpOKSMwCgYIKoZI\
        zj0EAwIDRwAwRAIgJvgJ8ehKx0VenMyUT/MRXlmClARc1Np39/Fbp4GIbd8CIGhk\
        MKVcDA5iuQZ7xhZU1S8POh1L9uT35UkE7+xmGNjr\
        -----END CERTIFICATE-----\
        ');
        const deviceKey =
            convertStringToByteArray(
                '-----BEGIN PRIVATE KEY-----\
            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgla0zarg8zKsqXC5h\
            br3B5imA2JJziD7zj6iYVQwsPLehRANCAASvmNH4Sf/EI6Vx9NJzogFvZnQU/kCB\
            MuJ8mmAjdFHDs4x3FoUyKIUgzdl9pDu4MxBihN5qOFFIPEiCJTcADhP/\
            -----END PRIVATE KEY-----'
            );

        // console.log(deviceCert);
        // console.log(deviceKey);

        return { deviceCert, deviceKey };

        // Now deviceCert and deviceKey are arrays of numbers
    } catch (error: any) {
        console.error('Error reading or converting files:', error);

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
            description: `Invoice for ${satsAmount} sats`
        })

        //addLog(receivePaymentResponse.lnInvoice);
        console.log('Invoice:', receivePaymentResponse.lnInvoice)
        return receivePaymentResponse.lnInvoice
    } catch (err: any) {
        console.error(err)
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
