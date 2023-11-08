import { useEffect, useState } from 'react'

import { ProofRequestTemplate } from '../../verifier'
import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'
import { applyTemplateMarkers, useRemoteProofBundleResolver } from '../utils/proofBundle'

export const useTemplates = (): Array<ProofRequestTemplate> => {
  const [store] = useStore()
  const [proofRequestTemplates, setProofRequestTemplates] = useState<ProofRequestTemplate[]>([])
  const { proofTemplateBaseUrl } = useConfiguration()
  const resolver = useRemoteProofBundleResolver(proofTemplateBaseUrl)
  useEffect(() => {
    resolver.resolve(store.preferences.acceptDevCredentials).then((templates) => {
      if (templates) {
        setProofRequestTemplates(applyTemplateMarkers(templates))
      }
    })
  }, [])
  return proofRequestTemplates
}

export const useTemplate = (templateId: string): ProofRequestTemplate | undefined => {
  const [store] = useStore()
  const [proofRequestTemplate, setProofRequestTemplate] = useState<ProofRequestTemplate | undefined>(undefined)
  const { proofTemplateBaseUrl } = useConfiguration()
  const resolver = useRemoteProofBundleResolver(proofTemplateBaseUrl)
  useEffect(() => {
    resolver.resolveById(templateId, store.preferences.acceptDevCredentials).then((template) => {
      if (template) {
        setProofRequestTemplate(applyTemplateMarkers(template))
      }
    })
  }, [])
  return proofRequestTemplate
}
