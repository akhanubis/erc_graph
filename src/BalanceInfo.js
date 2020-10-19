import React from 'react'
import TokenBalance from './TokenBalance'

const BalanceInfo = ({ node }) => {
  if (!(node.type === 'address'))
    return null
  return (
    <div className="extra-info">
      {Object.entries(node.filtered_balances).map(([token_address, balance]) => <TokenBalance key={token_address} address={token_address} balance={balance}/>)}
    </div>
  )
}

export default BalanceInfo