# Using OOB Invitations with the Bifold Wallet

Out of the box Bifold's legacy mechanism for providing a mediator URL via the agent configuraiton options does not work with Out of Bounts (OOB) invitations. To use them, you need to have the Agent accept the mediator a little differently.

## Setup

1. Remove the Legacy Configuration
   Comment out the current mediator URL from the Agent initalization options:

```json
   // mediatorInvitationUrl: Config.MEDIATOR_URL,
```

3. For the sample code below to work, you will need to find the `invitationId` of your mediator:

To find your `invitationId` copy the payload of your mediator URL (everything after the `oob=` in the query string of the invitation url) and decode it because it's in base64. Here are sample instrucitons for macOS

- Copy the string to your clibparod (command-C). Then run the following commandd:

```bash!
pbpase|base64 -d
```

This will produce some JSON output similar to below:

```json
{
  "@type": "https://didcomm.org/out-of-band/1.1/invitation",
  "@id": "2c6dcc2e-b44d-53fe-a135-7decc90a85af",
  "label": "My Mediator",
  "accept": [
    "didcomm/aip1",
    "didcomm/aip2;env=rfc19"
  ],
  "handshake_protocols": [
    "https://didcomm.org/didexchange/1.1",
    "https://didcomm.org/connections/1.0"
  ],
  "services": [
    {
      "id": "#inline-0",
      "serviceEndpoint": "https://mediator.thelobby.ca",
      "type": "did-communication",
      "recipientKeys": [
        "did:key:z3mKgfDM1vsn2c4ELQACePywT6fpXd2YUooMsvQxBy8nwdvd"
      ],
      "routingKeys": []
    },
    {
      "id": "#inline-1",
      "serviceEndpoint": "wss://mediator.thelobby.ca",
      "type": "did-communication",
      "recipientKeys": [
        "did:key:z3mKgfDM1vsn2c4ELQACePywT6fpXd2YUooMsvQxBy8nwdvd"
      ],
      "routingKeys": []
    }

```

Copy the `@id` field and use it in the sample function for step 2 below.

2. Manually Setup Mediation

Add a function to `initalize-agent.ts` that will initalize the agent with the OOB invitation. The main functionality is to look for an existing connection to the mediator and use it if it exists, otherwise create a new conneciton using the OOB invitation.

TODO: We should be able to lookup the invitation by DID. Not sure how usefull this is for development purposes, but it's probabl a better solution for produciton deployments. Below is a sample funciton that uses the invitation ID.

```typescript!
  const startMediation = useCallback(async (agent: Agent) => {
    const invitationId = '2c6dcc2e-b44d-53fe-a135-7decc90a85af'
    const outOfBandRecord = await agent.oob.findByReceivedInvitationId(invitationId)

    let [connection] = outOfBandRecord ? await agent.connections.findAllByOutOfBandId(outOfBandRecord.id) : []

    if (!connection) {
      agent.config.logger.debug('Mediation connection does not exist, creating connection')
      // We don't want to use the current default mediator when connecting to
      // another mediator.
      // const routing = await agent.mediationRecipient.getRouting({ useDefaultMediator: false })

      const invite = await agent.oob.parseInvitation(Config.MEDIATOR_URL!)
      const { connectionRecord: newConnection } = await agent.oob.receiveInvitation(invite)

      if (!newConnection) {
        console.log('No connection record to provision mediation.')
        // throw new CredoError('No connection record to provision mediation.')
      }

      connection = newConnection!
    }

    const readyConnection = connection.isReady
      ? connection
      : await agent.connections.returnWhenIsConnected(connection.id)

    return agent.mediationRecipient.provision(readyConnection)
  }, [])

```

3. Add the Function Call

Call the `startMediation` funciton **after** the mediator is initalized in `Splash.tsx`:

```typescript
await newAgent.initialize()

await startMediation(newAgent)

newAgent.mediationRecipient.initiateMessagePickup()
```
