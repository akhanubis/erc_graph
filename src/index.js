import "regenerator-runtime/runtime.js"
import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { Form, Col, Button } from 'react-bootstrap'
import Web3 from 'web3'

import './css/bootstrap.min.css'
import './css/index.css'
import Logo from './assets/logo03.svg'

const App = _ => {
  const [from, set_from] = useState('')
  const [to, set_to] = useState('latest')
  const [latest_bn, set_latest_bn] = useState('')
  const [address, set_address] = useState('')
  const [ens, set_ens] = useState(false)
  const [protocol, set_protocol] = useState('')
  const [bin, set_bin] = useState('')
  const [hash, set_hash] = useState('')

  useEffect(_ => {
    const web3 = new Web3(POCKET_RPC_URL)
    const fetch_latest_bn = async _ => {
      const latest_bn = (await web3.eth.getBlock('latest')).number
      set_latest_bn(latest_bn)
    }
    fetch_latest_bn()
    setInterval(fetch_latest_bn, 10000)
  }, [])

  const link = `/graph.html?fromBlock=${ from }&toBlock=${ to }&logAddress=${ address }&ens=${ ens }&filterFromToTxProtocol=${ protocol }&bin=${ bin }&hash=${ hash }`

  return (
    <div className="main-outer">
      <div className="main">
        <h1>
          <img src={Logo}></img>
          <span className="title">ERCGraph</span>
        </h1>
        <div className="subtitle">
          Interactive analysis and visualization tool showing ERC-20 transfers accross the Ethereum network
        </div>
        <Form onSubmit={e => {
          e.preventDefault()
          window.location.href = link
        }}>
          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              Latest Block #
            </Form.Label>
            <Col sm="8">
              <Form.Control readOnly value={latest_bn}/>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              From Block #
            </Form.Label>
            <Col sm="8">
              <Form.Control value={from} onChange={e => set_from(e.target.value)}/>
              <Form.Text muted>
                Leave it empty to use latest block - 2
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              To Block #
            </Form.Label>
            <Col sm="8">
              <Form.Control value={to} onChange={e => set_to(e.target.value)}/>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              ERC20 Token Address
            </Form.Label>
            <Col sm="8">
              <Form.Control value={address} onChange={e => set_address(e.target.value)}/>
              <Form.Text muted>
                Leave it empty to show all tokens
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              Protocol/Known addresses
            </Form.Label>
            <Col sm="8">
              <Form.Control as="select" value={protocol} onChange={e => set_protocol(e.target.value)}>
                <option value="">No filter</option>
                <option value="one_inch">1Inch</option>
                <option value="uniswap">Uniswap</option>
                <option value="balancer">Balancer</option>
                <option value="sushiswap">Sushiswap</option>
                <option value="aave">Aave</option>
                <option value="curve">Curve.fi</option>
                <option value="compound">Compound</option>
                <option value="uma">UMA</option>
                <option value="dodo">DODO</option>
                <option value="binance">Binance</option>
              </Form.Control>
              <Form.Text muted>
                Leave it as No filter to show all txs and filter later
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              Use Reverse ENS
            </Form.Label>
            <Col sm="8">
              <Form.Check type="checkbox" checked={ens} onChange={e => set_ens(e.target.checked)}/>
              <Form.Text muted>
                Show .eth names for addresses with ENS names
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              Transactions to plot
            </Form.Label>
            <Col sm="8">
              <Form.Control value={hash} onChange={e => set_hash(e.target.value)}/>
              <Form.Text muted>
                If you want to plot a custom set of transactions, paste transactions hashes separated by comma
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Form.Row}>
            <Form.Label column sm="4">
              Batch Transactions to plot
            </Form.Label>
            <Col sm="8">
              <Form.Control value={bin} onChange={e => set_bin(e.target.value)}/>
              <Form.Text muted>
                If you want to plot a custom set of transactions, paste a pastebin url that contains a list of transaction hashes separated by new line (e. g. https://pastebin.com/4eNpUTiy)
              </Form.Text>
            </Col>
          </Form.Group>

          <div className="go-container">
            <Button variant="primary" type="submit">
              Go!
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('root'))