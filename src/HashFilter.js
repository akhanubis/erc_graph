import React, { useState } from 'react'
import { Form } from 'react-bootstrap'

const HashFilter = ({ filters, on_update, title }) => {
  const [input_value, set_input_value] = useState(Object.keys(filters).join("\n"))
  
  const update_filters = e => {
    const as_hash = e.target.value.split("\n").map(a => a.trim().toLowerCase()).filter(a => a).reduce((out, address) => ({ ...out, [address]: true }), {})
    on_update(as_hash)
    set_input_value(e.target.value)
  }

  return (
    <div className="filter-section">
      <div className="filter-label">
        {title}
      </div>
      <div className="filters-container">
        <Form.Control as="textarea" rows="3" value={input_value} onChange={update_filters}/>
      </div>
    </div>
  )
}

export default React.memo(HashFilter)