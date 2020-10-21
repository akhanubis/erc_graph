import React from 'react'
import HashFilter from './HashFilter'

const FromToTxFilter = ({ filters, on_update }) => <HashFilter filters={filters} on_update={on_update} title="Filter by Ethereum transaction from and to addresses (one address per line)"/>

export default React.memo(FromToTxFilter)