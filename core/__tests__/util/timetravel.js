import MockDate from 'mockdate'

jest.useFakeTimers('legacy')
jest.spyOn(global, 'setTimeout')

const unitOfTime = 10

// Polyfill `requestAnimationFrame` so that it simulates a
// new animation frame every `unitOfTime`.
global.requestAnimationFrame = (fn) => {
  setTimeout(fn, unitOfTime)
}

const advanceToNextFrame = () => {
  const now = Date.now()
  MockDate.set(new Date(now + unitOfTime))
  // Date.now = jest.fn().mockReturnValue(new Date(now + unitOfTime))
  jest.advanceTimersByTime(unitOfTime)
}

const timeTravel = (ms = unitOfTime) => {
  const frames = ms / unitOfTime
  let framesElapsed = 0

  while (framesElapsed < frames) {
    advanceToNextFrame()
    framesElapsed++
  }
}

export default timeTravel
