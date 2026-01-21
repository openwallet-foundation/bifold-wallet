import type { Agent } from '@credo-ts/core'
import type { QuestionAnswerRecord, QuestionAnswerStateChangedEvent } from '@credo-ts/question-answer'
import type { PropsWithChildren } from 'react'

import { QuestionAnswerApi, QuestionAnswerEventTypes } from '@credo-ts/question-answer'
import { createContext, useState, useEffect, useContext, useMemo } from 'react'
import * as React from 'react'

interface QuestionAnswerContextInterface {
  loading: boolean
  questionAnswerMessages: QuestionAnswerRecord[]
}

const QuestionAnswerContext = createContext<QuestionAnswerContextInterface | undefined>(undefined)

export const useQuestionAnswer = (): { questionAnswerMessages: QuestionAnswerRecord[] } => {
  const questionAnswerContext = useContext(QuestionAnswerContext)
  if (!questionAnswerContext) {
    throw new Error('useQuestionAnswer must be used within a QuestionAnswerContextProvider')
  }
  return questionAnswerContext
}

export const useQuestionAnswerByConnectionId = (connectionId: string): QuestionAnswerRecord[] => {
  const { questionAnswerMessages } = useQuestionAnswer()
  const messages = useMemo(
    () => questionAnswerMessages.filter((m) => m.connectionId === connectionId),
    [questionAnswerMessages, connectionId],
  )
  return messages
}

export const useQuestionAnswerById = (id: string): QuestionAnswerRecord | undefined => {
  const { questionAnswerMessages } = useQuestionAnswer()
  return questionAnswerMessages.find((c) => c.id === id)
}

interface Props {
  agent: Agent
}

const QuestionAnswerProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const [questionAnswerState, setQuestionAnswerState] = useState<QuestionAnswerContextInterface>({
    questionAnswerMessages: [],
    loading: true,
  })

  const setInitialState = async () => {
    const questAnswerApi = agent.dependencyManager.resolve(QuestionAnswerApi)
    const questionAnswerMessages = await questAnswerApi.getAll()

    setQuestionAnswerState({ questionAnswerMessages, loading: false })
  }

  useEffect(() => {
    setInitialState()
  }, [agent])

  useEffect(() => {
    if (questionAnswerState.loading) return

    const listener = (event: QuestionAnswerStateChangedEvent) => {
      const newQuestionAnswerState = [...questionAnswerState.questionAnswerMessages]
      const index = newQuestionAnswerState.findIndex(
        (questionAnswerMessage) => questionAnswerMessage.id === event.payload.questionAnswerRecord.id,
      )
      if (index > -1) {
        newQuestionAnswerState[index] = event.payload.questionAnswerRecord
      } else {
        newQuestionAnswerState.unshift(event.payload.questionAnswerRecord)
      }

      setQuestionAnswerState({
        loading: questionAnswerState.loading,
        questionAnswerMessages: newQuestionAnswerState,
      })
    }

    agent.events.on(QuestionAnswerEventTypes.QuestionAnswerStateChanged, listener)

    return () => {
      agent.events.off(QuestionAnswerEventTypes.QuestionAnswerStateChanged, listener)
    }
  }, [questionAnswerState, agent])

  return <QuestionAnswerContext.Provider value={questionAnswerState}>{children}</QuestionAnswerContext.Provider>
}

export default QuestionAnswerProvider
