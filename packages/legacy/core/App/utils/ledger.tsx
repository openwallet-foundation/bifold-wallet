import TcpSocket from 'react-native-tcp-socket'

export const canConnectToLedgerNode = async (node: { host: string; port: number }): Promise<boolean> =>
  new Promise((resolve, reject) => {
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
      reject(new Error('Error opening connection to ledger node'))
    })

    client.on('timeout', () => {
      client.destroy()
      client.removeAllListeners()

      reject(new Error('Timeout opening connection to ledger node'))
    })

    client.setTimeout(socketTimeoutInMs)
  })
