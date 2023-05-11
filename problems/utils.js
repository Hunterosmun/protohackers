export function map (mapper) {
  return async function* (source) {
    for await (const chunk of source) {
      yield mapper(chunk)
    }
  }
}

export function split (char) {
  const code = char.charCodeAt(0)
  return async function* (source) {
    let buffer = Buffer.from([])
    for await (const chunk of source) {
      buffer = Buffer.concat([buffer, chunk])
      // buffer.indexOf(10) is saying take the index of the newline character
      for (let i = buffer.indexOf(code); i !== -1; i = buffer.indexOf(code)) {
        yield buffer.subarray(0, i)
        buffer = buffer.subarray(i + 1)
      }
    }
  }
}

export function chunk (num) {
  return async function* (source) {
    let buffer = Buffer.from([])
    for await (const chunk of source) {
      buffer = Buffer.concat([buffer, chunk])
      while (buffer.length >= num) {
        yield buffer.subarray(0, num)
        buffer = buffer.subarray(num)
      }
    }
  }
}
