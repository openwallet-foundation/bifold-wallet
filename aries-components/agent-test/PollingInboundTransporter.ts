import { Agent, InboundTransporter } from "aries-framework";
import fetch from "node-fetch";

class PollingInboundTransporter implements InboundTransporter {
    public stop: boolean;

    public constructor() {
        this.stop = false;
    }
    public async start(agent: Agent) {
        await this.registerMediator(agent);
    }

    public async registerMediator(agent: Agent) {
        const mediatorUrl = agent.getMediatorUrl() || "";
        const mediatorInvitationUrl = await (
            await fetch(`${mediatorUrl}/invitation`)
        ).text();
        const { verkey: mediatorVerkey } = await (
            await fetch(`${mediatorUrl}/`)
        ).json();
        await agent.routing.provision({
            verkey: mediatorVerkey,
            invitationUrl: mediatorInvitationUrl,
        });
        this.pollDownloadMessages(agent);
    }

    private pollDownloadMessages(agent: Agent) {
        const loop = async () => {
            while (!this.stop) {
                await agent.routing.downloadMessages();
                await new Promise((res) => setTimeout(res, 10000));
            }
        };
        new Promise(() => {
            loop();
        });
    }
}

export { PollingInboundTransporter };
