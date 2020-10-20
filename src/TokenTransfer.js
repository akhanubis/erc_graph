import React from 'react'
import TokenBalance from './TokenBalance'

const TokenTransfer = ({ transfer }) => {
  return (
    <div className="token-transfer">
      From
      <span className="sender">
        {transfer.sender.substr(0, 7)}
      </span>
      to
      <span className="receiver">
        {transfer.receiver.substr(0, 7)}
      </span>
      for
      <TokenBalance noColor address={transfer.token_address} balance={transfer.amount}/>
    </div>
  )
}

export default TokenTransfer