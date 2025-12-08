import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import { useTheme } from '../../contexts/theme'

const ButtonLoading: React.FC = () => {
  const { ColorPalette } = useTheme()

  return <LoadingSpinner size={25} color={ColorPalette.brand.icon} />
}

export default ButtonLoading
