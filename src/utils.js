export const promisesInChunk = async (data, chunk_size, promise_fn) => {
  for (let i = 0; i < data.length; i += chunk_size)
    await Promise.all(data.slice(i, i + chunk_size).map(promise_fn))
}

export const filterInPlace = (array, condition) => {
  let next_place = 0
  for (const value of array)
    if (condition(value))
      array[next_place++] = value
  array.splice(next_place)
  return array
}