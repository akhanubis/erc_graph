import React from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import TokenBalance from './TokenBalance'

const ENTRY_HEIGHT = 26,
      TABLE_SIZE_IN_ENTRIES = 3

const TransfersInfo = ({ link, address }) => {
  if (!(link.type === 'link'))
    return null

  const entries = Object.entries(link[address === link.source_address ? 'filtered_source_amounts' : 'filtered_target_amounts'])

  const Row = ({ index, style }) => <TokenBalance style={style} key={index} address={entries[index][0]} balance={entries[index][1]}/>

  return (
    <div className="extra-info" style={{ height: Math.min(entries.length * ENTRY_HEIGHT, TABLE_SIZE_IN_ENTRIES * ENTRY_HEIGHT) }}>
      <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={entries.length}
              itemSize={ENTRY_HEIGHT}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
    </div>
  )
}

export default React.memo(TransfersInfo)