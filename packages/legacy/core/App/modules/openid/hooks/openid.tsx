import { SdJwtVcRecord, W3cCredentialRecord } from "@credo-ts/core"
import { useEffect, useState } from "react"
import { receiveCredentialFromOpenId4VciOffer } from "../resolver"
import { DeviceEventEmitter } from "react-native"
import { EventTypes } from "../../../constants"
import { BifoldError } from "../../../types/error"
import { useAgent } from "@credo-ts/react-hooks"
import { useTranslation } from "react-i18next"

type OpenIDContextProps = {
    openIDUri?: string
  }

export const useOpenID = ({openIDUri}: OpenIDContextProps): SdJwtVcRecord | W3cCredentialRecord | undefined => {
    const [openIdRecord, setOpenIdRecord]  = useState<SdJwtVcRecord | W3cCredentialRecord>()

    const { agent } = useAgent()
    const { t } = useTranslation()
    
    const resolveOpenIDCredential = async (uri: string) => {
        if(!agent) {
            return
        }
        try{
            const record = await receiveCredentialFromOpenId4VciOffer({
                agent: agent,
                uri: uri
            })
            return record
        } catch (err: unknown) {
            //TODO: Sppecify different error
            const error = new BifoldError(t('Error.Title1043'), t('Error.Message1043'), (err as Error)?.message ?? err, 1043)
            DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        }
    }

    useEffect(() => {
        if (!openIDUri) {
            return
        }
        resolveOpenIDCredential(openIDUri).then((value) => {
            if(value){
                setOpenIdRecord(value)
            }
        })
    }, [openIDUri])

    return openIdRecord
}