export type ParseInvitationResult =
  | {
      success: true
      result: ParsedInvitation
    }
  | {
      success: false
      error: string
    }

export type ParsedInvitation = {
  type: 'didcomm' | 'openid-credential-offer' | 'openid-authorization-request'
  format: 'url' | 'parsed'
  data: string | Record<string, unknown>
}

export enum InvitationQrTypes {
  OPENID_INITIATE_ISSUANCE = 'openid-initiate-issuance://',
  OPENID_CREDENTIAL_OFFER = 'openid-credential-offer://',
  // TODO: I think we should not support openid://, as we mainly support openid4vp
  // But older requests do use openid:// I think (such as the DIIP dbc login)
  // but I think we're going to move to just openid4p in the future
  OPENID = 'openid://',
  OPENID4VP = 'openid4vp://',
  OPENID_VC = 'openid-vc://',
  DIDCOMM = 'didcomm://',
  HTTPS = 'https://',
}

export const isOpenIdCredentialOffer = (url: string) => {
  if (
    url.startsWith(InvitationQrTypes.OPENID_INITIATE_ISSUANCE) ||
    url.startsWith(InvitationQrTypes.OPENID_CREDENTIAL_OFFER)
  ) {
    return true
  }

  if (url.includes('credential_offer_uri=') || url.includes('credential_offer=')) {
    return true
  }

  return false
}

export const isOpenIdPresentationRequest = (url: string) => {
  if (
    url.startsWith(InvitationQrTypes.OPENID) ||
    url.startsWith(InvitationQrTypes.OPENID_VC) ||
    url.startsWith(InvitationQrTypes.OPENID4VP)
  ) {
    return true
  }

  if (url.includes('request_uri=') || url.includes('request=')) {
    return true
  }

  return false
}

export const isDidCommInvitation = (url: string) => {
  if (url.startsWith(InvitationQrTypes.DIDCOMM)) {
    return true
  }

  if (url.includes('c_i=') || url.includes('oob=') || url.includes('oobUrl=') || url.includes('d_m=')) {
    return true
  }

  return false
}

export async function parseInvitationUrl(invitationUrl: string): Promise<ParseInvitationResult> {
  if (isOpenIdCredentialOffer(invitationUrl)) {
    return {
      success: true,
      result: {
        format: 'url',
        type: 'openid-credential-offer',
        data: invitationUrl,
      },
    }
  }

  if (isOpenIdPresentationRequest(invitationUrl)) {
    return {
      success: true,
      result: {
        format: 'url',
        type: 'openid-authorization-request',
        data: invitationUrl,
      },
    }
  }

  if (isDidCommInvitation(invitationUrl)) {
    return {
      success: true,
      result: {
        format: 'url',
        type: 'didcomm',
        data: invitationUrl,
      },
    }
  }

  return {
    success: false,
    error: 'Invitation not recognized.',
  }
}
