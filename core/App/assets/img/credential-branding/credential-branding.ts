import { ImageSourcePropType } from 'react-native'

export interface Overlay {
  backgroundColor?: string
  imageSource?: ImageSourcePropType
  header?: OverlayHeader
  footer?: OverlayFooter
}
export interface OverlayHeader {
  color?: string
  backgroundColor?: string
  imageSource?: ImageSourcePropType
  hideIssuer?: boolean
}

export interface OverlayFooter {
  color?: string
  backgroundColor?: string
}

const branding: Record<string, Overlay> = {
  'AuJrigKQGRLJajKAebTgWu:2:Member Card:1.5.1': {
    imageSource: require('./lsbc-member-card.png'),
    header: {
      imageSource: require('./lsbc-header-logo.png'),
      color: '#D3D3D3',
      backgroundColor: '#00698C',
      hideIssuer: true,
    },
  },
  'Trx3R1frdEzbn34Sp1jyX:2:student_card:1.0': {
    imageSource: require('./best-bc-student-card.png'),
    header: {
      imageSource: require('./best-bc-header-logo.png'),
      color: '#FFFFFF',
    },
    footer: { color: '#FFFFFF' },
  },
}

export default branding
