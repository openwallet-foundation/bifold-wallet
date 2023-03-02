import { parseIndyProof } from '../../App/utils/proof'

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
  },
  requested_predicates: {
    predicate_1: {
      name: 'age',
      p_type: '>=' as any,
      p_value: 1,
    },
  },
}

const proof = {
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
    requested_predicates: {
      predicate_1: {
        sub_proof_index: 0,
      },
    },
  },
  identifiers: [],
}

describe('Helpers', () => {
  test('Build indy proof request from template containing two requested attributes', async () => {
    const proofRequest = parseIndyProof(proof_request, proof)
    expect(proofRequest).toMatchSnapshot()
  })
})
