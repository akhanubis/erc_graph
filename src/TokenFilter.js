import React from 'react'
import HashFilter from './HashFilter'

const TokenFilter = ({ filters, on_update }) => <HashFilter filters={filters} on_update={on_update} title="Filter by token addresses (one address per line)"/>

export default React.memo(TokenFilter)