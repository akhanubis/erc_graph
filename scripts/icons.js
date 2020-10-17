const fs = require('fs')
const axios = require('axios')

const RATE_PER_MINUTE = 50

const promises_in_chunk = async (data, chunk_size, promise_fn, cooldown) => {
  for (let i = 0; i < data.length; i += chunk_size)
    await Promise.all([
      await new Promise(r => setTimeout(r, cooldown)),
      ...data.slice(i, i + chunk_size).map(promise_fn)
    ])
}

const retryable_promise = (promise_fn, max_retries = 3, tries = 0) => {
  return promise_fn()
  .catch(e => {
    tries++
    console.log(e)
    if (tries <= max_retries) {
      console.log('Retryable promise failed, retrying', tries)
      return retryable_promise(promise_fn, max_retries, tries)
    }
    else {
      console.log('Retryable promise failed, out of retries')
      throw(e)
    }
  })
}

const m = async _ => {
  const list = (await axios.get('https://api.coingecko.com/api/v3/coins/list')).data

  console.log(list)
  await promises_in_chunk(list, RATE_PER_MINUTE, async coin => {
    const metadata = (await retryable_promise(_ => axios.get(`https://api.coingecko.com/api/v3/coins/${ coin.id }?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`)).catch(_ => ({ data: {} }))).data
    if (!(metadata.asset_platform_id === 'ethereum' && metadata.contract_address))
      return
    fs.appendFileSync('./data/icons.csv', `${ metadata.contract_address },${ metadata.image.small }\n`)
    console.log(metadata.contract_address, metadata.image.small)
  }, 60000)
}
m()