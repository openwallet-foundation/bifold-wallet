interface Node {
  alias: string
  client_ip: string
  client_port: string
  node_ip: string
  node_port: string
  services: Array<string>
}

interface TransactionData {
  data: Node
  dest: string
}

interface NodeMetadata {
  from: string
}

interface Transaction {
  data: TransactionData
  metadata: NodeMetadata
  type: string
}

interface TransactionMetadata {
  seqNo: number
  txnId: string
}

export interface GenesisTransaction {
  reqSignature?: any
  txn: Transaction
  txnMetadata: TransactionMetadata
  ver: string
}
