import React from 'react'
import TOKEN_IMAGES from './token_images'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Etherscan from './etherscan'

const ExplorerTooltip = (
  <Tooltip id="explorer_tooltip">
    Open in explorer
  </Tooltip>
)

const TokenIcon = ({ address }) => (
  <OverlayTrigger placement="top" overlay={ExplorerTooltip}>
    <Button className="token-icon" variant="link" onClick={_ => Etherscan.link('token', address)}>
      <img src={(TOKEN_IMAGES[address] || TOKEN_IMAGES.thinking).src}></img>
    </Button>
  </OverlayTrigger>
)

export default React.memo(TokenIcon)
