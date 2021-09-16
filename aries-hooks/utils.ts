import axios from 'axios'
import RNFS from 'react-native-fs'

async function storeGenesis(genesis: string, fileName: string): Promise<string> {
  const genesisPath = `${RNFS.DocumentDirectoryPath}/${fileName}`

  await RNFS.writeFile(genesisPath, genesis, 'utf8')

  return genesisPath
}

async function downloadString(url: string): Promise<string> {
  const response = await axios.get(url)

  return response.data
}

export { downloadString, storeGenesis }
