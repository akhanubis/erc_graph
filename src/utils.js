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

export const retryablePromise = (promise_fn, max_retries = 3, tries = 0) => {
  return promise_fn()
  .catch(e => {
    tries++
    console.log(e)
    if (tries <= max_retries) {
      console.log('Retryable promise failed, retrying', tries)
      return exports.retryable_promise(promise_fn, max_retries, tries)
    }
    else {
      console.log('Retryable promise failed, out of retries')
      throw(e)
    }
  })
}