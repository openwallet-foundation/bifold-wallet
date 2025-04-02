import ButtonLoading from './components/animated/ButtonLoading'
import ConnectionLoading from './components/animated/ConnectionLoading'
import CredentialAdded from './components/animated/CredentialAdded'
import CredentialPending from './components/animated/CredentialPending'
import LoadingIndicator from './components/animated/LoadingIndicator'
import RecordLoading from './components/animated/RecordLoading'
import SendingProof from './components/animated/SendingProof'
import SentProof from './components/animated/SentProof'

export interface AnimatedComponents {
  ButtonLoading: React.FC
  ConnectionLoading: React.FC
  CredentialAdded: React.FC
  CredentialPending: React.FC
  LoadingIndicator: React.FC
  RecordLoading: React.FC
  SendingProof: React.FC
  SentProof: React.FC
}

export const animatedComponents: AnimatedComponents = {
  ButtonLoading: ButtonLoading,
  ConnectionLoading: ConnectionLoading,
  CredentialAdded: CredentialAdded,
  CredentialPending: CredentialPending,
  LoadingIndicator: LoadingIndicator,
  RecordLoading: RecordLoading,
  SendingProof: SendingProof,
  SentProof: SentProof,
}
