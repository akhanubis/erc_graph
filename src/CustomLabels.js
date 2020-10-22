import React, { useState } from 'react'
import { Form } from 'react-bootstrap'

const CustomLabels = ({ on_update }) => {
  const [input_value, set_input_value] = useState('')
  
  const update_filters = e => {
    const as_hash = e.target.value.split("\n").reduce((out, l) => {
      const fields = l.split(',')
      if (fields.length >= 2)
        out[fields[0].trim().toLowerCase()] = fields[1].trim()
      return out
    }, {})
    on_update(as_hash)
    set_input_value(e.target.value)
  }

  return (
    <div className="filter-section">
      <div className="filter-label">
        Custom address labels
      </div>
      <div className="filters-container">
        <Form.Control as="textarea" rows="3" value={input_value} onChange={update_filters}/>
      </div>
    </div>
  )
}

export default React.memo(CustomLabels)