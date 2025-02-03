import { credentialOfferTourSteps } from '../../App/components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from '../../App/components/tour/CredentialsTourSteps'
import { homeTourSteps } from '../../App/components/tour/HomeTourSteps'
import { proofRequestTourSteps } from '../../App/components/tour/ProofRequestTourSteps'
import { Tours } from '../../App/contexts/tour/tour-context'

export const toursMock: Tours = {
  homeTourSteps: homeTourSteps,
  credentialsTourSteps: credentialsTourSteps,
  credentialOfferTourSteps: credentialOfferTourSteps,
  proofRequestTourSteps: proofRequestTourSteps,
}
