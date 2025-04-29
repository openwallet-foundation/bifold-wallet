import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InlineErrorType, InlineMessageProps } from '../components/inputs/InlineErrorText'
import { TOKENS, useServices } from '../container-api'
import { createPINValidations, PINValidationsType } from '../utils/PINValidation'

interface ModalState {
  visible: boolean
  title: string
  message: string
  onModalDismiss?: () => void
}

const initialModalState: ModalState = {
  visible: false,
  title: '',
  message: '',
}

export const usePINValidation = (PIN: string, PINTwo: string) => {
  const { t } = useTranslation()
  const [{ PINSecurity }, inlineMessages] = useServices([TOKENS.CONFIG, TOKENS.INLINE_ERRORS])
  const [inlineMessageField1, setInlineMessageField1] = useState<InlineMessageProps>()
  const [inlineMessageField2, setInlineMessageField2] = useState<InlineMessageProps>()
  const [modalState, setModalState] = useState<ModalState>(initialModalState)

  const clearModal = useCallback(() => {
    setModalState(initialModalState)
  }, [])
  
  const [PINValidations, setPINValidations] = useState<PINValidationsType[]>(
    createPINValidations(PIN, PINSecurity.rules)
  )

  useEffect(() => {
    setInlineMessageField1(undefined)
    setInlineMessageField2(undefined)
    setPINValidations(createPINValidations(PIN, PINSecurity.rules))
  }, [PIN, PINTwo, PINSecurity.rules])

  const attentionMessage = useCallback(
    (title: string, message: string, pinOne: boolean) => {
      if (inlineMessages.enabled) {
        const config = {
          message: message,
          inlineType: InlineErrorType.error,
          config: inlineMessages,
        }
        if (pinOne) {
          setInlineMessageField1(config)
        } else {
          setInlineMessageField2(config)
        }
      } else {
        setModalState({
          visible: true,
          title: title,
          message: message,
          onModalDismiss: clearModal
        })
      }
    },
    [inlineMessages, clearModal]
  )

  const validatePINEntry = useCallback(
    (PINOne: string, PINTwo: string): boolean => {
      for (const validation of PINValidations) {
        if (validation.isInvalid) {
          attentionMessage(
            t('PINCreate.InvalidPIN'),
            t(`PINCreate.Message.${validation.errorName}`, validation?.errorTextAddition),
            true
          )
          return false
        }
      }
      if (PINOne !== PINTwo) {
        attentionMessage(t('PINCreate.InvalidPIN'), t('PINCreate.PINsDoNotMatch'), false)
        return false
      }
      return true
    },
    [PINValidations, t, attentionMessage]
  )

  return {
    PINValidations,
    validatePINEntry,
    inlineMessageField1,
    inlineMessageField2,
    modalState,
    setModalState,
    clearModal,
    PINSecurity
  }
}
