// eslint-disable-next-line
const argon2 = jest.fn().mockReturnValue({ rawHash: Promise.resolve('1234567890') })

export default argon2
