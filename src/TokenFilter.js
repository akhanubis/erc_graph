import React from 'react'
import HashFilter from './HashFilter'
import { Form } from 'react-bootstrap'

const TokenFilter = ({ filters, on_update, show_every_token_on_link, on_show_every_token_on_link_update }) => (
  <HashFilter filters={filters} on_update={on_update} title="Filter by token addresses (one address or symbol per line)">
    <Form.Check type="checkbox" label="Show other tokens transferred between the same addresses" checked={show_every_token_on_link} onChange={e => on_show_every_token_on_link_update(e.target.checked)}/>
  </HashFilter>
)

export default React.memo(TokenFilter)