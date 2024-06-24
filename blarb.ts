import React, { createContext, useContext } from 'react'

export type TokenMapping = {
  ['a']: boolean
  ['b']: string
  ['c']: string
}

const x = [1, 'b', 'c'] as const

type TupleToObject<T extends readonly PropertyKey[]> = {
  ['a']: boolean
  ['b']: string
  ['c']: string
}

type xx = TupleToObject<typeof x>

// const m = TupleToObject(TokenMapping as const)
