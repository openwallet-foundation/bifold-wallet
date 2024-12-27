import { Session } from './api'

export enum Screens {
  VideoInstructions = 'Video Instructions',
  CaptureVideo = 'Capture Video',
  SubmitVideo = 'Submit Video',
  CaptureCard = 'Capture Card',
  Identification = 'Identification',
}

export type SendVideoStackParams = {
  [Screens.VideoInstructions]: undefined
  [Screens.CaptureVideo]: {
    session: Session
    idNumber: string
    cardFrontImage: string | null
    cardBackImage: string | null
  }
  [Screens.SubmitVideo]: undefined
  [Screens.CaptureCard]: {
    type: string
    onImageCaptured: (imagePath: string) => void
  }
  [Screens.Identification]: { session: Session }
}
