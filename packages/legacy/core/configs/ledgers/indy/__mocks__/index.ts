import fs from 'fs'
import path from 'path'

const poolPath = path.join(__dirname, 'fixtures/sovrin-main-net-pool.json')
const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'))

export default [pool]
