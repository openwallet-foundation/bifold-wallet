#!/usr/bin/env node
/* eslint @typescript-eslint/no-var-requires: "off" */

const fs = require('fs')
const http = require('http')
const https = require('https')
const url = require('url')

const networkUrl =
  'https://raw.githubusercontent.com/hyperledger/indy-node-monitor/main/fetch-validator-status/networks.json'
const networksToAdd = [
  { id: 'bct', connectOnStartup: true, production: false },
  { id: 'cdn', connectOnStartup: true, production: false },
  { id: 'ctn', connectOnStartup: true, production: false },
  { id: 'cpn', connectOnStartup: true, production: true },
  { id: 'imn', connectOnStartup: true, production: true },
  { id: 'idn', connectOnStartup: true, production: false },
  { id: 'itn', connectOnStartup: true, production: false },
]
const networkNameRe = /\W+/im

const getUrlContents = async (aUrl) => {
  const client = aUrl.protocol.slice(0, -1) === 'http' ? http : https

  return new Promise((resolve) => {
    let data = ''
    client.get(aUrl, (res) => {
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve(data)
      })
    })
  })
}

const main = async () => {
  const networksAsString = await getUrlContents(url.parse(networkUrl))
  const networks = JSON.parse(networksAsString)
  const myNetworks = networksToAdd.map((n) => Object({ ...n, ...networks[n.id] }))
  let ledgers = []

  for (let n of myNetworks) {
    const aUrl = url.parse(n['genesisUrl'])
    const name = n['name']
      .split(' ')
      .filter((w) => !networkNameRe.test(w))
      .join('')
    const transaction = await getUrlContents(aUrl)
    // const data = `export default \`${block.trim()}\`\n`
    ledgers.push({
      id: name,
      indyNamespace: n['indyNamespace'],
      isProduction: n['production'],
      connectOnStartup: n['connectOnStartup'],
      genesisTransactions: transaction.trim(),
    })
  }

  fs.writeFileSync(`ledgers.json`, JSON.stringify(ledgers, null, 2), 'utf8')
}

main()
