# Using OOB Invitations with the Bifold Wallet

Some mediators, such as [DIDComm-mediator-credo](https://github.com/openwallet-foundation/didcomm-mediator-credo), use Out-of-Band (OOB) invitations to establish connections between agents. Bifold won't work with these mediators out of the box, but you can set up mediation manually to make it work.

## Setup

### 1. Remove the Legacy Configuration

Bifold's legacy method of providing a mediator URL through agent configuration options does not support Out-of-Band (OOB) invitations. To use OOB invitations, you need to set up the agent to accept mediation differently.

First, comment out the current mediator URL from the agent initialization options:

```typescript
// mediatorInvitationUrl: Config.MEDIATOR_URL,
```

Pro-tip 🤓: You still need to add your new invitation to your `.env` file. It will be used in the sample code below.

### 2. Find Your Mediator's `invitationId`

For the following steps to work, you'll need the `invitationId` of your mediator. Here's how to find it:

1. Copy the payload from your mediator URL (everything after `oob=` in the query string of the invitation URL).
2. Decode the payload since it's in base64 format. On macOS, use this command:

```bash
pbpaste | base64 -d
```

This will output a JSON object similar to this:

```json
{
  "@type": "https://didcomm.org/out-of-band/1.1/invitation",
  "@id": "2c6dcc2e-b44d-53fe-a135-7decc90a85af",
  "label": "My Mediator",
  "accept": ["didcomm/aip1", "didcomm/aip2;env=rfc19"],
  "handshake_protocols": ["https://didcomm.org/didexchange/1.1", "https://didcomm.org/connections/1.0"],
  "services": [
    {
      "id": "#inline-0",
      "serviceEndpoint": "https://mediator.thelobby.ca",
      "type": "did-communication",
      "recipientKeys": ["did:key:z3mKgfDM1vsn2c4ELQACePywT6fpXd2YUooMsvQxBy8nwdvd"],
      "routingKeys": []
    },
    {
      "id": "#inline-1",
      "serviceEndpoint": "wss://mediator.thelobby.ca",
      "type": "did-communication",
      "recipientKeys": ["did:key:z3mKgfDM1vsn2c4ELQACePywT6fpXd2YUooMsvQxBy8nwdvd"],
      "routingKeys": []
    }
  ]
}
```

Copy the `@id` value and use it in the next step.

### 3. Manually Set Up Mediation

Next, add a function to `initialize-agent.ts` to set up mediation using the OOB invitation. This function checks for an existing connection to the mediator and reuses it if available. Otherwise, it creates a new connection.

**Note:** Ideally, the invitation should be looked up by DID, which may be more useful in production deployments. Below is a function that uses the `invitationId`:

```typescript
const startMediation = useCallback(async (agent: Agent) => {
  const invite = await agent.oob.parseInvitation(Config.MEDIATOR_URL!)
  const outOfBandRecord = await agent.oob.findByReceivedInvitationId(invite.id)

  let [connection] = outOfBandRecord ? await agent.connections.findAllByOutOfBandId(outOfBandRecord.id) : []

  if (!connection) {
    agent.config.logger.debug('Mediation connection does not exist, creating connection')

    const invite = await agent.oob.parseInvitation(Config.MEDIATOR_URL!)
    const { connectionRecord: newConnection } = await agent.oob.receiveInvitation(invite)

    if (!newConnection) {
      console.log('No connection record to provision mediation.')
      return
    }

    connection = newConnection
  }

  const readyConnection = connection.isReady ? connection : await agent.connections.returnWhenIsConnected(connection.id)

  return agent.mediationRecipient.provision(readyConnection)
}, [])
```

### 4. Call the Mediation Function

Finally, call the `startMediation` function **after** initializing the mediator in `Splash.tsx`:

```typescript
await newAgent.initialize()
await startMediation(newAgent)
newAgent.mediationRecipient.initiateMessagePickup()
```

### Summary

By following these steps, you ensure that your agent properly accepts mediation using an Out-of-Band invitation, bypassing the legacy mediator URL configuration. Let us know if you run into any issues! 😊
