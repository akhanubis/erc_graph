import React from 'react'
import HashFilter from './HashFilter'

const FromToTransferFilter = ({ filters, on_update }) => <HashFilter filters={filters} on_update={on_update} title="Filter by ERC20 transfer sender and receiver (one address per line)"/>

export default React.memo(FromToTransferFilter)