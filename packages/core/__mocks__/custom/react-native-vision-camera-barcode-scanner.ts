// The real module loads react-native-nitro-modules, whose native TurboModule
// does not exist under jest.
const useBarcodeScannerOutput = jest.fn(() => ({}))

export { useBarcodeScannerOutput }
