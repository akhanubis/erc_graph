import React from 'react'
import './css/filters_count.css'

const FiltersCount = ({ token_filter, from_to_tx_filter, from_to_transfer_filter }) => {
  let active_count = 0
  if (Object.values(token_filter).some(f => f))
    active_count++
  if (Object.values(from_to_tx_filter).some(f => f))
    active_count++
  if (Object.values(from_to_transfer_filter).some(f => f))
    active_count++

  if (active_count)
    return <div className="filters-count">
      {active_count} active filter{active_count > 1 ? 's' : ''}
    </div>
}

export default React.memo(FiltersCount)