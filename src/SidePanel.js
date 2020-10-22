import React, { useState, useEffect, useRef } from 'react'
import { Button, Card, OverlayTrigger, Tooltip, Accordion } from 'react-bootstrap'
import { ElementQueries, ResizeSensor } from 'css-element-queries'
import Metrics from './metrics'
import TokenFilter from './TokenFilter'
import FromToTransferFilter from './FromToTransferFilter'
import FromToTxFilter from './FromToTxFilter'
import TransferAmountFilter from './TransferAmountFilter'
import CustomLabels from './CustomLabels'
import isTouchDevice from './is_touch_device'
import FiltersCount from './FiltersCount'
import './css/side_panel.css'
import Logo from './assets/logo.png'

const DesktopOnlyOverlayTrigger = props => {
  if (isTouchDevice())
    return props.children
  return React.createElement(OverlayTrigger, props)
}

const SidePanel = ({
  token_filter,
  on_token_filter_update,
  show_every_token_on_link,
  on_show_every_token_on_link_update,
  from_to_transfer_filter,
  on_from_to_transfer_filter_update,
  from_to_tx_filter,
  on_from_to_tx_filter_update,
  transfer_amount_filter,
  on_transfer_amount_filter_update,
  custom_labels,
  on_custom_labels_update,
  start_block,
  end_block,
  transfers_count,
  addresses_count,
  total_transfers_count,
  total_addresses_count,
  on_reset_view
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const panelRef = useRef()
  const [cardsRefs, _] = useState([])
  
  useEffect(_ => {
    if (window.innerWidth < 700 ) setCollapsed(true)
  }, [])

  useEffect(_ => {
    ElementQueries.init()
  }, [])

  useEffect(_ => {
    new ResizeSensor(panelRef.current, ({ height }) => {
      for (const card of cardsRefs)
        card.style.height = `calc(${ height }px - 3 * 49px)`
    })
  }, [])

  return (
    <div className={`sidebar foreground ${ collapsed ? 'collapsed' : '' }`}>
      <DesktopOnlyOverlayTrigger placement="right" overlay={<Tooltip>Hide menu</Tooltip>}>
        <button type="button" className="sidebar-btn collapser btn btn-primary btn-sm" onClick={_ => setCollapsed(true)}>
          <i className="fas fa-caret-left"/>
        </button>
      </DesktopOnlyOverlayTrigger>
      <DesktopOnlyOverlayTrigger placement="right" overlay={<Tooltip>Reset view</Tooltip>}>
        <button type="button" className="sidebar-btn reset-view btn btn-primary btn-sm" onClick={_ => on_reset_view()}>
          <i className="fas fa-expand"/>
        </button>
      </DesktopOnlyOverlayTrigger>
      <DesktopOnlyOverlayTrigger placement="right" overlay={<Tooltip>Back to home</Tooltip>}>
        <button type="button" className="sidebar-btn back-home btn btn-primary btn-sm" onClick={_ => window.location.href = '/'}>
          <i className="fas fa-reply"/>
        </button>
      </DesktopOnlyOverlayTrigger>
      <DesktopOnlyOverlayTrigger placement="right" overlay={<Tooltip>Show menu</Tooltip>}>
        <button type="button" className="sidebar-btn expander btn btn-primary btn-sm" onClick={_ => setCollapsed(false)}>
          <i className="fas fa-bars"/>
        </button>
      </DesktopOnlyOverlayTrigger>
      <div className="content">
        <Accordion defaultActiveKey="info" className="sections-accordion" ref={panelRef}>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="info">
                Info
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="info">
              <Card.Body ref={e => cardsRefs[0] = e}>
                <p>
                  ERCGraph is an interactive analysis and visualization tool showing ERC-20 transfers accross the Ethereum network
                </p>
                <div className="info-section">
                  <p><span className="highlight">Transfers</span> are represented by lines and icons representing the tokens being transferred</p>
                  <p><span className="highlight">EOA addresses</span> are represented by <i style={{ color: '#6FC6E8'}} className='fas fa-circle'/> and <span className="highlight">smart contracts</span> by <i style={{ color: '#2099C9'}} className='fas fa-circle'/>. Different colors are used to categorize addresses that belong to certain well known protocols and entities of the space</p>
                  <p>To filter the data being displayed by several different criterias, head over to the <span className="highlight">Filters</span> section below. If, instead, you want to try graphing a completely different set of transfers, go <span className="highlight">back</span> and start again</p>
                  <p>You can move elements around by drag and dropping, zoom in and out using the mouse wheel, and pan in any direction by holding the mouse wheel</p>
                  <p>To quickly look up an element in a chain explorer, click it and use the "Copy to clipboard" and "Open in explorer" links</p>
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="filters" className="filters-panel-title">
                Filters <FiltersCount token_filter={token_filter} from_to_tx_filter={from_to_tx_filter} from_to_transfer_filter={from_to_transfer_filter}/>
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="filters">
              <Card.Body ref={e => cardsRefs[1] = e}>
                <div className="filters-container">
                  <TokenFilter
                    filters={token_filter}
                    on_update={on_token_filter_update}
                    show_every_token_on_link={show_every_token_on_link}
                    on_show_every_token_on_link_update={on_show_every_token_on_link_update}
                  />
                  <FromToTxFilter
                    filters={from_to_tx_filter}
                    on_update={on_from_to_tx_filter_update}
                  />
                  <FromToTransferFilter
                    filters={from_to_transfer_filter}
                    on_update={on_from_to_transfer_filter_update}
                  />
                  <TransferAmountFilter
                    filters={transfer_amount_filter}
                    on_update={on_transfer_amount_filter_update}
                  />
                  <CustomLabels
                    custom_labels={custom_labels}
                    on_update={on_custom_labels_update}
                  />
                </div>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="about">
                About
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="about">
              <Card.Body className="about-body" ref={e => cardsRefs[2] = e}>
                <div className="logo-container">
                  <img className="logo" src={Logo}/>
                </div>
                <p>
                  Created by <span className="weight-500">Pablo Bianciotto</span>
                  <DesktopOnlyOverlayTrigger placement="right" overlay={<Tooltip>Github</Tooltip>}>
                    <a href="https://github.com/akhanubis/erc_graph" target="_blank">
                      <i className="fab fa-github"/>
                    </a>
                  </DesktopOnlyOverlayTrigger>
                  <DesktopOnlyOverlayTrigger placement="right" overlay={<Tooltip>Linkedin</Tooltip>}>
                    <a href="https://www.linkedin.com/in/pablobianciotto/" target="_blank">
                      <i className="fab fa-linkedin"/>
                    </a>
                  </DesktopOnlyOverlayTrigger>
                </p>
                <p>
                  Inspired by <a href="https://etherblocks.live/" target="_blank">Etherblocks</a>
                </p>
                <p className="powered-by">
                  Data gathered using <a href="https://metamask.io/" target="_blank">Metamask</a>, <a href="https://www.pokt.network/" target="_blank">Pocket Network</a> and <a href="https://thegraph.com/" target="_blank">The Graph</a>
                </p>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
        <div className="block-info-container no-select">
          <Metrics start_block={start_block} end_block={end_block} transfers_count={transfers_count} addresses_count={addresses_count} total_transfers_count={total_transfers_count} total_addresses_count={total_addresses_count}/>
        </div>
      </div>
    </div>
  )
}

export default React.memo(SidePanel)