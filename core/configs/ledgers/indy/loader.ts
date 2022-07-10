import axios from 'axios'

async function loadGenesis(url: string) {
  const response = await axios.get(url)

  return response.data
}

export default loadGenesis
