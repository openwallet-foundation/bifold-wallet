import { useMemo } from 'react'

import { ProofRequestTemplate } from '../../verifier'
import { useConfiguration } from '../contexts/configuration'

export const useTemplates = (): Array<ProofRequestTemplate> => {
  const { proofRequestTemplates } = useConfiguration()
  return proofRequestTemplates || []
}

export const useTemplate = (templateId: string): ProofRequestTemplate | undefined => {
  const { proofRequestTemplates } = useConfiguration()
  return useMemo(() => proofRequestTemplates?.find((template) => template.id === templateId), [templateId])
}
