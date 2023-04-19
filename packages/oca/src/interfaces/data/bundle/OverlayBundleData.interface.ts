import ICaptureBaseData from "../capture-base/CaptureBaseData.interface";
import IBaseOverlayData from "../base/BaseOverlayData.interface";

export default interface IOverlayBundleData {
  capture_base: ICaptureBaseData;
  overlays: IBaseOverlayData[];
}
