import * as networkUtils from "../../src/utils/network"

const mockedFailedPromise = async () => Promise.reject('Error')
const mockedSuccessPromise = async () => Promise.resolve(true)
 
const spy = jest.spyOn(networkUtils, 'withRetry')

describe('network utils', () => {

  describe('withRetry', () => {

    test('withRetry called 3 times with failing promise', async () => {
      try {
        await networkUtils.withRetry(mockedFailedPromise, [])
        expect(spy).toHaveBeenCalledWith(mockedFailedPromise, [])
        expect(spy).toHaveBeenCalledTimes(3)
      } catch (err) {
        expect(err).toBe('Error')
      }
    })
    
    test('withRetry return result of successful promise', async () => {
      const result = await networkUtils.withRetry(mockedSuccessPromise, [])
      expect(spy).toHaveBeenCalledWith(mockedSuccessPromise, [])
      expect(result).toBe(true)
    })

  })

})
