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
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0',
          requestedAttributes: [
            {
              name: 'given_names',
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
            },
            {
              name: 'family_name',
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
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
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0',
          requestedAttributes: [
            {
              names: ['given_names', 'family_name'],
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
            },
          ],
          requestedPredicates: [
            {
              name: 'birthdate_dateint',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 18,
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
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
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0',
          requestedPredicates: [
            {
              name: 'birthdate_dateint',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 18,
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
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
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Member Card:1.5.1',
          requestedAttributes: [
            {
              names: ['Given Name', 'Surname', 'PPID', 'Member Status'],
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Member Card:1.5.1' }],
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
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0',
          requestedAttributes: [
            {
              names: ['given_names', 'family_name'],
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
            },
          ],
        },
        {
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Member Card:1.5.1',
          requestedAttributes: [
            {
              names: ['Given Name', 'Surname', 'PPID', 'Member Status'],
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Member Card:1.5.1' }],
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
          schema: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0',
          requestedPredicates: [
            {
              name: 'birthdate_dateint',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 18,
              parameterizable: true,
              restrictions: [{ schema_id: 'XUxBrVSALWHLeycAUhrNr9:2:Person:1.0' }],
            },
          ],
        },
      ],
    },
  },
]

export const protocolVersion = 'v1'
export const domain = 'http://aries-mobile-agent.com'
