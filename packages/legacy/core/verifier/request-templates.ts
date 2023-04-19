import { PredicateType } from '@aries-framework/core'

import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
  {
    id: 'Aries:5:StudentFullName:0.0.1:indy',
    name: 'Student full name',
    description: 'Verify the full name of a student',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card',
          requestedAttributes: [
            {
              name: 'student_first_name',
              restrictions: [{ cred_def_id: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card' }],
            },
            {
              name: 'student_last_name',
              restrictions: [{ cred_def_id: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card' }],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'Aries:5:StudentFullNameAndExpirationDate:0.0.1:indy',
    name: 'Student full name and expiration date',
    description: 'Verify that full name of a student and that he/she has a not expired student card.',
    version: '0.0.1',
    payload: {
      type: ProofRequestType.Indy,
      data: [
        {
          schema: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:Student Card',
          requestedAttributes: [
            {
              names: ['student_first_name', 'student_last_name'],
              restrictions: [{ cred_def_id: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card' }],
            },
          ],
          requestedPredicates: [
            {
              name: 'expiry_date',
              predicateType: PredicateType.GreaterThanOrEqualTo,
              predicateValue: 20240101,
              restrictions: [{ cred_def_id: 'XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card' }],
            },
          ],
        },
      ],
    },
  },
]
