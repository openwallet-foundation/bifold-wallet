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
          onModalDismiss: clearModal,
        })
      }
    },
    [inlineMessages, clearModal]
  )

  const validatePINEntry = useCallback(
    (pinOne: string, pinTwo: string): boolean => {
      const PINValidation = createPINValidations(pinOne, PINSecurity.rules)
      for (const validation of PINValidation) {
        if (validation.isInvalid) {
          attentionMessage(
            t('PINCreate.InvalidPIN'),
            t(`PINCreate.Message.${validation.errorName}`, validation?.errorTextAddition),
            true
          )
          return false
        }
      }
      if (pinOne !== pinTwo) {
        attentionMessage(t('PINCreate.InvalidPIN'), t('PINCreate.PINsDoNotMatch'), false)
        return false
      }
      return true
    },
    [t, attentionMessage, PINSecurity.rules]
  )

  return {
    PINValidations,
    validatePINEntry,
    inlineMessageField1,
    inlineMessageField2,
    modalState,
    setModalState,
    clearModal,
    PINSecurity,
  }
}
