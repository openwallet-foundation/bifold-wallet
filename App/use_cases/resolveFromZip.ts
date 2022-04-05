import JSZip from 'jszip'
import type { OCA } from 'oca.js'

export const resolveFromZip = async (file: File): Promise<OCA> => {
  const openedZip = await new JSZip().loadAsync(file)

  const promises: {
    capture_base: Promise<string>
    overlays: Promise<string>[]
  } = Object.values(openedZip.files)
    .filter(f => !f.dir)
    .reduce(
      (result, file) => {
        if (!file.name.includes('/')) {
          result.capture_base = file.async('string')
        } else {
          result.overlays.push(file.async('string'))
        }
        return result
      },
      { capture_base: undefined, overlays: [] }
    )

  const fileContents = (
    await Promise.all([promises.capture_base, ...promises.overlays])
  ).map(c => JSON.parse(c))

  const result: OCA = {
    capture_base: fileContents.shift(),
    overlays: fileContents
  }

  return new Promise(r => r(result))
}
