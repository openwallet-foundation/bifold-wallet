import React from 'react';

const Constants = {
    Aspect: {},
    BarCodeType: {},
    Type: {},
    CaptureMode: {},
    CaptureTarget: {},
    CaptureQuality: {},
    Orientation: {},
    FlashMode: {
        on:'on',
        off:'off',
        torch:'torch',
        auto: 'auto'
    },
    TorchMode: {}
  };

class RNCamera extends React.Component {
  static Constants = Constants
  render() {
    return null;
  }
}

interface BarCodeReadEvent {
    data: string;
}
RNCamera.Constants = Constants

export { RNCamera };
export type { BarCodeReadEvent };
