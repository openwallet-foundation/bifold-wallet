import { PredicateType } from '@aries-framework/core'

import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
  {
    id: 'BC:5:FullName:0.0.1:indy',
    name: 'Full name',
    description: 'Verify the full name of a person',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'YXCtXE4YhVjULgj5hrk4ML:2:unverified_person:0.1.0',
          requestedAttributes: [
            {
              name: 'given_names',
            },
            {
              name: 'family_name',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'BC:5:19+AndFullName:0.0.1:indy',
    name: '19+ and Full name',
    description: 'Verify if a person is 19 years end up and full name.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'YXCtXE4YhVjULgj5hrk4ML:2:unverified_person:0.1.0',
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
          schema: '7KuDTpQh3GJ7Gp6kErpWvM:2:Faber College4091c115-ff01-4fc8-8a36-b5666a2b4e68:1.0.0',
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
    id: 'BC:5:Over19YearsOfAge:0.0.1:indy',
    name: 'Over 19 years of age',
    description: 'Verify if a person is 19 years end up.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: '7KuDTpQh3GJ7Gp6kErpWvM:2:Faber College4091c115-ff01-4fc8-8a36-b5666a2b4e68:1.0.0',
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
    id: 'BC:5:PractisingLawyer:0.0.1:indy',
    name: 'Practising lawyer',
    description: 'Verify if a person`is a practicing lawyer.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'Trx3R1frdEzbn34Sp1jyX:2:Practising Lawyer:0.0.1',
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
    id: 'BC:5:PractisingLawyerAndFullName:0.0.1:indy',
    name: 'Practising lawyer and full name',
    description: 'Verify if a person`is a practicing lawyer using two different credentials for extra assurance',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'YXCtXE4YhVjULgj5hrk4ML:2:unverified_person:0.1.0',
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
          schema: 'Trx3R1frdEzbn34Sp1jyX:2:Practising Lawyer:0.0.1',
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
    id: 'BC:5:OverSomeYearsOfAge:0.0.1:indy',
    name: 'Over some years of age',
    description: 'Verify if a person is over some years ends up.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: '7KuDTpQh3GJ7Gp6kErpWvM:2:Faber College4091c115-ff01-4fc8-8a36-b5666a2b4e68:1.0.0',
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

export const protocolVersion = 'v1'
export const domain = 'http://aries-mobile-agent.com'
