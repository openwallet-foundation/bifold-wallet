import { PredicateType } from '@aries-framework/core'

import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
  {
    id: '8a83675e-f864-4e5a-9c4d-9787f1034c04',
    title: 'Full name',
    details: 'Verify the full name of a person',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
            {
              names: ['issued', 'country'],
            },
          ],
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 17,
            },
          ],
        },
      ],
    },
  },
  {
    id: '3339c1e1-681f-433c-9f2f-8d0d1af0b3d2',
    title: '19+ and Full name',
    details: 'Verify if a person is 19 years end up and full name.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
          ],
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 19,
            },
          ],
        },
      ],
    },
  },
  {
    id: '18183e86-4528-4d10-80f8-aa5c7cbbbfe7',
    title: 'Over 19 years of age',
    details: 'Verify if a person is 19 years end up.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 19,
            },
          ],
        },
      ],
    },
  },
  {
    id: 'd91c7aab-af1a-42b6-8f1f-2702ed6e1f98',
    title: 'Practising lawyer',
    details: 'Verify if a person`is a practicing lawyer.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Practising Lawyer',
          requestedAttributes: [
            {
              names: ['given_names', 'family_name', 'ppid', 'practicing_status'],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'e4cf6f7c-5abe-4e0d-b299-f944fe5ef8b2',
    title: 'Practising lawyer and full name',
    details: 'Verify if a person`is a practicing lawyer using two different credentials for extra assuarnce',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
          ],
        },
        {
          schema: 'Practising Lawyer',
          requestedAttributes: [
            {
              names: ['given_names', 'family_name', 'ppid', 'practicing_status'],
            },
          ],
        },
      ],
    },
  },
  {
    id: '18183e86-4528-4d10-80f8-aa5c7cbbbfe7',
    title: 'Over some years of age',
    details: 'Verify if a person is over some years ends up.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Verified Person Schema',
          requestedPredicates: [
            {
              name: 'age',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 19,
              parameterizable: true,
            },
          ],
        },
      ],
    },
  },
]
