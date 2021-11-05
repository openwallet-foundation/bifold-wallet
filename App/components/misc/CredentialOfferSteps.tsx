import styled, { css } from '@emotion/native'
import React from 'react'
import { View } from 'react-native'

const Steps = styled.View`
  flex: 2;
  max-width: 100%;
  max-height: 100%;
  justify-content: center;
`

const Step = styled.View`
  flex-direction: row;
  justify-content: flex-start;
`

const StepBubble: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <View
      style={css`
        left: 31px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        border-width: 2px;
        border-color: #ffffff;
        background-color: ${active ? '#ffffff' : undefined};
        overflow: hidden;
      `}
    />
  )
}

const StepTextContainer: React.FC<{ last: boolean }> = ({ last, children }) => {
  return (
    <View
      style={css`
        border-left-width: ${last ? '0px' : '2px'};
        border-left-color: #ffffff;
        margin-left: 20px;
        padding-left: 20px;
        padding-bottom: ${last ? '0px' : '20px'};
        margin-top: 20px;
        z-index: -1;
      `}
    >
      {children}
    </View>
  )
}

const StepText = styled.Text`
  color: #ffffff;
  padding-left: 10px;
  padding-right: 30px;
  margin-top: -20px;
`

const steps: string[] = [
  'Scan the QR code issued by an organization to add a credential',
  'Accept the offered credential',
  'Done! Your new credential is added to your wallet',
]

const CredentialOfferSteps: React.FC<{ activeStep: number }> = ({ activeStep }) => {
  return (
    <Steps>
      {steps.map((step, idx, arr) => {
        return (
          <Step>
            <StepBubble active={idx <= activeStep - 1} />
            <StepTextContainer last={idx === arr.length - 1}>
              <StepText>{step}</StepText>
            </StepTextContainer>
          </Step>
        )
      })}
    </Steps>
  )
}

export default CredentialOfferSteps
