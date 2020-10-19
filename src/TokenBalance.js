import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import TokenIcon from './TokenIcon'
import Etherscan from './etherscan'
import TokensMetadata from './TokensMetadata'

const ExplorerTooltip = (
  <Tooltip id="explorer_tooltip">
    Open in explorer
  </Tooltip>
)

const TokenBalance = ({ address, balance }) => (
  <div>
    <OverlayTrigger placement="top" overlay={ExplorerTooltip}>
      <Button className="token-icon" variant="link" onClick={_ => Etherscan.link('token', address)}>
        <TokenIcon address={address}/>
      </Button>
    </OverlayTrigger>
    <span>{TokensMetadata.symbol(address)}:</span> <span className={balance.isLessThan(0) ? 'negative' : 'positive'}>{balance.isLessThan(0) ? '' : '+'}{TokensMetadata.fromDecimals(balance, address).toFixed(6)}</span>
  </div>
)

export default TokenBalance