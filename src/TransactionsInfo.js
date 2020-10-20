import React from 'react'
import { VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import TransactionInfo from './TransactionInfo'

const TABLE_SIZE_IN_PIXELS = 200,
      TX_TITLE_HEIGHT = 26,
      TRANSFER_HEIGHT = 26

const TransactionsInfo = ({ element }) => {
  const by_tx = {}
  for (const t of element.filtered_transfers) {
    by_tx[t.transaction_hash] = by_tx[t.transaction_hash] || []
    by_tx[t.transaction_hash].push(t)
  }

  const entries = Object.entries(by_tx)

  const get_tx_height = index => TX_TITLE_HEIGHT + TRANSFER_HEIGHT * entries[index][1].length

  const Row = ({ index, style }) => <TransactionInfo style={style} key={index} hash={entries[index][0]} transfers={entries[index][1]}/>

  const total_height = entries.reduce((out, _, i) => out + get_tx_height(i), 0)

  console.log(total_height)

  return (
    <div className="extra-info" style={{ height: Math.min(total_height, TABLE_SIZE_IN_PIXELS) }}>
      <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={entries.length}
              itemSize={get_tx_height}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
    </div>
  )
}

export default React.memo(TransactionsInfo)