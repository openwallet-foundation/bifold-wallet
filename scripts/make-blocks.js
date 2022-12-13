#!/usr/bin/env node

const fs = require('fs');
const path = require('path')
const https = require('https')
const http = require('http')
const url = require('url')

const networkUrl = 'https://raw.githubusercontent.com/hyperledger/indy-node-monitor/main/fetch-validator-status/networks.json'
const targetNetworks = [
  { id: "bct", production: false },
  { id: "cdn", production: false },
  { id: "ctn", production: false },
  { id: "cpn", production: true },
  { id: "imn", production: true },
  { id: "idn", production: false },
  { id: "itn", production: false },
  { id: "sbn", production: false },
  { id: "ssn", production: false },
  { id: "smn", production: true }
]
const networkNameRe = /\W+/im

const getUrlContents = async (aUrl) => {
  let data = ''
  const client = aUrl.protocol.slice(0, -1) === 'http' ? http : https

  return new Promise((resolve) => {
    let data = ''
    client.get(aUrl, res => {
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        resolve(data);
      })
    })
  })
}

const main = async () => {
  const networksAsString = await getUrlContents(url.parse(networkUrl))
  const networks = JSON.parse(networksAsString)
  const targets = targetNetworks.map((t) => Object({ ...t, ...networks[t.id] }))
  let ledgers = []

  for (let t of targets) {
    const aUrl = url.parse(t['genesisUrl'])
    const name = t['name'].split(' ').filter(w => !networkNameRe.test(w)).join('')
    const block = await getUrlContents(aUrl)
    // const data = `export default \`${block.trim()}\`\n`
    ledgers.push({
      genesisTransactions: block.trim(),
      id: name,
      isProduction: t['production']
    })

  }

  fs.writeFileSync(`ledgers.json`, JSON.stringify(ledgers, null, 2), 'utf8')
}

main();
