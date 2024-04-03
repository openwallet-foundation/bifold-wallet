import Config from "react-native-config";

const connectionApiUrl = Config.CONNECTION_API_URL

export const getConnectionRequests = async (id: string) => {
    try {
        const response = await fetch(connectionApiUrl + '/connection-requests/search?respondentId=' + id);
        if (!response.ok) {
            return "Error fetching connections"
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching connections:', error);
        return "Error fetching connections"
    }
}

export const acceptConnectionRequest = async (id: string) => {
    try {
        const response = await fetch(connectionApiUrl + '/connection-requests/' + id + '/accept', {
            method: 'POST',
            body: JSON.stringify({
                connectionDetails: "Connection accepted",
                connectionExpiryAt: "2024-04-03T13:59:16.196Z"
            }),
        });
        if (!response.ok) {
            console.log(response);
            return "Error accepting invite"
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error accepting connection:', error);
        return "Error accepting invite"
    }
}

export const rejectConnectionRequest = async (id: string) => {
    try {
        const response = await fetch(connectionApiUrl + '/connection-requests/' + id + '/reject', {
            method: 'POST',
            body: JSON.stringify({
                connectionDetails: "Invititation Declined",
                connectionExpiryAt: "2024-04-03T13:59:16.196Z"
            }),
        });
        if (!response.ok) {
            console.log(response);
            return "Error rejecting invite"
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error rejecting connection:', error);
        return "Error rejecting invite"
    }
}

export const sendConnectionInvite = async (walletName: string, identifier: string, didcommInvitation: string) => {
    try {
        const response = await fetch(connectionApiUrl + '/connection-requests', {
            method: 'POST',
            body: JSON.stringify({
                requesterId: "test",
                proxyKey: identifier,
                proxyTypeId: "1",
                externalId: "wallet-1",
                requesterInfo: {
                    name: walletName
                },
                connectionDetails: {
                    _type: "DIDComm",
                    link: didcommInvitation
                }
            }),
        });
        if (!response.ok) {
            console.log(response);
            return "Error sending invite"
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error sending connection:', error);
        return "Error sending invite"
    }
}