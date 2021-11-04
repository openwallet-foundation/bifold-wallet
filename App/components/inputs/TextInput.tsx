import styled, { css } from '@emotion/native'
import { useTheme } from '@emotion/react'
import React, { useState } from 'react'
import { TextInputProps } from 'react-native'

interface Props extends TextInputProps {
  label: string
}

const Container = styled.View`
  display: flex;
  flex-grow: 1;
  flex-direct: column;
`
const InputLabel = styled.Text`
  font-size: 16px;
  margin: 2px;
  color: ${(props) => props.theme.colors.mainColor};
`
const PinEntry = styled.TextInput`
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  border-width: 2px;
  color: ${(props) => props.theme.colors.white};
  background-color: ${(props) => props.theme.colors.backgroundColor};
`

const TextInput: React.FC<Props> = ({ label, ...textInputProps }) => {
  const [focused, setFocused] = useState(false)
  const theme = useTheme()

  return (
    <Container>
      <InputLabel>{label}</InputLabel>
      <PinEntry
        style={css`
          border-color: ${focused ? theme.colors.mainColor : 'transparent'};
        `}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...textInputProps}
      />
    </Container>
  )
}

export default TextInput
