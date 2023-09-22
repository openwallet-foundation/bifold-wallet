import { ProofRequestTemplate } from '../../verifier'
import { useConfiguration } from '../contexts/configuration'
import { useStore } from '../contexts/store'

export const useTemplates = (): Array<ProofRequestTemplate> => {
  const [store] = useStore()
  const { proofRequestTemplates } = useConfiguration()
  return (proofRequestTemplates && proofRequestTemplates(store.preferences.acceptDevCredentials)) || []
}

export const useTemplate = (templateId: string): ProofRequestTemplate | undefined => {
  const { proofRequestTemplates } = useConfiguration()
  const [store] = useStore()
  return (
    proofRequestTemplates &&
    proofRequestTemplates(store.preferences.acceptDevCredentials).find((template) => template.id === templateId)
  )
}
