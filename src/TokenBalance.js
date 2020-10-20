import React from 'react'
import TokenIcon from './TokenIcon'
import TokensMetadata from './TokensMetadata'

const TokenBalance = ({ style, address, balance, noColor }) => (
  <div className="token-balance" style={style}>
    <TokenIcon address={address}/>
    <span>{TokensMetadata.symbol(address)}:</span> <span className={noColor ? '' : balance.isLessThan(0) ? 'negative' : 'positive'}>{noColor || balance.isLessThan(0) ? '' : '+'}{TokensMetadata.fromDecimals(balance, address).toFixed()}</span>
  </div>
)

export default React.memo(TokenBalance)