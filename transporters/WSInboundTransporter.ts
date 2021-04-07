import { Agent, InboundTransporter, WebSocketTransport } from 'aries-framework-javascript';

class WsInboundTransporter implements InboundTransporter {
    private ws: WebSocket;
  
    public constructor(ws: WebSocket) {
      this.ws = ws;
    }
  
    public start(agent: Agent): void {
        // websocket transport
        this.ws.onopen = async () => {
            console.log('Websocket connected.');
        }
  
        this.ws.onmessage = async (event:WebSocketMessageEvent) => {
            console.log("New Websocket Message", event)
        }
        //     ('agentMessage', async (payload: any, callback: (args: any) => any) => {
        //     console.log('on agentMessage', payload);
        //   const transport = new WebSocketTransport(socket);
        //   const outboundMessage = await agent.receiveMessage(payload, transport);
        //   if (outboundMessage) {
        //     callback(outboundMessage.payload);
        //   }
        // });
  
        this.ws.close = async (code:number | undefined, reason: string | undefined) => {
            console.log(`WebSocket disconnected. Code: '${code}', reason: '${reason}'`);
        }
    }
  }

  export { WsInboundTransporter }