import TcpSocket from 'react-native-tcp-socket'

import pools from '../configs/ledgers/indy'
import { GenesisTransaction } from '../types/genesis'

export const canConnectToHost = async (host: { host: string; port: number }): Promise<boolean> =>
  new Promise((resolve) => {
    const socketTimeoutInMs = 3000
    const client = TcpSocket.createConnection(host, () => {
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

export const fetchLedgerNodes = (indyNamespace = 'sovrin'): Array<{ host: string; port: number }> => {
  const [pool] = pools.filter((p) => p.indyNamespace === indyNamespace)
  if (!pool) {
    return []
  }

  const genesisTransactionsAsString = pool.genesisTransactions
  let genesisTransactions: Array<GenesisTransaction> = []

  if (genesisTransactionsAsString) {
    try {
      genesisTransactions = genesisTransactionsAsString.split('\n').map((g) => JSON.parse(g))
    } catch (error: unknown) {
      return []
    }
  }

  const nodes = genesisTransactions.map((g) => {
    return { host: g.txn.data.data.client_ip, port: parseInt(g.txn.data.data.client_port) }
  })

  return nodes
}

export const hostnameFromURL = (fullUrl: string): string | null => {
  try {
    // Start of the hostname after "//"
    const startIndex = fullUrl.indexOf('//') + 2

    // End of the hostname (before the next '/' or '?')
    let endIndex = fullUrl.indexOf('/', startIndex)

    // If no '/', look for '?'
    if (endIndex === -1) {
      endIndex = fullUrl.indexOf('?', startIndex)
    }

    // If no '/' or '?', hostname is till the end
    if (endIndex === -1) {
      endIndex = fullUrl.length
    }

    return fullUrl.substring(startIndex, endIndex)
  } catch (error) {
    return null
  }
}
