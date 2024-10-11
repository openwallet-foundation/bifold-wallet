export enum Stacks {
  SendVideoStack = 'Send Video',
}

export enum Screens {
  VideoInstructions = 'Instructions',
  VerifyVideo = 'Capture Video',
  SubmitVideo = 'Send Video',
}

export type SendVideoStackParams = {
  [Screens.VideoInstructions]: undefined
  [Screens.VerifyVideo]: undefined
  [Screens.SubmitVideo]: undefined
}
