### Patches

#### @credo-ts-core-npm-0.5.11-9122d8c9b8.patch

Patch to fix two separate issues. One, fix websocket close handling to allow graceful agent shutdown, and two, ensure listeners are reactivated properly after agent shutdown and consecutive initialize. The websocket part will no longer be needed in Credo 0.6.x but no ETA yet on when the listener reactivation will be included. Here is the websocket PR:

- https://github.com/openwallet-foundation/credo-ts/pull/2152

#### @credo-ts-indy-vdr-npm-0.5.11-ced84362c9.patch

Prevent error on agent restart when same IndyVDR pool is reused. Part of this PR, can be removed when we reach Credo 0.6.x

- https://github.com/openwallet-foundation/credo-ts/pull/2137


#### @hyperledger-indy-vdr-react-native-npm-0.2.2-627d424b96.patch

#### @hyperledger-indy-vdr-shared-npm-0.2.2-b989282fc6.patch

Patches adding support for caching by grabbing the 0.4.3 indy-vdr binary from github. There's also some changes to the cpp FFIs

#### @sphereon-pex-npm-3.3.3-144d9252ec.patch

Prevents an unnecessary preinstall script from running that only affects local development
