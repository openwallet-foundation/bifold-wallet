import { ControlBase } from '../../entities/controls/ControlBase'
import { ControlData } from '../../types/ControlData'

export class ControlBinary extends ControlBase {
  value: string

  constructor(data: ControlData) {
    super({ ...data, type: 'Binary' })
  }
}
