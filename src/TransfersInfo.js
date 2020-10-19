import React from 'react'
import TokenBalance from './TokenBalance'

const TransfersInfo = ({ link, address }) => {
  if (!(link.type === 'link'))
    return null
  return (
    <div className="extra-info">
      {Object.entries(link[address === link.source_address ? 'filtered_source_amounts' : 'filtered_target_amounts']).map(([token_address, balance]) => <TokenBalance key={token_address} address={token_address} balance={balance}/>)}
    </div>
  )
}

export default TransfersInfo