#!/usr/bin/env node
/* eslint @typescript-eslint/no-var-requires: "off" */

const fs = require('fs')
const http = require('http')
const https = require('https')
const url = require('url')

const networkUrl =
  'https://raw.githubusercontent.com/hyperledger/indy-node-monitor/main/fetch-validator-status/networks.json'
const networksToAdd = [
  { id: 'bct', production: false },
  { id: 'cdn', production: false },
  { id: 'ctn', production: false },
  { id: 'cpn', production: true },
  { id: 'imn', production: true },
  { id: 'idn', production: false },
  { id: 'itn', production: false },
  { id: 'sbn', production: false },
  { id: 'ssn', production: false },
  { id: 'smn', production: true },
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
      genesisTransactions: transaction.trim(),
      id: name,
      isProduction: n['production'],
    })
  }

  fs.writeFileSync(`ledgers.json`, JSON.stringify(ledgers, null, 2), 'utf8')
}

main()
