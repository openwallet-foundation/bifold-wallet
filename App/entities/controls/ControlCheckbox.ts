import { ControlBase } from '../../entities/controls/ControlBase'
import { ControlData } from '../../types/ControlData'

export class ControlCheckbox extends ControlBase {
  value: boolean

  constructor(data: ControlData) {
    super({ ...data, type: 'Checkbox' })
  }
}
