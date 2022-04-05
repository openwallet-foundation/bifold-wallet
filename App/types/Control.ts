import { ControlBinary } from 'entities/controls/ControlBinary'
import { ControlCheckbox } from 'entities/controls/ControlCheckbox'
import { ControlDate } from 'entities/controls/ControlDate'
import { ControlNumber } from 'entities/controls/ControlNumber'
import { ControlSelect } from 'entities/controls/ControlSelect'
import { ControlSelectMultiple } from 'entities/controls/ControlSelectMultiple'
import { ControlText } from 'entities/controls/ControlText'
import { ControlReference } from 'entities/controls/ControlReference'

export type Control =
  | ControlBinary
  | ControlCheckbox
  | ControlDate
  | ControlNumber
  | ControlSelect
  | ControlSelectMultiple
  | ControlText
  | ControlReference
