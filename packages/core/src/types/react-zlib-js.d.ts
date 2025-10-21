declare module 'react-zlib-js' {
  export function gunzip(buffer: Uint8Array | Buffer, callback: (err: any, result: Uint8Array) => void): void
}
