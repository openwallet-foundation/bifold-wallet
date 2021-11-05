import styled, { css } from '@emotion/native'
import React from 'react'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface Props {
  active: boolean
  onPress?: () => void
}

const TorchButton: React.FC<Props> = ({ active, onPress, children }) => {
  const Container = styled.View`
    flex: 1;
    width: 48px;
    height: 48px;
    align-self: center;
    justify-content: center;
    align-items: center;
  `
  const style = css`
    border-radius: 24px;
    border: 1px solid #ffffff;
    width: 48px;
    height: 48px;
    justify-content: center;
    align-items: center;
  `
  return (
    <Container>
      <TouchableWithoutFeedback style={[style, { backgroundColor: active ? 'white' : undefined }]} onPress={onPress}>
        {children}
      </TouchableWithoutFeedback>
    </Container>
  )
}

const TorchIcon: React.FC<Props> = ({ active }) => {
  const style = css`
    margin-left: 2px;
    margin-top: 2px;
  `
  return (
    <Icon name={active ? 'flash-on' : 'flash-off'} color={active ? '#000000' : '#ffffff'} size={24} style={style} />
  )
}

const QRScannerTorch: React.FC<Props> = ({ active, onPress }) => {
  return (
    <TorchButton active={active} onPress={onPress}>
      <TorchIcon active={active} />
    </TorchButton>
  )
}

export default QRScannerTorch
