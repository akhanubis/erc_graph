import React from 'react'
import { Tooltip } from 'react-bootstrap'

const Etherscan = {
  link: (type, id) => window.open(`https://etherscan.io/${ type }/${ id }`, '_blank'),

  explorerTooltip: _ => (
    <Tooltip id="explorer_tooltip">
      Open in explorer
    </Tooltip>
  )
}

export default Etherscan