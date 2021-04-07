import { Agent, OutboundTransporter, WebSocketTransport, OutboundPackage } from 'aries-framework-javascript';

class WsOutboundTransporter implements OutboundTransporter {
    public constructor() {
    }
  
    public async sendMessage(outboundPackage: OutboundPackage, receiveReply: boolean) {
      console.log('WsOutboundTransporter sendMessage');
      const { connection, payload, transport } = outboundPackage;
  
      // TODO Replace this logic with multiple transporters
      if (transport instanceof WebSocketTransport && transport?.ws?.readyState === WebSocket.OPEN) {
        return this.sendViaWebSocket(transport, payload, receiveReply);
      } else {
          console.warn("Websocket Not Ready")
      }
    }
  
    private async sendViaWebSocket(transport: WebSocketTransport, payload: any, receiveReply: boolean) {
      const { ws } = transport;
      console.log('Sending message over ws...', { transport: { type: transport?.type } });
  
      if (ws?.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not available or connected.');
      }
  
      this.emitMessage(ws, payload);
    //   if (receiveReply) {
    //     const response: any = await this.emitMessage(socket, payload);
    //     console.log('response', response);
    //     const wireMessage = response;
    //     console.log('wireMessage', wireMessage);
    //     return wireMessage;
    //   } else {
    //     this.emitMessage(socket, payload);
    //   }
    }
  
    private async emitMessage(ws: WebSocket, payload: any) {
      return new Promise((resolve, reject) => {
        console.log('emit agentMessage', payload);
        ws.send(payload)
        // ('agentMessage', payload, (response: any) => {
        //   resolve(response);
        // });
      });
    }
  }

  export { WsOutboundTransporter }