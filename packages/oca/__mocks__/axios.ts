export const get = jest.fn().mockResolvedValue({ status: 200, data: {}, headers: {} })

const create = jest.fn().mockReturnValue({
  get,
})

export default {
  create,
}

// let axiosGet = jest.fn().mockResolvedValue({ status: 200, data: {}, headers: {} })
// const create = jest.fn().mockReturnValue(() => {
//   get: axiosGet
// })

// jest.mock('axios', () => create)
