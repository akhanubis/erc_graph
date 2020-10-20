import React from 'react'
import TransactionInfo from './TransactionInfo'

const TransactionsInfo = ({ element }) => {
  const by_tx = {}
  for (const t of element.filtered_transfers) {
    by_tx[t.transaction_hash] = by_tx[t.transaction_hash] || []
    by_tx[t.transaction_hash].push(t)
  }
  return (
    <div className="extra-info">
      {Object.entries(by_tx).map(([transaction_hash, transfers]) => <TransactionInfo key={transaction_hash} hash={transaction_hash} transfers={transfers}/>)}
    </div>
  )
}

export default TransactionsInfo