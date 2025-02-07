import { useCallback } from 'react'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
const useHandleStop = () => {
  const [, dispatch] = useStore()

  const handleStop = useCallback(
    (stop: () => void, type: DispatchAction) => {
      stop()
      dispatch({
        type: type,
        payload: [true],
      })
    },
    [dispatch]
  )

  return handleStop
}

export default useHandleStop
