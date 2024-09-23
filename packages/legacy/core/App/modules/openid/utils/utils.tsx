import { Attribute, Field } from "@hyperledger/aries-oca/build/legacy"

/**
 * Converts a camelCase string to a sentence format (first letter capitalized, rest in lower case).
 * i.e. sanitizeString("helloWorld")  // returns: 'Hello world'
 */
export function sanitizeString(str: string) {
    const result = str.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replaceAll('_', ' ')
    let words = result.split(' ')
    words = words.map((word, index) => {
      if (index === 0 || word.toUpperCase() === word) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word.charAt(0).toLowerCase() + word.slice(1)
    })
    return words.join(' ')
}

export function getHostNameFromUrl(url: string) {
  //TODO: Find more elegant way to extract host name
  // const urlRegex = /^(.*:)\/\/([A-Za-z0-9-.]+)(:[0-9]+)?(.*)$/
    // const parts = urlRegex.exec(url)
    // return parts ? parts[2] : undefined
    return url.split("https://")[1]
}

export const buildFieldsFromOpenIDTemplate = (
  data: { [key: string]: unknown }
): Array<Field> => {
  const fields = []
  for (const key of Object.keys(data)) {
     // omit id and type
     if (key === 'id' || key === 'type') continue

     let pushedVal: string | number | null = null
     if (typeof data[key] === "string" || typeof data[key] === "number"){
      pushedVal = data[key] as string | number | null
     }
     fields.push(new Attribute({ name: key, value: pushedVal }))
  }
  return fields
}