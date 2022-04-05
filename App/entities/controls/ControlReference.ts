import { ControlBase } from '../../entities/controls/ControlBase'
import { ControlData } from '../../types/ControlData'

export class ControlReference extends ControlBase {
  constructor(data: ControlData) {
    super({ ...data, type: 'Reference' })
  }
}
