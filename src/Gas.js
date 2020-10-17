import React, { useState, useEffect } from 'react'
import axios from 'axios'

const GAS_REFRESH_IN_MS = 30000

const Gas = _ => {
  const [price, set_price] = useState({})

  const update_price = _ => axios.get('https://www.etherchain.org/api/gasPriceOracle').then(r => set_price(r.data))

  useEffect(_ => {
    setInterval(update_price, GAS_REFRESH_IN_MS)
    update_price()
  }, [])

  return (
    <div className="gas-container no-select">{ price.standard } GWEI</div>
  )
}

export default React.memo(Gas)