import React from 'react'

import { defaultProofRequestTemplates } from '../constants'

interface ListProofRequestsProps {
  navigation: any
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ListProofRequests: React.FC<ListProofRequestsProps> = ({ navigation }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const records = defaultProofRequestTemplates
  return <></>
}

export default ListProofRequests
