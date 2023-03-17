import { getProofIdentifiers, groupSharedProofDataByCredential, parseIndyProof } from '../../utils/proof'
import { IndyProof } from 'indy-sdk-react-native'

const proof_request = {
  name: 'proof-request',
  version: '1.0',
  nonce: '1298236324864',
  requested_attributes: {
    attribute_1: {
      names: ['first_name', 'second_name'],
    },
    attribute_2: {
      name: 'date',
    },
    attribute_3: {
      name: 'passport_no',
    },
  },
  requested_predicates: {
    predicate_1: {
      name: 'age',
      p_type: '>=' as any,
      p_value: 1,
    },
  },
}

const proof: IndyProof = {
  proof: {
    proofs: [],
    aggregated_proof: {
      c_list: [],
    },
  },
  requested_proof: {
    revealed_attrs: {
      attribute_2: {
        sub_proof_index: 0,
        raw: '1/1/1',
        encoded: '',
      },
      attribute_3: {
        sub_proof_index: 1,
        raw: '123123',
        encoded: '',
      },
    },
    revealed_attr_groups: {
      attribute_1: {
        sub_proof_index: 0,
        values: {
          first_name: {
            raw: 'Aries',
            encoded: '',
          },
          second_name: {
            raw: 'Bifold',
            encoded: '',
          },
        },
      },
    },
    self_attested_attrs: {},
    unrevealed_attrs: {},
    // @ts-ignore
    predicates: {
      predicate_1: {
        sub_proof_index: 0,
      },
    },
  },
  identifiers: [
    {
      schema_id: '7KuDTpQh3GJ7Gp6kErpWvM:2:Faber College:1.0.0',
      cred_def_id: '7KuDTpQh3GJ7Gp6kErpWvM:3:CL:712167:latest',
    },
    {
      schema_id: '7KuDTpQh3GJ7Gp6kErpWvM:2:Passport:1.0.0',
      cred_def_id: '7KuDTpQh3GJ7Gp6kErpWvM:3:CL:712168:latest',
    },
  ],
}

describe('Helpers', () => {
  test('Parse indy proof', async () => {
    const proofRequest = parseIndyProof(proof_request, proof)
    expect(proofRequest).toMatchSnapshot()
  })

  test('Group shared proof data by credential', async () => {
    const data = parseIndyProof(proof_request, proof)
    const groupedData = groupSharedProofDataByCredential(data)
    expect(groupedData).toMatchSnapshot()
  })

  test('Get proof identifiers', async () => {
    const identifiers = getProofIdentifiers(proof, 0)
    expect(identifiers).toMatchSnapshot()
  })
})
