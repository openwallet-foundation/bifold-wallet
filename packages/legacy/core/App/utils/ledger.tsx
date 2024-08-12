import TcpSocket from 'react-native-tcp-socket'

import pools from '../configs/ledgers/indy'
import { GenesisTransaction } from '../types/genesis'

export const canConnectToLedgerNode = async (node: { host: string; port: number }): Promise<boolean> =>
  new Promise((resolve) => {
    const socketTimeoutInMs = 3000
    const client = TcpSocket.createConnection(node, () => {
      resolve(true)
      client.destroy()
    })

    // Other events that can be safely be ignored. See the
    // library for more details:
    // https://www.npmjs.com/package/react-native-tcp-socket

    client.on('error', () => {
      client.destroy()
      resolve(false)
    })

    client.on('timeout', () => {
      client.destroy()
      client.removeAllListeners()

      resolve(false)
    })

    client.setTimeout(socketTimeoutInMs)
  })
