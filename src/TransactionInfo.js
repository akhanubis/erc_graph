import React from 'react'
import { Button, OverlayTrigger } from 'react-bootstrap'
import TokenTransfer from './TokenTransfer'
import Etherscan from './etherscan'

const TransactionInfo = ({ hash, transfers }) => {
  return (
    <div>
      <div className='element-identifier'>
        <div className="legend">
          <div className="element-label">
            Tx {hash.substr(0, 30)}...
          </div>
        </div>
        <div className="after-legend">
          <OverlayTrigger placement="bottom" overlay={Etherscan.explorerTooltip()}>
            <Button variant="link" onClick={_ => Etherscan.link('tx', hash)}>
              <i className='fas fa-external-link-alt'/>
            </Button>
          </OverlayTrigger>
        </div>
      </div>
      <div className="transaction-transfers">
        {transfers.map((t, i) => <TokenTransfer key={i} transfer={t}/>)}
      </div>
    </div>
  )
}

export default TransactionInfo