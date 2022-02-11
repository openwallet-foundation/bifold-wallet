export type TabStackParams = {
  HomeTab: undefined
  ContactsTab: undefined
  ScanTab: undefined
  CredentialsTab: undefined
  SettingsTab: undefined
}

export type AuthenticateStackParams = {
  'Enter Pin': { setAuthenticated: (auth: boolean) => void }
}

export type ContactStackParams = {
  Contacts: undefined
  'Contact Details': { connectionId: string }
}

export type CredentialStackParams = {
  Credentials: undefined
  'Credential Details': { credentialId: string }
}

export type HomeStackParams = {
  Home: undefined
  Notifications: undefined
  'Credential Offer': { credentialId: string }
  'Proof Request': { proofId: string }
}

export type ScanStackParams = {
  Scan: undefined
}

export type SettingsStackParams = {
  Settings: undefined
  Language: undefined
}
