import { Agent, InboundTransporter } from 'aries-framework-javascript'
import axios from 'axios'

class PollingInboundTransporter implements InboundTransporter {
  public async start(agent: Agent): Promise<void> {
    await this.registerMediator(agent)
  }

  public async registerMediator(agent: Agent): Promise<void> {
    try {
      const mediatorUrl = agent.getMediatorUrl()
      const mediatorInvitationUrlResponse = await axios.get(`${mediatorUrl}/invitation`)
      const response = await axios.get(`${mediatorUrl}/`)
      const { verkey: mediatorVerkey } = response.data
      await agent.routing.provision({
        verkey: mediatorVerkey,
        invitationUrl: mediatorInvitationUrlResponse.data,
      })
      this.pollDownloadMessages(agent)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error)
    }
  }

  private pollDownloadMessages(agent: Agent): void {
    setInterval(async () => {
      const downloadedMessages = await agent.routing.downloadMessages()

      for (const message of downloadedMessages) {
        await agent.receiveMessage(message)
      }
    }, 5000)
  }
}

export { PollingInboundTransporter }
