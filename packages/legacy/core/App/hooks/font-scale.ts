import { useState, useEffect } from 'react'
import { Dimensions, ScaledSize } from 'react-native'

const useFontScale = () => {
  const [fontScale, setFontScale] = useState(Dimensions.get('screen').fontScale)

  useEffect(() => {
    const handleChange = ({ screen }: { screen: ScaledSize }) => {
      setFontScale(screen.fontScale)
    }

    const subscription = Dimensions.addEventListener('change', handleChange)

    return () => {
      subscription.remove()
    }
  }, [])

  return fontScale
}

export default useFontScale
