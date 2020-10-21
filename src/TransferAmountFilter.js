import React, { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { Form, Col } from 'react-bootstrap'

import './css/transfer_amount_filter.css'
const TransferAmountFilter = ({ on_update }) => {
  const [filters, setFilters] = useState({ min: '0', max: 'Infinite' })
  
  const update_filters = (toggled_filter, e) => {
    const value = e.target.value
    setFilters(prev_filters => {
      const new_filters = { ...prev_filters }
      new_filters[toggled_filter] = value
      return new_filters
    })
  }

  useEffect(_ => {
    on_update({
      min: filters.min.match(/^[0-9.]+$/) && filters.min !== '0' ? BigNumber(filters.min) : null,
      max: filters.max.match(/^[0-9.]+$/) ? BigNumber(filters.max) : null
    })
  }, [filters, on_update])

  return (
    <div className="transfer-amount-filter filter-section">
      <div className="filter-label">
        Filter by transfer amount
      </div>
      <div className="filters">
        <Form.Group as={Form.Row}>
          <Form.Label column sm="5">
            Min
          </Form.Label>
          <Col sm="7">
            <Form.Control value={filters.min} onChange={e => update_filters('min', e)}/>
          </Col>
        </Form.Group>

        <Form.Group as={Form.Row}>
          <Form.Label column sm="5">
            Max
          </Form.Label>
          <Col sm="7">
            <Form.Control value={filters.max} onChange={e => update_filters('max', e)}/>
          </Col>
        </Form.Group>
      </div>
    </div>
  )
}

export default React.memo(TransferAmountFilter)