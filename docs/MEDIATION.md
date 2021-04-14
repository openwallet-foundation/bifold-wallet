# Mediation

The mobile agent relies on an external mediator to receive messages. You can start a sample mediator from the Aries Framework JavaScript repo. Run the following to start two sample mediators:

```sh
git clone https://github.com/hyperledger/aries-framework-javascript.git
cd aries-framework-javascript

docker-compose -f docker/docker-compose-mediators.yml -f docker/docker-compose-mediators-ngrok.yml up
```

The logs will output the public ngrok URL the mediator is exposed at. Copy the `"url"` value from the output (either alice or bob) to use in the .env, it should look something like `https://90eab166f78c.ngrok.io`:

```
alice-mediator_1  | 2020-12-07T09:27:09.786Z aries-framework-javascript ---------- Creating agent with config ----------
alice-mediator_1  |  {
alice-mediator_1  |   "url": "https://90eab166f78c.ngrok.io",
alice-mediator_1  |   "port": "3001",
alice-mediator_1  |   "label": "RoutingMediator01",
alice-mediator_1  |   "walletConfig": {
alice-mediator_1  |     "id": "mediator01"
alice-mediator_1  |   },
alice-mediator_1  |   "walletCredentials": {
alice-mediator_1  |     "key": "0000000000000000000000000Mediator01"
alice-mediator_1  |   },
alice-mediator_1  |   "publicDid": "DtWRdd6C5dN5vpcN6XRAvu",
alice-mediator_1  |   "publicDidSeed": "00000000000000000000000Forward01",
alice-mediator_1  |   "autoAcceptConnections": true
alice-mediator_1  | }
alice-mediator_1  |
```

## Troubleshooting

Error: (node:46) UnhandledPromiseRejectionWarning: Error: No handler for message type "https://didcomm.org/connections/1.0/request" found

Simply rebuild the docker file:

```sh
docker-compose -f docker/docker-compose-mediators.yml -f docker/docker-compose-mediators-ngrok.yml up --build
```
