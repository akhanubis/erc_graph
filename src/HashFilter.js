import React from 'react'
import { Form } from 'react-bootstrap'

const HashFilter = ({ filters, on_update, title }) => {
  const as_string = Object.keys(filters).join("\n")

  const update_filters = e => {
    const as_hash = e.target.value.split("\n").map(a => a.trim()).filter(a => a).reduce((out, address) => ({ ...out, [address]: true }), {})
    on_update(as_hash)
  }

  return (
    <div className="filter-section">
      <div className="filter-label">
        {title}
      </div>
      <div className="filters-container">
        <Form.Control as="textarea" rows="3" value={as_string} onChange={update_filters}/>
      </div>
    </div>
  )
}

export default React.memo(HashFilter)