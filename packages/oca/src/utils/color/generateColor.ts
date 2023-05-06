import hashCode from './hashCode'
import hashToRGBA from './hashToRGBA'

const generateColor = (seed: string): string => {
  return hashToRGBA(hashCode(seed))
}

export default generateColor
