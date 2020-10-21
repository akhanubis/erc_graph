import React from 'react'
import Container from 'react-bootstrap/Container'
import './css/metrics.css'

const Metrics = ({ start_block, end_block, transfers_count, addresses_count, total_transfers_count, total_addresses_count }) => {
  const filtered = transfers_count !== total_transfers_count || addresses_count !== total_addresses_count

  return (
    <div className="block-info">
      <Container fluid>
        <div className="block-info-title">
          Currently displaying {filtered ? 'filtered ' : ''} transfers:
        </div>
        {start_block || end_block ? <div className="info">
          {start_block} to {end_block}
        </div> : null}
        <div className="elements-count">
          {transfers_count} transfers{filtered ? ` (out of ${ total_transfers_count } total)` : ''}
        </div>
        <div className="elements-count">
          {addresses_count} addresses{filtered ? ` (out of ${ total_addresses_count } total)` : ''}
        </div>
      </Container>
    </div>
  )
}

export default React.memo(Metrics)