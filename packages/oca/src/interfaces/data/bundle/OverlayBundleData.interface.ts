import IBaseOverlayData from '../base/BaseOverlayData.interface'
import ICaptureBaseData from '../capture-base/CaptureBaseData.interface'

export default interface IOverlayBundleData {
  capture_base: ICaptureBaseData
  overlays: IBaseOverlayData[]
}
