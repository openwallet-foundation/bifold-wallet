import { Session } from "./api"

export enum Screens {
  VideoInstructions = 'Video Instructions',
  CaptureVideo = 'Capture Video',
  SubmitVideo = 'Submit Video',
}

export type SendVideoStackParams = {
  [Screens.VideoInstructions]: undefined
  [Screens.CaptureVideo]: { session: Session}
  [Screens.SubmitVideo]: undefined
}
