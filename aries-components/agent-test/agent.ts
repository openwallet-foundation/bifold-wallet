import {
  Agent,
  HttpOutboundTransporter,
  InitConfig,
  LogLevel,
} from "aries-framework";
import { NodeFileSystem } from "aries-framework/build/src/storage/fs/NodeFileSystem";
import { TestLogger } from "aries-framework/build/src/__tests__/logger";
import indy from "indy-sdk";

import { downloadGenesis, storeGenesis } from './genesis-utils'
import { PollingInboundTransporter } from './PollingInboundTransporter'


const createAgent = async (mediatorUrl?: string) => {
  const genesis = await downloadGenesis();
  const genesisPath = await storeGenesis(genesis, "genesis.txn");

  const agentConfig: InitConfig = {
    label: 'test-123',
    walletConfig: { id: 'test-123' },
    walletCredentials: { key: 'test-123' },
    autoAcceptConnections: true,
    poolName: 'test-123',
    genesisPath,
    mediatorUrl,
    publicDidSeed: "12345678901234567890123456787710",
    indy,
    logger: new TestLogger(LogLevel.warn),
    fileSystem: new NodeFileSystem(),
  };
  const agent = new Agent(agentConfig);
  // agent.setInboundTransporter(new PollingInboundTransporter());
  agent.setOutboundTransporter(new HttpOutboundTransporter(agent))
  return agent
}

export { createAgent }
