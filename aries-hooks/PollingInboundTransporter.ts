import { Agent, InboundTransporter } from '@aries-framework/core'

class PollingInboundTransporter implements InboundTransporter {
  private _stop: boolean

  public constructor() {
    this._stop = false
  }

  public async start(agent: Agent) {
    this.pollDownloadMessages(agent)
  }

  public async stop() {
    this._stop = true
  }

  private pollDownloadMessages(agent: Agent) {
    setInterval(async () => {
      if (!this._stop) {
        const mediatorConnection = await agent.mediationRecipient.findDefaultMediatorConnection()
        if (mediatorConnection) {
          await agent.mediationRecipient.pickupMessages(mediatorConnection)
        }
      }
    }, 10000)
  }
}

export { PollingInboundTransporter }
