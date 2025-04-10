import { ProofRequestTemplate, ProofRequestType } from './types/proof-reqeust-template'

export const getProofRequestTemplates = (useDevRestrictions: boolean) => {
  const identityRestrictions = useDevRestrictions
    ? [{ schema_name: 'identity' }]
    : [{ schema_id: 'NJEP7EKT3T7tUUUk15i1Ws:2:identity:1.1' }]
   
  const employmentRestrictions = useDevRestrictions
    ? [{ schema_name: 'emp' }]
    : [{ schema_id: 'NJEP7EKT3T7tUUUk15i1Ws:2:emp:1.0' }]
   
  const financialRestrictions = useDevRestrictions
    ? [{ schema_name: 'finance' }]
    : [{ schema_id: 'Q9ug9WCZUpguUjWHYmWU2h:2:finance:1.0' }]
   
  const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
    {
      id: 'Aries:5:IdentityVerification:0.0.1:indy',
      name: 'Identity Verification',
      description: 'Verify personal identity details including ID, name, photo, dates, and address',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: 'NJEP7EKT3T7tUUUk15i1Ws:2:identity:1.1',
            requestedAttributes: [
              {
                names: ['type_of_id', 'date_of_expiry', 'date_of_birth', 'name', 'address', 'photo'],
                restrictions: identityRestrictions,
              },
            ],
          },
        ],
      },
    },
    {
      id: 'Aries:5:EmploymentVerification:0.0.2:indy',
      name: 'Employment Verification',
      description: 'Verify current and previous employment details',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: 'NJEP7EKT3T7tUUUk15i1Ws:2:emp:1.0',
            requestedAttributes: [
              {
                names: [
                  'curemp_name',
                  'curemp_since',
                  'curemp_position',
                  'curemp_type',
                  'prevemp_name',
                  'prevemp_since',
                  'prevemp_position',
                  'prevemp_biweekly_pay',
                  'prevemp_type'
                ],
                restrictions: employmentRestrictions,
              },
            ],
            requestedPredicates: [
              {
                name: 'curemp_biweekly_pay',
                predicateType: '>=',
                predicateValue: 20240101,
                restrictions:employmentRestrictions,
              },
            ],
          },
        ],
      },
    },
    {
      id: 'Aries:5:FinancialVerification:0.0.3:indy',
      name: 'Financial Verification',
      description: 'Verify financial health, credit scores, and property ownership',
      version: '0.0.1',
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: 'Q9ug9WCZUpguUjWHYmWU2h:2:finance:1.0',
            requestedAttributes: [
              {
                names: [
                  'owner_name',
                  'icredy_credit_rating',
                  'score',
                  'icredy_financial_rating',
                  'property_address'
                ],
                restrictions: financialRestrictions,
              },
            ],
          },
        ],
      },
    },
  ]

  return defaultProofRequestTemplates
}