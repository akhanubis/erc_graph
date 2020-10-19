import React, { PureComponent } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import BalanceInfo from './BalanceInfo'
import TransfersInfo from './TransfersInfo'
// import TransactionsInfo from './TransactionsInfo'
import Etherscan from './etherscan'

const WIDTH = 350

class ElementInfo extends PureComponent {
  identifier = _ => this.props.element.identifier

  copy_identifier = address => {
    this.clipboard_input.value = address
    this.clipboard_input.select()
    document.execCommand('copy')
  }

  copy_tooltip = (
    <Tooltip id="copy_tooltip">
      Copy to clipboard
    </Tooltip>
  )

  explorer_tooltip = (
    <Tooltip id="explorer_tooltip">
      Open in explorer
    </Tooltip>
  )
  
  links = address => (
    <span>
      <OverlayTrigger placement="bottom" overlay={this.copy_tooltip}>
        <Button variant="link" onClick={_ => this.copy_identifier(address)}>
          <i className='fas fa-copy'/>
        </Button>
      </OverlayTrigger>
      <OverlayTrigger placement="bottom" overlay={this.explorer_tooltip}>
        <Button variant="link" onClick={_ => Etherscan.link('address', address)}>
          <i className='fas fa-external-link-alt'/>
        </Button>
      </OverlayTrigger>
    </span>
  )

  projected_height = _ => {
    let projected = 68
    if (this.props.element.hash)
      projected += 22
    return projected
  }

  transform_coords = coords => {
    const [x, y] = this.props.transformation_matrix.apply([coords.x, coords.y])
    return {
      x,
      y
    }
  }

  tooltip_coords = _ => {
    let coords
    if (this.props.element.source) {
      const s_c = this.transform_coords(this.props.element.source),
            t_c = this.transform_coords(this.props.element.target)
      coords = {
        x: 0.5 * (s_c.x + t_c.x),
        y: 0.5 * (s_c.y + t_c.y)
      }
    }
    else
      coords = this.transform_coords(this.props.element)
    coords.x = Math.max(0, Math.min(coords.x, this.props.viewport_size.width - WIDTH))
    coords.y = Math.max(0, Math.min(coords.y, this.props.viewport_size.height - this.projected_height()))
    return coords
  }

  render() {
    if (!this.props.element || this.props.hidden)
      return null
    const coords = this.tooltip_coords()
    return (
      <div className="element-info-container" style={{ top: `${ coords.y }px`, left: `${ coords.x }px` }}>
        {(this.props.element.identifiers || []).map(address => (
          <div key={address}>
            <div className='element-identifier'>
              <div className="legend">
                <div className="element-label">
                  {address}
                </div>
              </div>
              <div className="after-legend">
                {this.links(address)}
              </div>
            </div>
            <BalanceInfo node={this.props.element}/>
            <TransfersInfo link={this.props.element} address={address}/>
          </div>
        ))}
        {/*<TransactionsInfo link={this.props.element} address={address}/> */}
        <textarea className="address-clipboard" readOnly={true} ref={t => this.clipboard_input = t}/>
      </div>
    )
  }
}

export default ElementInfo